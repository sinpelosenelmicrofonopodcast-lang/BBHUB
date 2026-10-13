import {NextResponse} from 'next/server';
import {createInquiry,identifyIp} from '@/lib/db';
import {equipmentById} from '@/lib/equipment-catalog';
import {equipmentOverrides} from '@/lib/operations-db';
import {requestIsSameOrigin,safeIp} from '@/lib/auth';
export const runtime='nodejs';
function result(url:string,reason:string){return NextResponse.redirect(new URL('/rentals?'+reason+'=1#request-rental',url),303)}
export async function POST(request:Request){
 if(!requestIsSameOrigin(request))return new Response('Invalid origin',{status:403});
 if(Number(request.headers.get('content-length')||0)>15000)return new Response('Too large',{status:413});
 try{
  const form=await request.formData();
  if(String(form.get('website')||''))return result(request.url,'sent');
  const ids=String(form.get('equipmentIds')||'').split(',').map(x=>x.trim()).filter(Boolean);
  if(!ids.length||ids.length>12||new Set(ids).size!==ids.length)return result(request.url,'invalid');
  const selected=ids.map(id=>equipmentById(id));
  if(selected.some(x=>!x||x.inventoryStatus!=='ready'))return result(request.url,'invalid');
  const overrides=new Map((await equipmentOverrides()).map(x=>[x.asset_id,x]));
  if(ids.some(id=>overrides.get(id)?.disabled))return result(request.url,'invalid');
  const name=String(form.get('name')||'').trim(),email=String(form.get('email')||'').trim().toLowerCase(),phone=String(form.get('phone')||'').trim();
  const start=String(form.get('startDate')||''),end=String(form.get('endDate')||''),notes=String(form.get('details')||'').trim();
  const today=new Date().toISOString().slice(0,10);
  if(name.length<2||name.length>120||!/^.{1,200}@.{1,200}\..{2,}$/.test(email)||email.length>254||phone.length>40||notes.length>1200||!/^\d{4}-\d{2}-\d{2}$/.test(start)||!/^\d{4}-\d{2}-\d{2}$/.test(end)||start<today||end<start)return result(request.url,'invalid');
  const details='RENTAL REQUEST — NOT A BOOKING\nEquipment asset IDs: '+ids.join(', ')+'\nReturn date: '+end+'\nNotes: '+notes;
  const created=await createInquiry({name,email,phone:phone||null,service:'Custom Production',event_date:start,location:null,budget:null,details},identifyIp(safeIp(request)));
  if(!created.ok)return result(request.url,'limit');
  return result(request.url,'sent');
 }catch(error){console.error('Rental request failed',error);return result(request.url,'error');}
}