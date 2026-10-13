import {NextResponse} from 'next/server';
import {requestIsSameOrigin,safeIp} from '@/lib/auth';
import {identifyIp} from '@/lib/db';
import {cleanEmail,opsStaffByEmail,opsAttemptLimited,opsTrackAttempt} from '@/lib/operations-db';
import {setStaffCookie,verifyOpsPassword} from '@/lib/operations-auth';
export const runtime='nodejs';
export async function POST(request:Request){
 if(!requestIsSameOrigin(request))return new Response('Forbidden',{status:403});
 const form=await request.formData();const email=cleanEmail(String(form.get('email')||'')),pw=String(form.get('password')||'');
 if(email.length>254||pw.length>128)return new Response('Invalid input',{status:400});
 const ip=identifyIp(safeIp(request));if(await opsAttemptLimited(ip,'staff-login',8))return new Response('Too many attempts',{status:429});
 const user=await opsStaffByEmail(email);
 if(!user||user.disabled||!verifyOpsPassword(pw,user.password_hash)){await opsTrackAttempt(ip,'staff-login');return new Response('Invalid credentials',{status:401});}
 await setStaffCookie(user);return NextResponse.redirect(new URL('/operations',request.url),303);
}
