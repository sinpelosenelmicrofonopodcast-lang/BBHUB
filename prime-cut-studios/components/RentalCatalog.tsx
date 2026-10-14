'use client';
import {useMemo,useState} from 'react';
import Link from 'next/link';
import {Camera,Search,BookOpen,ExternalLink,Plus,Minus,ShieldCheck} from 'lucide-react';
import type {RentalModel} from '@/lib/rental-models';

export function RentalCatalog({items}:{items:RentalModel[]}){
 const [search,setSearch]=useState('');
 const [category,setCategory]=useState('All');
 const [quantities,setQuantities]=useState<Record<string,number>>({});
 const categories=useMemo(()=>['All',...Array.from(new Set(items.map(i=>i.category))).sort()],[items]);
 const visible=items.filter(item=>(category==='All'||item.category===category)
   &&item.name.toLowerCase().includes(search.trim().toLowerCase()));
 const totalSelected=items.reduce((sum,model)=>sum+(quantities[model.key]||0),0);
 // Keep the existing backend contract: comma-separated, unique physical asset IDs.
 // The server checks readiness/disabled status again when the form is submitted.
 const selectedIds=items.flatMap(model=>model.assetIds.slice(0,quantities[model.key]||0));
 const adjust=(model:RentalModel,delta:number)=>setQuantities(previous=>{
   const existing=previous[model.key]||0;
   const total=items.reduce((sum,m)=>sum+(previous[m.key]||0),0);
   if(delta>0&&(existing>=model.assetIds.length||total>=12))return previous;
   const nextCount=Math.max(0,Math.min(model.assetIds.length,existing+delta));
   const next={...previous};
   if(nextCount===0)delete next[model.key];
   else next[model.key]=nextCount;
   return next;
 });
 return <div className="shell" style={{paddingBottom:70}}>
  <div className="rental-controls">
   <label className="rental-search"><Search size={19}/>
    <input aria-label="Search equipment" value={search} onChange={e=>setSearch(e.target.value)}
     placeholder="Search cameras, lighting, audio, grip..."/></label>
   <select aria-label="Equipment category" value={category} onChange={e=>setCategory(e.target.value)}>
    {categories.map(cat=><option value={cat} key={cat}>{cat}</option>)}
   </select>
  </div>
  <div className="rental-metrics">
   <strong>{visible.length} equipment models</strong>
   <span>Inventory quantities are not confirmed rental availability · Quotes on request</span>
  </div>
  <div className="rental-grid">
   {visible.map(model=>{
    const picked=quantities[model.key]||0;
    return <article className="rental-card" key={model.key}>
     <div className="equipment-picture">
      {model.photoUrl
       ?<img src={model.photoUrl} alt={model.name} loading="lazy" referrerPolicy="no-referrer"/>
       :<div className="equipment-no-photo"><Camera size={42}/><small>Product photo not yet verified</small></div>}
      <span className="equipment-category">{model.category}</span>
     </div>
     <div className="equipment-details">
      <div className="eyebrow">{model.quantity} {model.quantity===1?'unit':'units'} in inventory</div>
      <h3>{model.name}</h3>
      <p className="muted" style={{fontSize:13}}>
       {model.rentalApproval==='approved'?'Owner approved for inquiry':'Rental approval required'} ·
       {model.priceCents!=null&&model.rentalApproval==='approved'
        ?(' $'+(model.priceCents/100).toFixed(2)+'/day per unit — estimate')
        :' Rate on request'}
      </p>
      <div className="equipment-specs">
       {model.specs.map(s=><span key={s}>{s}</span>)}
       {model.specs.length===0&&<span>Product details on manufacturer reference site</span>}
      </div>
      <div className="equipment-links">
       {model.manufacturerUrl&&<a href={model.manufacturerUrl} target="_blank" rel="noopener noreferrer">
        <ExternalLink size={15}/> Official product gallery</a>}
       {model.manualUrl&&<a href={model.manualUrl} target="_blank" rel="noopener noreferrer">
        <BookOpen size={15}/> Manual / support</a>}
      </div>
      <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap',marginTop:12}}>
       <button type="button" className="btn secondary" aria-label={'Remove one '+model.name}
        onClick={()=>adjust(model,-1)} disabled={picked===0}><Minus size={17}/> Remove</button>
       <strong aria-live="polite" aria-label={'Requested units for '+model.name}>{picked} / {model.quantity}</strong>
       <button type="button" className="btn secondary" aria-label={'Add one '+model.name}
        onClick={()=>adjust(model,1)} disabled={picked>=model.assetIds.length||totalSelected>=12}>
         <Plus size={17}/> Add one
       </button>
      </div>
     </div>
    </article>;
   })}
  </div>
  {visible.length===0&&<div className="empty">No matching equipment. Try another search.</div>}
  <section id="request-rental" className="panel rental-request">
   <div className="eyebrow">Custom rental quote</div>
   <h2>Equipment availability request</h2>
   <p className="muted">Request up to 12 physical units across all models. Our team confirms the actual
   availability, rates, coverage and pickup conditions. This is not an instant reservation.</p>
   {totalSelected>0&&<div className="rental-selection">
    {items.filter(m=>(quantities[m.key]||0)>0).map(model=>
     <span className="pill" key={model.key}>{model.name} × {quantities[model.key]}
      <button type="button" aria-label={'Remove one '+model.name} onClick={()=>adjust(model,-1)}>
       <Minus size={12}/>
      </button>
     </span>)}
   </div>}
   <form method="post" action="/api/rentals/request" className="rental-inquiry-form">
    <input type="hidden" name="equipmentIds" value={selectedIds.join(',')}/>
    <label>Name<input name="name" type="text" minLength={2} maxLength={120} required/></label>
    <label>Email<input name="email" type="email" maxLength={254} required/></label>
    <label>Phone<input name="phone" type="tel" maxLength={40}/></label>
    <label>Pickup / start date<input name="startDate" type="date" required/></label>
    <label>Return / end date<input name="endDate" type="date" required/></label>
    <label>Project and requirements<textarea name="details" maxLength={1200} rows={4}/></label>
    <input type="text" name="website" className="trap-input" tabIndex={-1} autoComplete="off"/>
    <div className="rental-submit">
     <ShieldCheck size={18}/>
     <span>Reservations require manual confirmation and applicable paperwork.</span>
    </div>
    <button className="btn" type="submit" disabled={totalSelected===0}>
     Request quote ({totalSelected} {totalSelected===1?'unit':'units'} selected)
    </button>
   </form>
   <p className="muted" style={{marginTop:14,fontSize:13}}>
    Need a crew or production package? <Link href="/book">Contact Prime Cut Studios.</Link>
   </p>
  </section>
 </div>;
}
