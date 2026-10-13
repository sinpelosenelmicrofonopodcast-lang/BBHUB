import {NextResponse} from 'next/server';
import {createInquiry,identifyIp} from '@/lib/db';
import {requestIsSameOrigin,safeIp} from '@/lib/auth';
import {availabilityForDates,consolidated,datesValid,referencePriceForDates,referenceRate} from '@/lib/rental-availability';

export const runtime='nodejs';

function reply(message:string,status=400){return NextResponse.json({ok:false,error:message},{status,headers:{'Cache-Control':'no-store'}});}
const str=(v:unknown,max:number)=>typeof v==='string'?v.trim().slice(0,max+1):'';

export async function POST(request:Request){
  if(!requestIsSameOrigin(request))return reply('Invalid origin',403);
  if(Number(request.headers.get('content-length')||0)>18000)return reply('Request too large',413);
  let d:Record<string,unknown>;
  try{const value=await request.json();if(!value||typeof value!=='object'||Array.isArray(value))return reply('Invalid request');d=value as Record<string,unknown>;}
  catch{return reply('Invalid request');}
  if(str(d.website,500))return NextResponse.json({ok:true,received:true});
  const name=str(d.name,120),email=str(d.email,254).toLowerCase(),phone=str(d.phone,40),
    address=str(d.billingAddress,200),company=str(d.company,120),purpose=str(d.purpose,400),
    location=str(d.location,160),pickup=str(d.pickupWindow,50),returnWindow=str(d.returnWindow,50),
    fulfilment=str(d.fulfilment,20),notes=str(d.notes,500),
    start=str(d.start,10),end=str(d.end,10);
  if(name.length<2||name.length>120||email.length>254||!/^\S+@\S+\.\S+$/.test(email)||
     phone.length<7||phone.length>40||address.length<5||address.length>200||purpose.length<5||purpose.length>400||
     company.length>120||location.length>160||notes.length>500||
     !['pickup','delivery'].includes(fulfilment)||!datesValid(start,end))return reply('Complete all required fields and choose valid rental dates');
  if(d.termsAcknowledged!==true)return reply('Please review and acknowledge the rental requirements');
  const lines=d.items;
  if(!Array.isArray(lines)||lines.length===0||lines.length>12)return reply('Select between 1 and 12 different products');
  const allowed=new Map(consolidated().map(x=>[x.id,x]));
  let totalCents=0;const normalized:Array<{id:number;qty:number;name:string;rateCents:number}>=[];
  const seen=new Set<number>();
  for(const entry of lines){
    if(!entry||typeof entry!=='object'||Array.isArray(entry))return reply('Invalid equipment');
    const id=(entry as {id:unknown}).id,qty=(entry as {qty:unknown}).qty;
    if(typeof id!=='number'||typeof qty!=='number'||!Number.isInteger(id)||!Number.isInteger(qty)||qty<1||qty>20||seen.has(id))return reply('Invalid item quantity');
    const product=allowed.get(Number(id));if(!product)return reply('Unknown equipment item');
    seen.add(Number(id));
    const price=referencePriceForDates(Number(id),Number(qty),start,end);
    if(price===null||!referenceRate(Number(id)))return reply('Equipment price unavailable');
    totalCents+=price;
    normalized.push({id:Number(id),qty:Number(qty),name:product.name,rateCents:price});
  }
  try{
    const available=await availabilityForDates(start,end);
    const map=new Map(available.map(x=>[x.id,x]));
    for(const product of normalized){const record=map.get(product.id);
      if(!record||record.openQty<product.qty)
        return reply(`${product.name} is not available in the requested quantity for those dates. Please revise your selection.`,409);
    }
    const detail=[
      'EQUIPMENT RENTAL INQUIRY — NOT A RESERVATION',
      ...normalized.map(x=>`${x.name} × ${x.qty} — rate estimate $ ${(x.rateCents/100).toFixed(2)}`),
      `Rental window: ${start} through ${end}`,
      `Pickup window: ${pickup||'To be arranged'}; Return: ${returnWindow||'To be arranged'}`,
      `Preference: ${fulfilment}; Location: ${location||'Killeen, TX'}`,
      `Purpose: ${purpose}; Company: ${company||'Individual'}`,
      `Billing address (for review): ${address}`,
      `Estimated gear subtotal before tax: $${(totalCents/100).toFixed(2)}`,
      'All prices are estimates, subject to owner approval. Quotes valid for 14 days. No online payment/booking made.',
      'Government-issued ID and insurance/COI (where required) are verified privately before checkout. Signed agreement, checkout condition report, security authorization may be required.',
      `Notes: ${notes||'None'}`
    ].join('\n').slice(0,3000);
    const result=await createInquiry({name,email,phone,service:'Equipment Rental Inquiry',event_date:start,location:location||'Killeen, TX',
      budget:`Equipment estimate $${(totalCents/100).toFixed(2)} before tax`,details:detail},identifyIp(safeIp(request)));
    if(!result.ok)return reply('Too many inquiries. Please try later.',429);
    return NextResponse.json({ok:true,received:true,message:'Quote request received. No reservation is confirmed.'},{headers:{'Cache-Control':'no-store'}});
  }catch(error){console.error('Rental inquiry unavailable',error);return reply('We could not verify availability or save your inquiry. Please try again.',503);}
}
