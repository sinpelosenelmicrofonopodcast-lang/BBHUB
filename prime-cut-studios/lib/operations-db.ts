/** PrimeCuts Operations: privileged persistence. Import only in server files. */
import {randomBytes,randomUUID,createHash} from 'node:crypto';
const endpoint=()=>process.env.SUPABASE_URL||'';
const key=()=>process.env.SUPABASE_SECRET_KEY||'';
export const sha256=(value:string)=>createHash('sha256').update(value).digest('hex');
export const cleanEmail=(value:string)=>value.trim().toLowerCase();
export function safeHttps(value:string):string|null {
 if(!value.trim())return null;
 try{const u=new URL(value.trim());return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&u.toString().length<=1000?u.toString():null;}catch{return null;}
}
function headers(extra:Record<string,string>={}){
 const k=key();if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(endpoint())||k.length<20)throw Error('OPS_DB_UNCONFIGURED');
 return {apikey:k,...(k.startsWith('sb_secret_')?{}:{Authorization:`Bearer ${k}`}), 'Content-Type':'application/json',...extra};
}
export async function opsFetch<T>(path:string,init:RequestInit={}):Promise<T>{
 const response=await fetch(endpoint()+path,{...init,cache:'no-store',headers:headers(init.headers as Record<string,string>||{})});
 if(!response.ok)throw Error(`OPS_DB_${response.status}: ${(await response.text()).slice(0,240)}`);
 if(response.status===204)return null as T;
 return response.json() as Promise<T>;
}
export async function opsList<T>(table:string,filter:Record<string,string>={}):Promise<T[]>{
 return opsFetch<T[]>(`/rest/v1/${table}?${new URLSearchParams({select:'*',...filter}).toString()}`);
}
export async function opsOne<T>(table:string,filter:Record<string,string>):Promise<T|null>{
 const data=await opsList<T>(table,{...filter,limit:'1'});return data[0]||null;
}
export async function opsInsert<T>(table:string,row:Record<string,unknown>):Promise<T>{
 const data=await opsFetch<T[]>(`/rest/v1/${table}?select=*`,{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify(row)});
 if(data.length!==1)throw Error('OPS_INSERT_MISSING');return data[0];
}
export async function opsPatch<T>(table:string,filter:Record<string,string>,data:Record<string,unknown>):Promise<T|null>{
 const rows=await opsFetch<T[]>(`/rest/v1/${table}?${new URLSearchParams({select:'*',...filter})}`,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify(data)});
 return rows[0]||null;
}
export type StaffRole='manager'|'secretary'|'producer'|'editor'|'crew'|'accountant'|'casting';
export const staffRoles:StaffRole[]=['manager','secretary','producer','editor','crew','accountant','casting'];
export type Staff={id:string;name:string;email:string;password_hash:string;role:StaffRole;disabled:boolean;all_projects:boolean;session_version:number};
export type Talent={id:string;name:string;email:string;password_hash:string;phone:string|null;location:string|null;portfolio_url:string|null;disabled:boolean;session_version:number;email_verified:boolean};
export type Casting={id:string;project_id:string|null;slug:string;title:string;description:string;requirements:string;location:string;compensation:string;closes_at:string|null;status:'draft'|'open'|'closed';created_at:string};
export type Application={id:string;casting_id:string;talent_id:string;intro:string;audition_url:string|null;status:string;created_at:string};
export type TalentMessage={id:string;application_id:string;talent_id:string;author_type:'talent'|'staff';author_id:string|null;message:string;created_at:string};
export const itemCategories=['task','schedule','location','lookbook','crew','media','budget','document','contract','approval','message'] as const;
export type ItemCategory=typeof itemCategories[number];
export const itemStatuses=['pending','in_progress','review','approved','changes','completed','cancelled'] as const;
export type OpsItem={id:string;project_id:string;category:ItemCategory;title:string;detail:string;reference_url:string|null;amount_cents:number|null;due_at:string|null;status:string;visible_client:boolean;visible_team:boolean;assigned_staff_id:string|null;created_at:string};
export type OpsComment={id:string;item_id:string;author_type:string;author_id:string|null;message:string;visible_client:boolean;created_at:string};
export function validUuid(s:string){return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);}
export async function audit(actorType:string,actorId:string|null,action:string,entity:string,entityId:string|null,meta:Record<string,unknown>={}){
 await opsInsert('pc_ops_audit',{actor_type:actorType,actor_id:actorId,action,entity,entity_id:entityId,metadata:meta});
}
export async function opsStaffByEmail(email:string){return opsOne<Staff>('pc_ops_staff',{email:`eq.${cleanEmail(email)}`});}
export async function opsStaffById(id:string){return opsOne<Staff>('pc_ops_staff',{id:`eq.${id}`});}
export async function opsTalentByEmail(email:string){return opsOne<Talent>('pc_ops_talents',{email:`eq.${cleanEmail(email)}`});}
export async function opsTalentById(id:string){return opsOne<Talent>('pc_ops_talents',{id:`eq.${id}`});}
export async function opsIssueStaffInvite(name:string,email:string,role:StaffRole,all:boolean){
 const token=randomBytes(32).toString('base64url');
 await opsInsert('pc_ops_staff_invites',{token_hash:sha256(token),name,email:cleanEmail(email),role,all_projects:all,expires_at:new Date(Date.now()+7*86400000).toISOString()});
 return token;
}
export async function opsRedeemStaffInvite(token:string,hash:string){
 if(!/^[A-Za-z0-9_-]{43}$/.test(token))return null;
 const rows=await opsFetch<Array<{staff_id:string}>>('/rest/v1/rpc/pc_ops_redeem_staff_invite',{method:'POST',body:JSON.stringify({p_token_hash:sha256(token),p_password_hash:hash})});
 return rows[0]?.staff_id||null;
}
export async function opsAttemptLimited(ipHash:string,area:string,limit:number){
 const rows=await opsList<{id:number}>('pc_ops_login_attempts',{ip_hash:`eq.${ipHash}`,area:`eq.${area}`,occurred_at:`gte.${new Date(Date.now()-15*60000).toISOString()}`,select:'id',limit:String(limit)});
 return rows.length>=limit;
}
export async function opsTrackAttempt(ipHash:string,area:string){await opsInsert('pc_ops_login_attempts',{ip_hash:ipHash,area});}
export async function opsAssignedStaff(id:string,projectId:string){
 return !!await opsOne('pc_ops_staff_projects',{staff_id:`eq.${id}`,project_id:`eq.${projectId}`});
}
export async function opsPublicCastings(){return opsList<Casting>('pc_ops_castings',{status:'eq.open',order:'created_at.desc',limit:'50'});}
export async function opsCastingBySlug(slug:string){return opsOne<Casting>('pc_ops_castings',{slug:`eq.${slug}`,status:'eq.open'});}
export async function opsProjectItems(projectId:string,client=false){return opsList<OpsItem>('pc_ops_items',{project_id:`eq.${projectId}`,...(client?{visible_client:'eq.true'}:{}),order:'created_at.desc',limit:'250'});}
export async function opsComments(id:string,client=false){return opsList<OpsComment>('pc_ops_comments',{item_id:`eq.${id}`,...(client?{visible_client:'eq.true'}:{}),order:'created_at.asc',limit:'200'});}
export async function opsSignatureHash(item:OpsItem){
 return sha256(JSON.stringify({id:item.id,project:item.project_id,title:item.title,detail:item.detail,created_at:item.created_at}));
}
export function randomId(){return randomUUID();}
