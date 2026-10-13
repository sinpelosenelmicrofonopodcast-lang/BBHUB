import {NextResponse} from 'next/server';import {cookies} from 'next/headers';
import {requestIsSameOrigin} from '@/lib/auth';import {opsActor} from '@/lib/operations-auth';
import {staffRoles,cleanEmail,opsIssueStaffInvite,opsStaffByEmail,audit} from '@/lib/operations-db';
export const runtime='nodejs';
export async function POST(request:Request){
 if(!requestIsSameOrigin(request))return new Response('Forbidden',{status:403});
 const actor=await opsActor();if(actor?.kind!=='owner')return new Response('Owner access required',{status:403});
 const f=await request.formData(),name=String(f.get('name')||'').trim(),email=cleanEmail(String(f.get('email')||'')),role=String(f.get('role')||'');
 if(name.length<2||name.length>120||email.length>254||!/^\S+@\S+\.\S+$/.test(email)||!staffRoles.includes(role as typeof staffRoles[number]))return new Response('Invalid invite',{status:400});
 if(await opsStaffByEmail(email))return new Response('Existing staff account: manage access instead of inviting again',{status:409});
 const all=String(f.get('allProjects'))==='yes';
 const token=await opsIssueStaffInvite(name,email,role as typeof staffRoles[number],all);
 await audit('owner',null,'invite_staff','staff_invite',null,{email,role,allProjects:all});
 (await cookies()).set('primecuts_staff_invite_flash',JSON.stringify({email,token}),{httpOnly:true,sameSite:'strict',secure:process.env.NODE_ENV==='production',path:'/operations',maxAge:240});
 return NextResponse.redirect(new URL('/operations/team',request.url),303);
}
