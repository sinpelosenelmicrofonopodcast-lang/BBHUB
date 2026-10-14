const fs=require('node:fs');
const path=require('node:path');
const emailPath='lib/email.ts';
if(!fs.existsSync(emailPath))throw new Error('MAIL_SOURCE_NOT_FOUND');
let source=fs.readFileSync(emailPath,'utf8');
for(const [key,fallback] of Object.entries({MAIL_SMTP_HOST:'SMTP_HOST',MAIL_SMTP_PORT:'SMTP_PORT',MAIL_SMTP_USER:'SMTP_USER',MAIL_SMTP_PASSWORD:'SMTP_PASS',MAIL_SMTP_FROM:'SMTP_FROM',MAIL_FROM:'SMTP_FROM'})){
 const needle='process.env.'+key;
 if(source.includes(needle))source=source.replaceAll(needle,'(process.env.'+key+' || process.env.'+fallback+')');
}
if(!source.includes('process.env.SMTP_PASS'))throw new Error('SMTP_PASSWORD_MAPPING_FAILED');
fs.writeFileSync(emailPath,source);
const route='app/api/cron/mail/route.ts';
if(fs.existsSync(route))throw new Error('MAIL_ROUTE_ALREADY_EXISTS');
fs.mkdirSync(path.dirname(route),{recursive:true});
const lines=[
"import {timingSafeEqual} from 'node:crypto';",
"import {drainMail} from '@/lib/email';",
"export const runtime='nodejs';",
"export const dynamic='force-dynamic';",
"export async function GET(request:Request){",
" const secret=process.env.CRON_SECRET;",
" if(!secret)return new Response('Unavailable',{status:503});",
" const a=Buffer.from(request.headers.get('authorization')||'');",
" const b=Buffer.from('Bearer '+secret);",
" if(a.length!==b.length||!timingSafeEqual(a,b))return new Response('Unauthorized',{status:401});",
" try{const processed=await drainMail(5);return Response.json({processed},{headers:{'Cache-Control':'no-store'}});}",
" catch{return Response.json({error:'dispatch_failed'},{status:500,headers:{'Cache-Control':'no-store'}});}",
"}"
];
fs.writeFileSync(route,lines.join('\n')+'\n');
console.log('PRIMECUTS_SMTP_FIX_AND_QUEUE_ROUTE_READY');
const configPath='vercel.json';
const cfg=JSON.parse(fs.readFileSync(configPath,'utf8'));
cfg.crons=[...(cfg.crons||[]).filter(x=>x.path!=='/api/cron/mail'),{path:'/api/cron/mail',schedule:'30 5 * * *'}];
fs.writeFileSync(configPath,JSON.stringify(cfg,null,2)+'\n');
console.log('VERCEL_MAIL_CRON_READY');
