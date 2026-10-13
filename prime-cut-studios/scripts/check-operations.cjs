/* Offline-only regression tests. Does not contact Supabase, Vercel, GitHub or external services. */
const fs=require('node:fs'), path=require('node:path'),assert=require('node:assert/strict');
const ts=require('typescript');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const source=read('lib/operations-auth.ts');
const policy=source.match(/const POLICY:Record<StaffRole,Area\[]>=(\{[\s\S]*?\n\});/);
assert.ok(policy,'Operations permission matrix');
let compiled=ts.transpileModule(`const POLICY=${policy[1]}; exports.policy=POLICY;`,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const ctx={exports:{}};require('node:vm').runInNewContext(compiled,ctx,{timeout:1000});
const P=ctx.exports.policy;
for (const role of ['secretary','producer','manager','editor','crew','casting','accountant'])assert.ok(P[role],'Missing role '+role);
assert.ok(P.secretary.includes('projects'),'Secretary project management');
assert.ok(!P.secretary.includes('finance'),'Secretary cannot access financials');
assert.ok(!P.editor.includes('finance')&&!P.editor.includes('contracts')&&!P.editor.includes('casting'),'Editor is scoped to editing');
assert.ok(P.accountant.includes('finance')&&!P.accountant.includes('casting'),'Finance role separation');
assert.ok(P.crew.includes('schedule')&&!P.crew.includes('finance'),'Crew limited scope');
const staffRoute=read('app/api/operations/action/route.ts');
for(const phrase of ["actor.kind!=='owner'","session_version:staff.session_version+1","action==='manual_project'","action==='unassign_staff'","action==='application_message'","await canProject(actor,projectId)"])assert.ok(staffRoute.includes(phrase),'Missing authorization '+phrase);
const app=read('app/api/talent/apply/route.ts');assert.ok(app.includes('opsTalent()')&&app.includes('status:\'eq.open\''),'Talent login and open call validation');
const msg=read('app/api/talent/message/route.ts');assert.ok(msg.includes("talent_id:`eq.${talent.id}`"),'Talent messages must be bound to their own application');
const clients=read('app/api/operations/client-action/route.ts');assert.ok(clients.includes('clientCanAccess(client.id,item.project_id)'),'Clients restricted by project membership');
const sql=read('supabase/migrations/20261013194500_primecuts_operations.sql');for(const t of ['pc_ops_staff','pc_ops_castings','pc_ops_talents','pc_ops_talent_messages','pc_ops_audit','pc_ops_staff_projects'])assert.ok(sql.includes(`'${t}'`),'Missing RLS table '+t);
assert.ok(sql.includes('REVOKE ALL ON public.%I FROM PUBLIC,anon,authenticated'),'Public grants revoked');
const vercel=JSON.parse(read('vercel.json'));assert.ok(vercel.git.deploymentEnabled,'Deployment guard should be present');
let fileCount=0;const errors=[];
function visit(dir){for(const name of fs.readdirSync(dir)){const file=path.join(dir,name);if(fs.statSync(file).isDirectory()){if(name!=='node_modules')visit(file);continue}if(!/\.tsx?$/.test(name))continue;fileCount++;const src=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,name.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);for(const d of src.parseDiagnostics)errors.push({file,line:src.getLineAndCharacterOfPosition(d.start||0).line+1,error:ts.flattenDiagnosticMessageText(d.messageText,'\n')});}}
visit(root);assert.deepEqual(errors,[],'TS/TSX syntax errors');
console.log(`PASS: ${fileCount} TS/TSX files parse. Roles, private casting, individual login, client project scope, staff revoke and RLS boundaries checked. No remote resources used.`);
