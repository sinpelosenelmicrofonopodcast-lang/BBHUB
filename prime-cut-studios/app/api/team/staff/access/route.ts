import {NextResponse} from 'next/server';import {requestIsSameOrigin,adminAuthenticated} from '@/lib/auth';
import {adminDisableStaff} from '@/lib/operations-staff';
export const runtime='nodejs';
export async function POST(req:Request){
 if(!requestIsSameOrigin(req)||!await adminAuthenticated())return new Response('Forbidden',{status:403});
 const f=await req.formData(),accountId=String(f.get('accountId')||''),active=String(f.get('active')||'')==='1';
 if(!/^[\da-f-]{36}$/i.test(accountId))return new Response('Bad account',{status:400});
 await adminDisableStaff(accountId,active);
 return NextResponse.redirect(new URL('/team/staff',req.url),303);
}