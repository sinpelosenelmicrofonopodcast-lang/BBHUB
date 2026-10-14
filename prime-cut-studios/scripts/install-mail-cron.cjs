const fs=require('node:fs');const path=require('node:path');
const dir='app/api/cron/mail';const file=path.join(dir,'route.ts');
if(fs.existsSync(file))throw Error('MAIL_CRON_ROUTE_ALREADY_EXISTS');
fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(file,`import {timingSafeEqual} from 'node:crypto';
import {drainMail} from '@/lib/email';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 const secret=process.env.CRON_SECRET;
 const received=Buffer.from(request.headers.get('authorization')||'');
 const expected=Buffer.from('Bearer '+(secret||''));
 if(!secret||received.length!==expected.length||!timingSafeEqual(received,expected))return new Response('Unauthorized',{status:401});
 try {
  const processed=await drainMail(10);
  return Response.json({processed},{headers:{'Cache-Control':'no-store'}});
 }catch{
  return Response.json({error:'MAIL_DISPATCH_FAILED'},{status:500,headers:{'Cache-Control':'no-store'}});
 }
}`);
const config='vercel.json';const data=JSON.parse(fs.readFileSync(config,'utf8'));const entry={path:'/api/cron/mail',schedule:'0 * * * *'};
data.crons=[...(data.crons||[]).filter(x=>x.path!==entry.path),entry];
fs.writeFileSync(config,JSON.stringify(data,null,2)+'\n');
console.log('MAIL_CRON_INSTALLED');
