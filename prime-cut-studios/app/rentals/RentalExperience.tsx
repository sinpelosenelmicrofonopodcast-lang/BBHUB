'use client';

import {useMemo,useState} from 'react';
import Link from 'next/link';
import {ArrowRight,CalendarDays,Check,ImageOff,Minus,Plus,Search,ShieldCheck,ShoppingBag,Trash2} from 'lucide-react';
import styles from './rentals.module.css';
import type {EquipmentItem} from '@/app/admin/equipment/EquipmentGallery';

type Props={items:EquipmentItem[]};
type Selection=Record<number,boolean>;
const dayText=(d:string)=>d||'Not selected';
const known=(x:EquipmentItem)=>x.manufacturer && x.manufacturer!=='Sin identificar' && !/Fabricante y modelo|Número de modelo|Identificar tipo/.test(x.modelNote||'');

function CatalogCard({item,chosen,onToggle}:{item:EquipmentItem,chosen:boolean,onToggle:(id:number)=>void}){
  const [broken,setBroken]=useState(false);
  const hasImage=Boolean(item.imageUrl&&!broken);
  return <article className={styles.product}>
    <div className={styles.photo}>
      {hasImage?<img src={item.imageUrl!} loading="lazy" alt={item.name} onError={()=>setBroken(true)} referrerPolicy="no-referrer" />:
        <div className={styles.noPhoto}><ImageOff size={34}/><span>Product image coming soon</span></div>}
    </div>
    <div className={styles.productContent}>
      <span className={styles.brand}>{item.manufacturer==='Sin identificar'?'Production accessory':item.manufacturer}</span>
      <h3>{item.name}</h3>
      <p className={styles.productType}>{item.category}</p>
      <div className={styles.rateLine}><span>Rental rate</span><strong>Request quote</strong></div>
      <button className={chosen?styles.selected:styles.add} type="button" onClick={()=>onToggle(item.id)}>
        {chosen?<><Check size={17}/> Added to request</>:<><Plus size={17}/> Add to request</>}
      </button>
    </div>
  </article>;
}

export function RentalExperience({items}:Props){
  // Multiple internal asset records can represent the same commercial product (e.g. RØDE Wireless PRO).
  const catalog=useMemo(()=>{
    const map=new Map<string,EquipmentItem>();
    for(const item of items){const key=item.name.toLocaleLowerCase().trim();if(!map.has(key))map.set(key,item);}
    return [...map.values()];
  },[items]);
  const [query,setQuery]=useState('');
  const [category,setCategory]=useState('all');
  const [photosOnly,setPhotosOnly]=useState(false);
  const [selected,setSelected]=useState<Selection>({});
  const [start,setStart]=useState('');
  const [end,setEnd]=useState('');
  const [fulfilment,setFulfilment]=useState<'pickup'|'delivery'>('pickup');
  const [notes,setNotes]=useState('');
  const [dateError,setDateError]=useState('');
  const categories=useMemo(()=>[...new Set(catalog.map(x=>x.category))].sort((a,b)=>a.localeCompare(b)),[catalog]);
  const visible=useMemo(()=>catalog.filter(x=>(category==='all'||x.category===category)&&(!photosOnly||Boolean(x.imageUrl))&&
    (`${x.name} ${x.manufacturer} ${x.category}`.toLocaleLowerCase().includes(query.toLocaleLowerCase().trim()))),[catalog,category,photosOnly,query]);
  const chosen=useMemo(()=>catalog.filter(item=>selected[item.id]),[catalog,selected]);
  function toggle(id:number){setSelected(s=>({...s,[id]:!s[id]}));setDateError('');}
  function createRequest(){
    if(!chosen.length){setDateError('Choose at least one item.');return;}
    if(!start||!end){setDateError('Select a start and return date.');return;}
    const today=new Date();today.setHours(0,0,0,0);
    const startTime=new Date(start+'T00:00:00'),endTime=new Date(end+'T00:00:00');
    if(startTime<today||endTime<startTime){setDateError('Please select valid dates. The return date cannot be before pickup.');return;}
    setDateError('');
    const list=chosen.map(x=>'- '+x.name).join('\n');
    const detail=`EQUIPMENT RENTAL QUOTE REQUEST (NOT A CONFIRMED BOOKING)\n\nEquipment:\n${list}\n\nRequested dates: ${start} through ${end}\nFulfilment preference: ${fulfilment==='pickup'?'Pickup in Killeen (subject to confirmation)':'Delivery (subject to quote)'}\nExtra information: ${notes.trim()||'None'}\n\nPlease confirm pricing, eligible equipment, deposit/insurance requirements, and availability before any rental.`;
    const params=new URLSearchParams({service:'Equipment Rental Inquiry',date:start,details:detail.slice(0,2900)});
    window.location.assign('/book?'+params.toString());
  }
  return <div className={styles.rentalApp}>
    <div className={styles.intro}>
      <div><span className={styles.kicker}>PRIME CUT STUDIOS / RENTALS</span><h2>Build your rental request.</h2>
        <p>Browse our production equipment, choose the items you need and send your dates. We will confirm eligibility, availability and an exact rental quote before anything is reserved.</p></div>
      <div className={styles.steps}><span>01 · Select equipment</span><span>02 · Choose dates</span><span>03 · Request quote</span></div>
    </div>
    <div className={styles.layout}>
      <div>
        <div className={styles.filters}>
          <label className={styles.search}><Search size={18}/><input type="search" aria-label="Search equipment" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search camera, brand, model..."/></label>
          <select aria-label="Filter by category" value={category} onChange={e=>setCategory(e.target.value)}><option value="all">All equipment</option>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select>
          <label className={styles.checkbox}><input type="checkbox" checked={photosOnly} onChange={e=>setPhotosOnly(e.target.checked)}/> With product photos</label>
        </div>
        <div className={styles.count}>{visible.length} products shown · <span>Prices upon review</span></div>
        {visible.length?<div className={styles.products}>{visible.map(item=><CatalogCard key={item.id} item={item} chosen={!!selected[item.id]} onToggle={toggle}/>)}</div>:
        <div className={styles.empty}>No equipment matched. Try another category or search term.</div>}
      </div>
      <aside className={styles.sidebar}>
        <div className={styles.cartTitle}><ShoppingBag size={21}/><div><strong>Your rental request</strong><span>{chosen.length} selected {chosen.length===1?'item':'items'}</span></div></div>
        {chosen.length?<div className={styles.cartItems}>{chosen.map(item=><div className={styles.cartItem} key={item.id}>
          <span>{item.name}</span><button title={`Remove ${item.name}`} aria-label={`Remove ${item.name}`} type="button" onClick={()=>toggle(item.id)}><Trash2 size={16}/></button>
        </div>)}</div>:<div className={styles.cartEmpty}>Your selection is empty. Add the equipment you'd like to use.</div>}
        <div className={styles.fieldGrid}>
          <label><span><CalendarDays size={15}/> Pickup / start</span><input type="date" value={start} onChange={e=>{setStart(e.target.value);setDateError('')}}/></label>
          <label><span><CalendarDays size={15}/> Return / end</span><input type="date" min={start||undefined} value={end} onChange={e=>{setEnd(e.target.value);setDateError('')}}/></label>
        </div>
        <div className={styles.delivery}>
          <span>How would you like the equipment?</span>
          <label><input type="radio" checked={fulfilment==='pickup'} onChange={()=>setFulfilment('pickup')}/> Pickup in Killeen</label>
          <label><input type="radio" checked={fulfilment==='delivery'} onChange={()=>setFulfilment('delivery')}/> Ask about delivery</label>
        </div>
        <label className={styles.notes}>Anything else?<textarea rows={3} maxLength={500} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Pickup time, accessories or special requirements..."/></label>
        <div className={styles.total}><span>Estimated total</span><strong>Pending quote</strong></div>
        {dateError?<p role="alert" className={styles.error}>{dateError}</p>:null}
        <button type="button" onClick={createRequest} className={styles.checkout}>Request rental quote <ArrowRight size={18}/></button>
        <div className={styles.safeguard}><ShieldCheck size={17}/><span>No payment is taken and no equipment is reserved. Our team must approve pricing, condition, deposit, insurance and availability.</span></div>
        <Link className={styles.helpLink} href="/book?service=Custom%20Production">Need crew and equipment together?</Link>
      </aside>
    </div>
  </div>;
}
