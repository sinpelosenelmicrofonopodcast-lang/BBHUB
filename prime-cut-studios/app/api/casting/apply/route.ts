import {NextResponse} from 'next/server';import {requestIsSameOrigin,safeIp} from '@/lib/auth';
import {normalizedEmail,identifyIp} from '@/lib/db';
import {castingById,castingApplyCount,applyCasting} from '@/lib/operations-db';
export const runtime='nodejs';
function safeUrl(v:string){if(!v)return true;try{const u=new URL(v);return u.protocol==='https:'&&!u.username&&!u.password&&u.hostname!=='localhost'&&!/^(127\.|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(u.hostname)}catch{return false}}
export async function POST(req:Request){
 if(!requestIsSameOrigin(req))return new Response('Forbidden',{status:403});
 if(Number(req.headers.get('content-length')||0)>14000)return new Response('Request too large',{status:413});
 const f=await req.formData();
 if(String(f.get('website')||'').trim())return NextResponse.redirect(new URL('/casting?sent=1',req.url),303);
 const id=String(f.get('callId')||''),name=String(f.get('fullName')||'').trim(),email=normalizedEmail(String(f.get('email')||'')),phone=String(f.get('phone')||'').trim(),city=String(f.get('city')||'').trim(),portfolio=String(f.get('portfolioUrl')||'').trim(),headshot=String(f.get('headshotUrl')||'').trim(),experience=String(f.get('experience')||'').trim(),availability=String(f.get('availability')||'').trim();
 if(!/^[\da-f-]{36}$/i.test(id)||name.length<2||name.length>140||!/^(\S+)@(\S+)\.(\S+)$/.test(email)||email.length>254||phone.length>40||city.length>100||portfolio.length>500||headshot.length>500||experience.length>1800||availability.length>500||!safeUrl(portfolio)||!safeUrl(headshot)||(String(f.get('consent'))!=='yes'||String(f.get('adult'))!=='yes'))return new Response('Invalid application',{status:400});
 const call=await castingById(id,true);if(!call||call.closes_at&&Date.parse(call.closes_at)<Date.now())return new Response('Casting not open',{status:410});
 const hash=identifyIp(safeIp(req));if((await castingApplyCount(hash)).length>=5)return new Response('Too many applications',{status:429});
 try{await applyCasting({casting_call_id:id,full_name:name,email,phone:phone||null,city:city||null,portfolio_url:portfolio||null,headshot_url:headshot||null,experience:experience||null,availability:availability||null,consent_at:new Date().toISOString(),ip_hash:hash});}
 catch{return new Response('Application already submitted or temporarily unavailable',{status:409});}
 return NextResponse.redirect(new URL('/casting?sent=1',req.url),303);
}