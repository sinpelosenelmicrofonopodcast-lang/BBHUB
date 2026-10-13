import {NextResponse} from 'next/server';import {requestIsSameOrigin,safeIp} from '@/lib/auth';import {identifyIp} from '@/lib/db';
import {cleanEmail,opsTalentByEmail,opsAttemptLimited,opsTrackAttempt} from '@/lib/operations-db';import {verifyOpsPassword,setTalentCookie} from '@/lib/operations-auth';
export const runtime='nodejs';
export async function POST(request:Request){
 if(!requestIsSameOrigin(request))return new Response('Forbidden',{status:403});
 const f=await request.formData(),email=cleanEmail(String(f.get('email')||'')),password=String(f.get('password')||'');
 const ip=identifyIp(safeIp(request));if(await opsAttemptLimited(ip,'talent-login',8))return new Response('Too many attempts',{status:429});
 const talent=await opsTalentByEmail(email);if(!talent||talent.disabled||!verifyOpsPassword(password,talent.password_hash)){await opsTrackAttempt(ip,'talent-login');return new Response('Invalid credentials',{status:401});}
 await setTalentCookie(talent);return NextResponse.redirect(new URL('/talent',request.url),303);
}
