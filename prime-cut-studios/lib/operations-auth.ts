/** AuthN & policy live server-side. No staff cookie authorizes owner admin routes. */
import {cookies} from 'next/headers';
import {createHmac,randomBytes,scryptSync,timingSafeEqual} from 'node:crypto';
import {adminAuthenticated} from '@/lib/auth';
import {opsStaffById,opsTalentById,opsAssignedStaff,type Staff,type StaffRole,type Talent} from '@/lib/operations-db';
const SECRET=()=>process.env.SESSION_SECRET||'';
const STAFF_COOKIE='primecuts_ops_staff',TALENT_COOKIE='primecuts_ops_talent';
const TTL=12*60*60;
function sign(s:string){return createHmac('sha256',SECRET()).update(s).digest('base64url');}
export function hashOpsPassword(pw:string){if(pw.length<12||pw.length>128)throw Error('INVALID_PASSWORD');const salt=randomBytes(24);return `scrypt$${salt.toString('base64url')}$${scryptSync(pw,salt,64).toString('base64url')}`;}
export function verifyOpsPassword(pw:string,hash:string){try{const [m,s,e]=hash.split('$');if(m!=='scrypt'||!s||!e||pw.length>128)return false;const a=Buffer.from(e,'base64url');return a.length===64&&timingSafeEqual(a,scryptSync(pw,Buffer.from(s,'base64url'),64));}catch{return false;}}
async function issue(cookie:string,id:string,version:number){if(SECRET().length<32)throw Error('SESSION_SECRET_REQUIRED');const value=Buffer.from(JSON.stringify({id,version,until:Date.now()+TTL*1000})).toString('base64url');(await cookies()).set(cookie,`${value}.${sign(value)}`,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:TTL});}
async function read(cookie:string):Promise<{id:string;version:number}|null>{if(SECRET().length<32)return null;const raw=(await cookies()).get(cookie)?.value;if(!raw||raw.length>550)return null;const [value,sig,...rest]=raw.split('.');if(!value||!sig||rest.length)return null;const expected=Buffer.from(sign(value)),actual=Buffer.from(sig);if(actual.length!==expected.length||!timingSafeEqual(actual,expected))return null;try{const data=JSON.parse(Buffer.from(value,'base64url').toString('utf8'));return typeof data.id==='string'&&typeof data.version==='number'&&typeof data.until==='number'&&data.until>Date.now()?{id:data.id,version:data.version}:null;}catch{return null;}}
export async function setStaffCookie(staff:Staff){await issue(STAFF_COOKIE,staff.id,staff.session_version);}
export async function setTalentCookie(talent:Talent){await issue(TALENT_COOKIE,talent.id,talent.session_version);}
export async function opsLogout(cookie:'staff'|'talent'){(await cookies()).delete(cookie==='staff'?STAFF_COOKIE:TALENT_COOKIE);}
export type Actor={kind:'owner';id:null;role:'owner';name:string}|{kind:'staff';id:string;role:StaffRole;name:string;all_projects:boolean};
export async function opsActor():Promise<Actor|null>{
 if(await adminAuthenticated())return {kind:'owner',id:null,role:'owner',name:'Owner'};
 const c=await read(STAFF_COOKIE);if(!c)return null;const s=await opsStaffById(c.id);
 return s&&!s.disabled&&s.session_version===c.version?{kind:'staff',id:s.id,role:s.role,name:s.name,all_projects:s.all_projects}:null;
}
export async function opsTalent():Promise<Talent|null>{const c=await read(TALENT_COOKIE);if(!c)return null;const x=await opsTalentById(c.id);return x&&!x.disabled&&x.session_version===c.version?x:null;}
export type Area='projects'|'casting'|'tasks'|'schedule'|'creative'|'media'|'finance'|'documents'|'contracts'|'team'|'audit';
const POLICY:Record<StaffRole,Area[]>={
 manager:['projects','casting','tasks','schedule','creative','media','finance','documents','contracts','audit'],
 secretary:['projects','casting','tasks','schedule','creative','documents','contracts'],
 producer:['projects','casting','tasks','schedule','creative','media','documents','contracts'],
 editor:['tasks','creative','media'],crew:['tasks','schedule'],
 accountant:['finance','documents','contracts'],casting:['casting','creative','schedule']
};
export function canArea(actor:Actor|null,area:Area){return !!actor&&(actor.kind==='owner'||POLICY[actor.role].includes(area));}
export async function canProject(actor:Actor|null,projectId:string){if(!actor)return false;if(actor.kind==='owner')return true;return actor.all_projects||await opsAssignedStaff(actor.id,projectId);}
export function areaForCategory(cat:string):Area|undefined {const a:Record<string,Area>={task:'tasks',schedule:'schedule',location:'creative',lookbook:'creative',crew:'tasks',media:'media',budget:'finance',document:'documents',contract:'contracts',approval:'projects',message:'projects'};return a[cat];}
