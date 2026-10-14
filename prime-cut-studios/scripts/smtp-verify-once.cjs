/* One-time production SMTP smoke test. No credentials are printed or persisted. */
'use strict';
const fs=require('node:fs');
const {spawnSync}=require('node:child_process');
const required=['SMTP_HOST','SMTP_PORT','SMTP_USER','SMTP_PASS','SMTP_FROM'];
for(const key of required)if(!process.env[key])throw Error('MISSING_'+key);
const emailPath='lib/email.ts';
if(fs.existsSync(emailPath)){
  const code=fs.readFileSync(emailPath,'utf8');
  const keys=[...new Set([...code.matchAll(/process\.env\.(SMTP_[A-Z0-9_]+)/g)].map(m=>m[1]))];
  console.log('APP_SMTP_VARIABLE_NAMES='+keys.join(','));
  if(keys.includes('SMTP_PASSWORD')&&!keys.includes('SMTP_PASS'))throw Error('APP_EXPECTS_DIFFERENT_PASSWORD_VARIABLE');
}
const py=`
import os,sys,smtplib,ssl
from email.message import EmailMessage
from email.utils import parseaddr,formatdate,make_msgid
host=os.environ['SMTP_HOST'].strip()
port=int(os.environ['SMTP_PORT'])
user=os.environ['SMTP_USER'].strip()
password=os.environ['SMTP_PASS']
sender=os.environ['SMTP_FROM']
sender_address=parseaddr(sender)[1]
if sender_address.lower()!='info@primecutstudiostx.com':
 print('SENDER_MISMATCH');sys.exit(8)
msg=EmailMessage()
msg['From']=sender
msg['To']=user
msg['Date']=formatdate(localtime=False)
msg['Message-ID']=make_msgid(domain='primecutstudiostx.com')
msg['Subject']='Prime Cut Studios - Prueba de confirmacion de correo'
msg.set_content('Esta es una prueba unica del servicio SMTP de Prime Cut Studios. Si recibes este correo, el servidor de Zoho acepto la entrega del mensaje. No contiene invitaciones ni enlaces privados.')
try:
 if port==465:
  with smtplib.SMTP_SSL(host,port,timeout=24,context=ssl.create_default_context()) as smtp:
   smtp.login(user,password)
   print('SMTP_AUTH_OK',flush=True)
   smtp.send_message(msg)
 else:
  with smtplib.SMTP(host,port,timeout=24) as smtp:
   smtp.starttls(context=ssl.create_default_context())
   smtp.login(user,password)
   print('SMTP_AUTH_OK',flush=True)
   smtp.send_message(msg)
 print('SMTP_TEST_ACCEPTED',flush=True)
except smtplib.SMTPAuthenticationError as e:
 print('SMTP_AUTH_REJECTED code='+str(e.smtp_code),flush=True);sys.exit(11)
except smtplib.SMTPSenderRefused as e:
 print('SMTP_SENDER_REJECTED code='+str(e.smtp_code),flush=True);sys.exit(12)
except smtplib.SMTPRecipientsRefused:
 print('SMTP_RECIPIENT_REJECTED',flush=True);sys.exit(13)
except Exception as e:
 print('SMTP_CONNECTION_OR_DELIVERY_FAILED '+type(e).__name__,flush=True);sys.exit(14)
`;
const result=spawnSync('python3',['-c',py],{env:process.env,encoding:'utf8',timeout:35000,maxBuffer:100000});
if(result.stdout)process.stdout.write(result.stdout);
if(result.stderr)console.error('SMTP_TEST_STDERR_RECEIVED');
if(result.status!==0)throw Error('SMTP_SMOKE_TEST_FAILED_'+(result.status??'TIMEOUT'));
(async()=>{
  const css='app/globals.css';
  const url='https://raw.githubusercontent.com/sinpelosenelmicrofonopodcast-lang/BBHUB/8fd731535780f7f206108ce11277fef9b004547b/prime-cut-studios/assets/primecuts-premium-global.css';
  const prev=fs.readFileSync(css,'utf8');
  if(!prev.includes('PRIME CUT STUDIOS — GLOBAL CINEMATIC DESIGN SYSTEM')){
   const res=await fetch(url);if(!res.ok)throw Error('CSS_FETCH_FAILED_'+res.status);
   const body=await res.text();
   if(body.length<15000)throw Error('CSS_INVALID');
   fs.appendFileSync(css,'\n'+body+'\n');
  }
  console.log('PREMIUM_CSS_READY');
})().catch(e=>{console.error(e.message);process.exitCode=1});
