import {NextResponse} from 'next/server';import {cookies} from 'next/headers';
import {adminAuthenticated,requestIsSameOrigin} from '@/lib/auth';
import {createStaffInvite,audit} from '@/lib/operations-db';
import {getProject,normalizedEmail} from '@/lib/db';import {staffRoleValid} from '@/lib/operations-policy';
export const runtime='nodejs';
export async function POST(req:Request){
 if(!requestIsSameOrigin(req)||!await adminAuthenticated())return new Response('Forbidden',{status:403});
 const f=await req.formData(),email=normalizedEmail(String(f.get('email')||'')),role=String(f.get('role')||''),projectId=String(f.get('projectId')||'');
 if(!/^\S+@\S+\.\S+$/.test(email)||email.length>254||!staffRoleValid(role)||role==='owner'||(projectId&&!/^[\da-f-]{36}$/i.test(projectId)))return new Response('Invalid invite',{status:400});
 if(projectId&&!await getProject(projectId))return new Response('Unknown project',{status:404});
 const token=await createStaffInvite(email,role,projectId||null);
 const link=new URL('/team/activate/'+token,req.url).toString();
 (await cookies()).set('primecuts_staff_flash',JSON.stringify({link}),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/team',maxAge:300});
 await audit('staff.invite','staff_invite',null,null,projectId||null,{role});
 return NextResponse.redirect(new URL('/team/staff',req.url),303);
}