import Link from 'next/link';import {canArea,type Actor} from '@/lib/operations-auth';
export function OperationsNav({actor}:{actor:Actor}){
 const links:[string,string,string][]=[['/operations','Dashboard','projects'],['/operations/casting','Casting','casting'],['/operations/equipment','Equipment','equipment'],['/operations/team','Team & permissions','team']];
 return <nav className="ops-links" aria-label="Operations navigation"><Link href="/" className="inline-link">Prime Cut Studios</Link>{links.filter(x=>canArea(actor,x[2] as 'projects'|'casting'|'team'|'equipment')).map(([path,label])=><Link href={path} key={path} className="btn secondary btn-small">{label}</Link>)}<span className="pill">{actor.name} · {actor.role}</span>{actor.kind==='staff'&&<form method="post" action="/api/operations/logout"><button className="btn secondary btn-small">Sign out</button></form>}</nav>;
}
