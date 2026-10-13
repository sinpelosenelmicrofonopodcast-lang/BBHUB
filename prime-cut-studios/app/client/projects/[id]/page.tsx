import {redirect,notFound} from 'next/navigation';
import {SiteHeader} from '@/components/SiteHeader';import {Footer} from '@/components/Footer';
import {clientAuthenticated} from '@/lib/client-auth';
import {clientCanAccess,getProject,listDeliverables} from '@/lib/db';
import Link from 'next/link';
export const dynamic='force-dynamic';export const runtime='nodejs';
export default async function Project({params}:{params:Promise<{id:string}>}){
  const account=await clientAuthenticated();if(!account)redirect('/client/login');
  const {id}=await params;
  if(!await clientCanAccess(account.id,id))notFound();
  const p=await getProject(id);if(!p)notFound();
  const reviews=await listDeliverables(id,true);
  const amount=p.quote_amount_cents===null?'Estimate pending':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(p.quote_amount_cents/100);
  const label=(provider:string)=>provider==='blackmagic'?'DaVinci Resolve · Blackmagic Cloud':provider==='lightroom'?'Adobe Lightroom':'Google Drive';
  return <><SiteHeader/><main className="shell"><div className="pagehero"><div className="eyebrow">Private production workspace · {p.client_name}</div><h1>{p.title}</h1><p className="muted">{p.event_date||'Date to be confirmed'} · {p.location||'Location pending'}</p><Link href="/client" className="inline-link">← All my projects</Link><p><Link className="btn secondary btn-small" href={`/client/projects/${id}/operations`}>Creative reviews, messages and contracts</Link></p></div><div className="two client-review-layout"><section className="panel"><div className="eyebrow">Production status</div><h2>{p.status.replaceAll('-',' ')}</h2><div className="eyebrow">Review links & files</div>{reviews.length?reviews.map(r=><article className="review-link" key={r.id}><div><div className="eyebrow">{label(r.provider||'drive')}</div><h3>{r.title}</h3><p className="muted">{r.description}</p></div>{r.url?<a className="btn btn-small" href={r.url} target="_blank" rel="noopener noreferrer">Open for review ↗</a>:<span className="pill">Preparing</span>}</article>):<div className="empty compact">Your producer has not released any files for review.</div>}<p className="small muted">Reviews open in the provider's website. Adobe and Blackmagic may also require access according to their own sharing settings. Do not forward the links.</p></section><section className="panel"><div className="eyebrow">Production scope</div><h2>{amount}</h2><p className="muted">Estimate only; no online payment or electronic signature is collected here.</p><h3>Notes</h3><p style={{whiteSpace:'pre-wrap'}}>{p.quote_notes||'Your producer is preparing the project details.'}</p><div className="note">Comments on photography are handled inside Lightroom, and markers on edits inside Blackmagic Cloud. Your producer manages approvals and final delivery.</div></section></div></main><Footer/></>;
}
