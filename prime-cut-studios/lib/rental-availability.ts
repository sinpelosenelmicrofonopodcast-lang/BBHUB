import assetMap from './rental-asset-map.json';
import catalog from './equipment-catalog.json';
import priceBook from './rental-rates.json';
import bundleBook from './rental-bundles.json';
import {serverHeaders} from './db';

/** Server-only: never expose asset IDs, serials, internal customer records, or Supabase keys. */
type Booking={asset_id:string;start_date:string;end_date:string;status:string;hold_expires_at:string|null};
type Override={asset_id:string;rental_approved:boolean;disabled:boolean;daily_rate_cents:number|null};
type Unit={assetId:string;status:string};
export type Availability={id:number;physicalQty:number;openQty:number;approvalRequired:boolean;rateDay:number|null;bookable:boolean};

export function consolidated(){
  const byName=new Map<string,typeof catalog[number]>();
  for(const item of catalog){
    const key=item.name.normalize('NFKC').toLowerCase();
    const old=byName.get(key);
    if(!old){byName.set(key,{...item});}
    else old.quantity += item.quantity;
  }
  return [...byName.values()];
}
const assetIdsFor=(id:number):Unit[]=>((assetMap as Record<string,Unit[]>)[String(id)]||[]);
const key=(id:number)=>String(id);
const blockedStatuses=new Set(['cancelled','canceled','expired','rejected','returned','completed','closed','void']);
const addDays=(s:string,days:number)=>{
  const date=new Date(s+'T12:00:00Z'); date.setUTCDate(date.getUTCDate()+days);return date.toISOString().slice(0,10);
};
async function privateRows<T>(table:string,filter:Record<string,string>):Promise<T[]>{
  const url=new URL((process.env.SUPABASE_URL||'')+'/rest/v1/'+table);
  Object.entries(filter).forEach(([k,v])=>url.searchParams.set(k,v));
  const result=await fetch(url,{cache:'no-store',headers:serverHeaders()});
  if(!result.ok)throw Error('Inventory service currently unavailable');
  return await result.json() as T[];
}
export function datesValid(start:string,end:string){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(start)||!/^\d{4}-\d{2}-\d{2}$/.test(end))return false;
  const dateOk=(d:string)=>!Number.isNaN(Date.parse(d))&&new Date(d).toISOString().slice(0,10)===d;
  return dateOk(start)&&dateOk(end)&&end>=start&&start>=new Date().toISOString().slice(0,10)&&end<=addDays(start,60);
}
export function referenceRate(id:number){return (priceBook.rates as Record<string,{day:number;weekend:number;week:number;deposit:number|null;status:string}>)[key(id)]||null;}
export function referencePriceForDates(id:number,qty:number,start:string,end:string){
  const defaultRate=referenceRate(id);if(!defaultRate||!datesValid(start,end)||!Number.isInteger(qty)||qty<1)return null;
  const bundles=bundleBook as Record<string,Record<string,{day:number;weekend:number;week:number}>>;
  const rate=bundles[String(id)]?.[String(qty)]||defaultRate;
  const multiplier=bundles[String(id)]?.[String(qty)]?1:qty;
  const count=Math.round((Date.parse(end)-Date.parse(start))/86400000)+1;
  const weeks=Math.floor(count/7),extra=count%7;
  let amount=weeks*rate.week;
  if(extra>0){const weekend=extra===2&&new Date(start+'T00:00:00Z').getUTCDay()===5;
    amount+=weekend?rate.weekend:Math.min(extra*rate.day,rate.week);}
  return Math.round(amount*multiplier*100);
}
export async function availabilityForDates(start:string,end:string):Promise<Availability[]>{
  if(!datesValid(start,end))throw Error('INVALID_DATES');
  const bufferEnd=addDays(end,1); // next day reserved for inspection & recharging
  const [overrides,bookings]=await Promise.all([
    privateRows<Override>('pc_equipment_overrides',{select:'asset_id,rental_approved,disabled,daily_rate_cents',limit:'1000'}),
    privateRows<Booking>('pc_equipment_bookings',{select:'asset_id,start_date,end_date,status,hold_expires_at',start_date:'lte.'+bufferEnd,end_date:'gte.'+start,limit:'3000'})
  ]);
  const byAsset=new Map(overrides.map(x=>[x.asset_id,x]));
  const now=Date.now();
  const occupied=new Set(bookings.filter(x=>{const status=x.status.toLowerCase();if(blockedStatuses.has(status))return false;const isTentative=['hold','held','tentative'].includes(status);return !isTentative||!x.hold_expires_at||Date.parse(x.hold_expires_at)>now;}).map(x=>x.asset_id));
  return consolidated().map(item=>{
    const units=assetIdsFor(item.id);const ready=units.filter(x=>x.status==='ready');
    const open=ready.filter(x=>!byAsset.get(x.assetId)?.disabled&&!occupied.has(x.assetId));
    const approved=open.filter(x=>byAsset.get(x.assetId)?.rental_approved);
    return {id:item.id,physicalQty:ready.length,openQty:open.length,approvalRequired:approved.length<open.length,
      rateDay:referenceRate(item.id)?.day||null,bookable:approved.length>0};
  });
}
export function physicalSummary(){
  return consolidated().map(item=>{
    const units=assetIdsFor(item.id);
    const quantity=units.length?units.filter(x=>x.status==='ready').length:0;
    return {id:item.id,ready:quantity,total:units.length,manualReview:units.length===0};
  });
}
