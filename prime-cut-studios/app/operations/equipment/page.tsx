import {redirect} from 'next/navigation';
import {opsActor,canArea} from '@/lib/operations-auth';
import {opsList} from '@/lib/operations-db';
import {OperationsNav} from '@/components/OperationsNav';
export const runtime='nodejs';export const dynamic='force-dynamic';
type Equipment={id:string;name:string;category:string;status:string;serial_number:string|null;rental_enabled:boolean;day_rate_cents:number|null;notes:string|null};
export default async function EquipmentInventory(){
 const actor=await opsActor();if(!actor)redirect('/operations/login');if(!canArea(actor,'equipment'))redirect('/operations');
 const equipment=await opsList<Equipment>('equipment',{select:'id,name,category,status,serial_number,rental_enabled,day_rate_cents,notes',order:'category.asc',limit:'200'});
 const financial=actor.kind==='owner'||['manager','accountant','producer'].includes(actor.role);
 const groups=Array.from(new Set(equipment.map(x=>x.category)));
 return <main className="shell ops-shell"><OperationsNav actor={actor}/><section className="pagehero"><div className="eyebrow">REUSE EXISTING BBHUB INVENTORY</div><h1>Production equipment</h1><p className="muted">{equipment.length} existing inventory records. Read-only view; reservations require a verified project-ID bridge before activation.</p></section>{groups.map(category=><section key={category} className="admin-section"><h2>{category}</h2><div className="project-list">{equipment.filter(x=>x.category===category).map(e=><div className="panel" key={e.id}><div className="project-head"><div><h3>{e.name}</h3><p className="muted">{e.status} · {e.rental_enabled?'Rental enabled':'Internal production equipment'}</p></div>{financial&&e.day_rate_cents!==null&&<span className="pill">Day rate: {new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(e.day_rate_cents/100)}</span>}</div>{financial&&e.serial_number&&<p className="small muted">Serial: {e.serial_number}</p>}</div>)}</div></section>)}</main>;
}