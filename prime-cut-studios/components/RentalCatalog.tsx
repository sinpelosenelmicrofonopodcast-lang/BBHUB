'use client';
import {useMemo,useState} from 'react';
import Link from 'next/link';
import {Camera,Search,BookOpen,ExternalLink,Check,Plus,Minus,ShieldCheck} from 'lucide-react';
import type {EquipmentItem} from '@/lib/equipment-catalog';
type Listing=EquipmentItem & {priceCents?:number|null};
export function RentalCatalog({items}:{items:Listing[]}){
 const [search,setSearch]=useState(''),[category,setCategory]=useState('All'),[selected,setSelected]=useState<string[]>([]);
 const categories=useMemo(()=>['All',...Array.from(new Set(items.map(i=>i.category))).sort()],[items]);
 const visible=items.filter(item=>(category==='All'||item.category===category)&&(item.name+' '+item.id).toLowerCase().includes(search.toLowerCase()));
 const toggle=(id:string)=>setSelected(v=>v.includes(id)?v.filter(x=>x!==id):v.length<12?[...v,id]:v);
 return <div className="shell" style={{paddingBottom:70}}>
  <div className="rental-controls"><label className="rental-search"><Search size={19}/><input aria-label="Search equipment" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search cameras, lighting, audio, grip..."/></label><select aria-label="Equipment category" value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(cat=><option value={cat} key={cat}>{cat}</option>)}</select></div>
  <div className="rental-metrics"><strong>{visible.length} equipment records</strong><span>Quotes on request · Availability and rates confirmed by our team</span></div>
  <div className="rental-grid">{visible.map(item=><article className="rental-card" key={item.id}>
   <div className="equipment-picture">{item.photoUrl?<img src={item.photoUrl} alt={item.name} loading="lazy" referrerPolicy="no-referrer"/>:<div className="equipment-no-photo"><Camera size={42}/><small>Product photo not yet verified</small></div>}<span className="equipment-category">{item.category}</span></div>
   <div className="equipment-details"><div className="eyebrow">{item.id}</div><h3>{item.name}</h3><p className="muted" style={{fontSize:13}}>{item.rentalApproval==='approved'?'Owner approved for inquiry':'Rental approval required'} · {item.priceCents!=null&&item.rentalApproval==='approved'?('$'+(item.priceCents/100).toFixed(2)+'/day — estimate'):'Rate on request'}</p>
    <div className="equipment-specs">{item.specs.map(s=><span key={s}>{s}</span>)}{item.specs.length===0&&<span>Product details on manufacturer's reference site</span>}</div>
    <div className="equipment-links">{item.manufacturerUrl&&<a href={item.manufacturerUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={15}/> Official photo gallery / product</a>}{item.manualUrl&&<a href={item.manualUrl} target="_blank" rel="noopener noreferrer"><BookOpen size={15}/> Manual / support</a>}</div>
    <button type="button" className="btn secondary" onClick={()=>toggle(item.id)} disabled={!selected.includes(item.id)&&selected.length>=12}>{selected.includes(item.id)?<><Check size={17}/> Remove from request</>:<><Plus size={17}/> Add to inquiry</>}</button>
   </div></article>)}</div>
  {visible.length===0&&<div className="empty">No matching equipment. Try another search.</div>}
  <section id="request-rental" className="panel rental-request"><div className="eyebrow">Custom rental quote</div><h2>Equipment availability request</h2><p className="muted">Choose up to 12 items, tell us the dates, and we'll confirm availability, coverage requirements, rates and pickup conditions. This is not an instant reservation.</p>
   {selected.length>0&&<div className="rental-selection">{selected.map(id=>{const item=items.find(i=>i.id===id);return item?<span className="pill" key={id}>{item.name}<button type="button" aria-label={'Remove '+item.name} onClick={()=>toggle(id)}><Minus size={12}/></button></span>:null})}</div>}
   <form method="post" action="/api/rentals/request" className="rental-inquiry-form"><input type="hidden" name="equipmentIds" value={selected.join(',')}/>
    <label>Name<input name="name" type="text" minLength={2} maxLength={120} required/></label>
    <label>Email<input name="email" type="email" maxLength={254} required/></label>
    <label>Phone<input name="phone" type="tel" maxLength={40}/></label>
    <label>Pickup / start date<input name="startDate" type="date" required/></label>
    <label>Return / end date<input name="endDate" type="date" required/></label>
    <label>Project and requirements<textarea name="details" maxLength={1200} rows={4}/></label>
    <input type="text" name="website" className="trap-input" tabIndex={-1} autoComplete="off"/>
    <div className="rental-submit"><ShieldCheck size={18}/><span>Equipment reservations require manual confirmation and applicable paperwork.</span></div>
    <button className="btn" type="submit" disabled={selected.length===0}>Request quote ({selected.length} selected)</button>
   </form><p className="muted" style={{marginTop:14,fontSize:13}}>Need a crew or a production package? <Link href="/book">Contact Prime Cut Studios.</Link></p>
  </section>
 </div>;
}