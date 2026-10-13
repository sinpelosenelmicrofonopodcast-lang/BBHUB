'use client';
import {useEffect,useMemo,useState,type FormEvent} from 'react';
import {Minus,Plus,Search,ImageOff,ShoppingCart,ShieldCheck} from 'lucide-react';
import styles from './rentals.module.css';
import bundleBook from '@/lib/rental-bundles.json';
type Item={id:number;name:string;manufacturer:string;category:string;imageUrl:string|null;quantity:number};
type Stock={id:number;ready:number;total:number;manualReview:boolean};
type Rate={day:number;weekend:number;week:number;deposit:number|null;status:string;source:string};
type Availability={id:number;openQty:number;approvalRequired:boolean;bookable:boolean};
type Fields={name:string;email:string;phone:string;company:string;billingAddress:string;purpose:string;location:string;pickupWindow:string;returnWindow:string;notes:string};
const EMPTY:Fields={name:'',email:'',phone:'',company:'',billingAddress:'',purpose:'',location:'',pickupWindow:'',returnWindow:'',notes:''};
const USD=(n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
const today=()=>new Date().toLocaleDateString('en-CA');
function amount(id:number,rate:Rate,qty:number,start:string,end:string){
 const bundle=(bundleBook as Record<string,Record<string,{day:number;weekend:number;week:number;label:string}>>)[String(id)]?.[String(qty)];
 const applied=bundle||rate,multiplier=bundle?1:qty;
 const days=start&&end?Math.max(1,Math.round((Date.parse(end+'T00:00:00Z')-Date.parse(start+'T00:00:00Z'))/86400000)+1):1;
 const weeks=Math.floor(days/7),r=days%7;
 const weekend=r===2&&new Date(start+'T00:00:00Z').getUTCDay()===5;
 return multiplier*(weeks*applied.week+(r?weekend?applied.weekend:Math.min(r*applied.day,applied.week):0));
}
export function RentalExperienceV2({items,stock,rates}:{items:Item[];stock:Stock[];rates:Record<string,Rate>}){
 const [search,setSearch]=useState(''),[category,setCategory]=useState('all'),[selected,setSelected]=useState<Record<number,number>>({});
 const [start,setStart]=useState(''),[end,setEnd]=useState('');
 const [available,setAvailable]=useState<Record<number,Availability>|null>(null),[checking,setChecking]=useState(false);
 const [availabilityError,setAvailabilityError]=useState('');
 const [fields,setFields]=useState<Fields>(EMPTY),[fulfilment,setFulfilment]=useState('pickup'),[ack,setAck]=useState(false);
 const [sending,setSending]=useState(false),[error,setError]=useState(''),[success,setSuccess]=useState('');
 const physical=useMemo(()=>Object.fromEntries(stock.map(s=>[s.id,s.ready])) as Record<number,number>,[stock]);
 const max=(id:number)=>start&&end?(available?.[id]?.openQty??0):(physical[id]??0);
 const categories=useMemo(()=>[...new Set(items.map(x=>x.category))].sort(),[items]);
 const filtered=items.filter(x=>(category==='all'||category===x.category)&&(x.name+' '+x.manufacturer+' '+x.category).toLowerCase().includes(search.toLowerCase()));
 const chosen=items.filter(x=>(selected[x.id]||0)>0);
 const total=chosen.reduce((sum,x)=>sum+(rates[String(x.id)]?amount(x.id,rates[String(x.id)],selected[x.id],start,end):0),0);
 const tax=total*0.0825;
 useEffect(()=>{
  setAvailable(null);setAvailabilityError('');
  if(!start||!end||end<start)return;
  const controller=new AbortController();setChecking(true);
  fetch('/api/rentals/availability?'+new URLSearchParams({start,end}),{cache:'no-store',signal:controller.signal})
   .then(async r=>{if(!r.ok)throw Error('Availability cannot be verified right now.');return r.json()})
   .then(data=>{
     if(controller.signal.aborted)return;
     const map:Record<number,Availability>={};for(const row of data.availability||[])map[row.id]=row;
     setAvailable(map);setSelected(prev=>Object.fromEntries(Object.entries(prev).map(([k,n])=>[k,Math.min(n,map[Number(k)]?.openQty??0)])));
   }).catch(e=>{if(!controller.signal.aborted)setAvailabilityError(e.message)})
   .finally(()=>{if(!controller.signal.aborted)setChecking(false)});
  return ()=>controller.abort();
 },[start,end]);
 function changeQty(id:number,diff:number){setSelected(prev=>({...prev,[id]:Math.min(max(id),Math.max(0,(prev[id]||0)+diff))}));setSuccess('');setError('');}
 function changeField(name:keyof Fields,value:string){setFields(prev=>({...prev,[name]:value}));}
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setError('');setSuccess('');
  if(!chosen.length)return setError('Select at least one product.');
  if(!start||!end||end<start)return setError('Select a valid rental window.');
  if(checking||!available||availabilityError)return setError('Dates and quantities must be checked before sending.');
  for(const item of chosen)if(selected[item.id]>(available[item.id]?.openQty??0))return setError('One or more items are unavailable in that quantity.');
  if(!ack)return setError('Acknowledge the rental requirements.');
  setSending(true);
  try{
   const payload={...fields,fulfilment,start,end,termsAcknowledged:ack,items:chosen.map(x=>({id:x.id,qty:selected[x.id]}))};
   const response=await fetch('/api/rentals/request',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
   const data=await response.json();
   if(!response.ok)throw Error(data.error||'Could not submit request.');
   setSuccess('Rental quote request received. The dates and equipment are NOT reserved until we confirm in writing.');
   setSelected({});setAck(false);
  }catch(e){setError(e instanceof Error?e.message:'Could not send request.')}finally{setSending(false)}
 }
 return <div className={styles.rentalApp}>
  <div className={styles.intro}><div><span className={styles.kicker}>PRIME CUT STUDIOS · RENTALS</span><h2>Build your equipment rental.</h2><p>Choose equipment and quantities for your shoot. Prices are before tax and subject to final written approval; inventory is checked by date before your quote request is accepted.</p></div><div className={styles.steps}><span>Choose gear</span><span>Check dates</span><span>Request quote</span></div></div>
  <div className={styles.layout}><div>
   <div className={styles.filters}><label className={styles.search}><Search size={17}/><input aria-label="Search equipment" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search gear, brand, model..."/></label><select aria-label="Category" value={category} onChange={e=>setCategory(e.target.value)}><option value="all">All categories</option>{categories.map(c=><option key={c}>{c}</option>)}</select></div>
   <p className={styles.count}>{filtered.length} product models · Quantities limited to inventory · No internal asset numbers</p>
   <div className={styles.products}>{filtered.map(x=>{
    const qty=selected[x.id]||0,limit=max(x.id),rate=rates[String(x.id)],disabled=limit===0;
    return <article className={styles.product} key={x.id}><div className={styles.photo}>{x.imageUrl?<img loading="lazy" src={x.imageUrl} alt={x.name} referrerPolicy="no-referrer"/>:<div className={styles.noPhoto}><ImageOff size={30}/><span>Product image pending</span></div>}</div>
      <div className={styles.productContent}><span className={styles.brand}>{x.manufacturer==='Sin identificar'?'Production gear':x.manufacturer}</span><h3>{x.name}</h3><p className={styles.productType}>{x.category}</p>
      <p className={styles.systemNote}>{disabled?'Unavailable':(start&&end&&available?'Up to ':'Up to ')+limit+' unit'+(limit===1?'':'s')+' for inquiry · Final approval required'}</p>
      <div className={styles.rateLine}><span>{rate?.status==='suggested'?'Proposed rate · per day':'Reference rate · per day'}</span><strong>{rate?USD(rate.day):'Quote required'}</strong></div>
      {rate&&<p className={styles.rateMore}>Weekend {USD(rate.weekend)} · 7 days {USD(rate.week)}</p>}
      {Object.keys((bundleBook as Record<string,Record<string,unknown>>)[String(x.id)]||{}).length>0&&<p className={styles.rateMore}>Multi-unit package discount available</p>}
      <div className={styles.qtyButtons}><button type="button" aria-label={'Decrease '+x.name} disabled={qty===0} onClick={()=>changeQty(x.id,-1)}><Minus size={17}/></button><span>{qty} / {limit}</span><button type="button" aria-label={'Increase '+x.name} disabled={qty>=limit||disabled} onClick={()=>changeQty(x.id,1)}><Plus size={17}/></button></div>
     </div></article>;
   })}</div>{!filtered.length&&<p className={styles.empty}>No matching equipment.</p>}
  </div>
  <aside className={styles.sidebar}><div className={styles.cartTitle}><ShoppingCart size={22}/><div><strong>Your rental request</strong><span>{chosen.length} products · {chosen.reduce((sum,x)=>sum+selected[x.id],0)} total units</span></div></div>
   {chosen.length?<div className={styles.cartItems}>{chosen.map(x=><div className={styles.cartItem} key={x.id}><span>{x.name} × {selected[x.id]}</span><button title="Remove" type="button" onClick={()=>changeQty(x.id,-(selected[x.id]||0))}><Minus size={15}/></button></div>)}</div>:<p className={styles.cartEmpty}>Use the + and − controls to select quantities.</p>}
   <form onSubmit={submit}><div className={styles.fieldGrid}><label><span>Pickup date *</span><input required type="date" min={today()} value={start} onChange={e=>setStart(e.target.value)}/></label><label><span>Return date *</span><input required type="date" min={start||today()} value={end} onChange={e=>setEnd(e.target.value)}/></label></div>
    {checking&&<p className={styles.systemNote}>Checking dates and stock…</p>}{availabilityError&&<p className={styles.error}>{availabilityError}</p>}
    <div className={styles.delivery}><span>Pickup / delivery</span><label><input type="radio" checked={fulfilment==='pickup'} onChange={()=>setFulfilment('pickup')}/> Pickup in Killeen</label><label><input type="radio" checked={fulfilment==='delivery'} onChange={()=>setFulfilment('delivery')}/> Ask for delivery quote</label></div>
    <div className={styles.total}><span>Equipment estimate</span><strong>{USD(total)}</strong></div><p className={styles.systemNote}>Estimated Killeen tax 8.25%: {USD(tax)}. Estimated total: <b>{USD(total+tax)}</b>. Delivery and security authorization are separate.</p>
    <p className={styles.quoteNote}>The published rate book includes reference and newly proposed rates. We verify the final amount, availability and deposit in writing.</p>
    <div className={styles.contactFields}><h3>Contact & rental details</h3>
     <label>Full legal name *<input required minLength={2} maxLength={120} value={fields.name} onChange={e=>changeField('name',e.target.value)} autoComplete="name"/></label>
     <label>Email *<input type="email" required maxLength={254} value={fields.email} onChange={e=>changeField('email',e.target.value)} autoComplete="email"/></label>
     <label>Mobile phone *<input type="tel" required minLength={7} maxLength={40} value={fields.phone} onChange={e=>changeField('phone',e.target.value)} autoComplete="tel"/></label>
     <label>Company (optional)<input maxLength={120} value={fields.company} onChange={e=>changeField('company',e.target.value)}/></label>
     <label>Billing address *<input required minLength={5} maxLength={200} value={fields.billingAddress} onChange={e=>changeField('billingAddress',e.target.value)} autoComplete="street-address"/></label>
     <label>Intended use *<textarea rows={2} required minLength={5} maxLength={400} value={fields.purpose} onChange={e=>changeField('purpose',e.target.value)} /></label>
     <label>Use location <input maxLength={160} value={fields.location} onChange={e=>changeField('location',e.target.value)}/></label>
     <div className={styles.windowGrid}><label>Pickup time preference<input maxLength={50} value={fields.pickupWindow} onChange={e=>changeField('pickupWindow',e.target.value)}/></label><label>Return time preference<input maxLength={50} value={fields.returnWindow} onChange={e=>changeField('returnWindow',e.target.value)}/></label></div>
     <label>Notes<textarea rows={2} maxLength={500} value={fields.notes} onChange={e=>changeField('notes',e.target.value)} /></label>
     <label className={styles.terms}><input type="checkbox" checked={ack} onChange={e=>setAck(e.target.checked)}/> I have read the rental requirements. I understand a quote request does not reserve equipment or authorize payment.</label>
    </div>
    {error&&<p className={styles.error} role="alert">{error}</p>}{success&&<p className={styles.success} role="status">{success}</p>}
    <button className={styles.checkout} type="submit" disabled={sending||checking||!available||chosen.length===0}>{sending?'Submitting...':'Request rental quote'} </button>
   </form><div className={styles.safeguard}><ShieldCheck size={18}/><span>Government ID, signed agreement and insurance are verified privately. No ID upload or payment is collected here.</span></div>
  </aside></div>
 </div>;
}
