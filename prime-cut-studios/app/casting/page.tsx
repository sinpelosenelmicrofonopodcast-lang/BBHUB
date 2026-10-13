import Link from 'next/link';
import {SiteHeader} from '@/components/SiteHeader';import {Footer} from '@/components/Footer';
import {castingCalls} from '@/lib/operations-db';
export const runtime='nodejs';export const dynamic='force-dynamic';
export default async function Casting(){
 const calls=(await castingCalls(true)).filter(c=>!c.closes_at||Date.parse(c.closes_at)>Date.now());
 return <><SiteHeader/><main className="shell pagehero"><div className="eyebrow">Prime Cut Studios · Talent opportunities</div><h1>Open casting calls</h1><p className="muted">Apply here directly. We keep applications within our production workspace; never send personal details in public comments or social DMs.</p><div className="grid">{calls.map(c=><div className="panel" key={c.id}><div className="eyebrow">Open casting</div><h2>{c.title}</h2><p>{c.description}</p><p className="muted">Location: {c.location||'To be announced'}</p><p className="muted">Compensation: {c.pay_details||'Discussed during selection'}</p><Link className="btn" href={'/casting/'+c.id}>Apply</Link></div>)}{calls.length===0&&<div className="panel"><h3>No open casting calls right now</h3><p>Upcoming opportunities will appear here as soon as the production team publishes them.</p></div>}</div></main><Footer/></>;
}