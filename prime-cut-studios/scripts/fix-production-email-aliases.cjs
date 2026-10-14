const fs=require('node:fs');
const file='lib/email.ts';
if(!fs.existsSync(file))throw Error('MAIL_SOURCE_MISSING');
let code=fs.readFileSync(file,'utf8');
const mappings={
  MAIL_SMTP_HOST:'SMTP_HOST',
  MAIL_SMTP_USER:'SMTP_USER',
  MAIL_SMTP_PASSWORD:'SMTP_PASS',
  MAIL_SMTP_PORT:'SMTP_PORT',
  MAIL_SMTP_FROM:'SMTP_FROM',
  MAIL_FROM:'SMTP_FROM'
};
let replaced=[];
for(const [canonical,existing] of Object.entries(mappings)){
  const match='process.env.'+canonical;
  if(!code.includes(match))continue;
  const replacement='(process.env.'+canonical+' || process.env.'+existing+')';
  code=code.replaceAll(match,replacement);
  replaced.push(canonical);
}
if(!replaced.includes('MAIL_SMTP_PASSWORD')||!replaced.includes('MAIL_SMTP_USER')||!replaced.includes('MAIL_SMTP_HOST'))throw Error('SMTP_SOURCE_UNEXPECTED_STOP');
fs.writeFileSync(file,code);
console.log('MAIL_CONFIG_ALIASES_FIXED='+replaced.join(','));
