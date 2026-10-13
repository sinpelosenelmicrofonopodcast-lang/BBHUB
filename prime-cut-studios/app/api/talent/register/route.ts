import {NextResponse} from 'next/server';import {requestIsSameOrigin,safeIp} from '@/lib/auth';import {identifyIp} from '@/lib/db';
import {cleanEmail,safeHttps,opsTalentByEmail,opsInsert,opsAttemptLimited,opsTrackAttempt,type Talent} from '@/lib/operations-db';
import {hashOpsPassword,setTalentCookie} from '@/lib/operations-auth';
export const runtime='nodejs';
export async function POST(request:Request){
 if(!requestIsSameOrigin(request))return new Response('Forbidden',{status:403});
 const f=await request.formData();if(String(f.get('company')||''))return new Response('Invalid submission',{status:400});
 const ip=identifyIp(safeIp(request));if(await opsAttemptLimited(ip,'talent-signup',4))return new Response('Too many attempts',{status:429});
 await opsTrackAttempt(ip,'talent-signup');
 const name=String(f.get('name')||'').trim(),email=cleanEmail(String(f.get('email')||'')),pw=String(f.get('password')||'');
 const phone=String(f.get('phone')||'').trim(),location=String(f.get('location')||'').trim(),portfolio=String(f.get('portfolio')||'').trim();
 if(name.length<2||name.length>120||!/^\S+@\S+\.\S+$/.test(email)||email.length>254||pw.length<12||pw.length>128||phone.length>50||location.length>140||portfolio.length>1000||portfolio&&!safeHttps(portfolio)||String(f.get('consent'))!=='yes')return new Response('Invalid profile. Read the privacy notice and provide consent.',{status:400});
 if(await opsTalentByEmail(email))return new Response('Account already exists. Please sign in.',{status:409});
 const talent=await opsInsert<Talent>('pc_ops_talents',{name,email,password_hash:hashOpsPassword(pw),phone:phone||null,location:location||null,portfolio_url:portfolio?safeHttps(portfolio):null});
 await setTalentCookie(talent);return NextResponse.redirect(new URL('/talent',request.url),303);
}
