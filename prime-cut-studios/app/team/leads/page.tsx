import Link from 'next/link';import {redirect} from 'next/navigation';import {cookies} from 'next/headers';
import {operationsSession} from '@/lib/operations-db';
import {roleCan} from '@/lib/operations-policy';import {listInquiries} from '@/lib/db';
export const runtime='nodejs';export const dynamic='force-dynamic';
export default async function Leads(){
 const staff=await operationsSession();if(!staff)redirect('/client/login');
 if(!roleCan(staff.role,'crm.read'))return <main className="shell pagehero"><h1>Access denied</h1></main>;
 const leads=await listInquiries();
 const raw=(await cookies()).get('primecuts_team_client_invite')?.value;
 let invite='';try{if(raw)invite=JSON.parse(raw).link||''}catch{}
 return <main className="shell pagehero" style={{maxWidth:1100}}><div className="eyebrow">PrimeCuts OS · CRM and intake</div><h1>Client inquiries</h1><p className="muted">Authorized staff only. The team can collect requests and convert a qualified lead to a project with a private client invitation.</p><Link href="/team" className="inline-link">← Operations dashboard</Link>
 {invite&&<section className="panel" style={{marginTop:22}}><h2>Private client invitation</h2><p className="muted">This invite expires in 7 days and can be used once. Share only with the intended client.</p><input readOnly className="wide-input" aria-label="Client invitation URL" value={invite}/></section>}
 <section className="admin-section"><h2>Inquiries ({leads.length})</h2><div className="tablewrap"><table><thead><tr><th>Client</th><th>Request</th><th>Details</th><th>Status</th><th>Action</th></tr></thead><tbody>{leads.map(l=><tr key={l.id}><td>{l.name}<div><a className="inline-link" href={'mailto:'+l.email}>{l.email}</a></div>{l.phone&&<span className="muted">{l.phone}</span>}</td><td>{l.service}<br/><span className="muted">{l.event_date||'Date TBD'} · {l.location||'Location TBD'}</span></td><td style={{whiteSpace:'pre-wrap',maxWidth:320}}>{l.details||'—'}</td><td>{l.status}</td><td>{roleCan(staff.role,'crm.write')&&l.status==='new'?<form method="post" action="/api/team/leads"><input type="hidden" name="id" value={l.id}/><button className="btn secondary" type="submit">Create project & invite</button></form>:<span className="muted">—</span>}</td></tr>)}</tbody></table></div>{leads.length===0&&<p className="muted">No inquiries yet.</p>}</section>
 </main>;
}