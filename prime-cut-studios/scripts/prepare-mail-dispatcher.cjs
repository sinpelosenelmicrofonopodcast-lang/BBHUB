'use strict';
const fs=require('node:fs'); const path=require('node:path');
const mail='lib/email.ts';
if(!fs.existsSync(mail))throw Error('SAFE_STOP: mail source absent');
let source=fs.readFileSync(mail,'utf8');
const pairs={MAIL_SMTP_HOST:'SMTP_HOST',MAIL_SMTP_USER:'SMTP_USER',MAIL_SMTP_PASSWORD:'SMTP_PASS',MAIL_SMTP_PORT:'SMTP_PORT',MAIL_SMTP_FROM:'SMTP_FROM',MAIL_FROM:'SMTP_FROM'};
const found=[];
for(const [expected,configured] of Object.entries(pairs)){
  const key='process.env.'+expected;
  if(source.includes(key)){source=source.replaceAll(key,'(process.env.'+expected+' || process.env.'+configured+')');found.push(expected);}
}
if(!found.includes('MAIL_SMTP_HOST')||!found.includes('MAIL_SMTP_USER')||!found.includes('MAIL_SMTP_PASSWORD'))throw Error('SAFE_STOP: unexpected mail implementation');
fs.writeFileSync(mail,source);
const route='app/api/cron/mail/route.ts';
if(fs.existsSync(route))throw Error('SAFE_STOP: existing dispatch route');
fs.mkdirSync(path.dirname(route),{recursive:true});
fs.writeFileSync(route,String.raw\`import {timingSafeEqual} from 'node:crypto';
import {drainMail} from '@/lib/email';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request:Request) {
 const secret=process.env.CRON_SECRET;
 if(!secret)return new Response('Not configured',{status:503});
 const received=Buffer.from(request.headers.get('authorization')||'');
 const expected=Buffer.from('Bearer '+secret);
 if(received.length!==expected.length||!timingSafeEqual(received,expected))return new Response('Unauthorized',{status:401});
 try {
   const processed=await drainMail(5);
   return Response.json({processed},{headers:{'Cache-Control':'no-store'}});
 }catch {
   return Response.json({error:'Email processing failed'},{status:500,headers:{'Cache-Control':'no-store'}});
 }
}\`);
console.log('SAFE_PATCH_READY:',found.join(','),'dispatch auth enabled');
