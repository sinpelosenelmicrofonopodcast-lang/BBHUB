import {NextResponse} from 'next/server';
import {requestIsSameOrigin} from '@/lib/auth';
import {opsActor,canArea,canProject,areaForCategory} from '@/lib/operations-auth';
import {opsInsert,opsPatch,opsOne,audit,itemCategories,itemStatuses,safeHttps,validUuid,opsAssignedStaff,type OpsItem,type Casting,type Application,type Staff} from '@/lib/operations-db';
export const runtime='nodejs';
const go=(r:Request,path:string)=>NextResponse.redirect(new URL(path,r.url),303);
export async function POST(request:Request){
 if(!requestIsSameOrigin(request))return new Response('Invalid origin',{status:403});
 const actor=await opsActor();if(!actor)return new Response('Login required',{status:401});
 const f=await request.formData(),action=String(f.get('action')||''),projectId=String(f.get('projectId')||'');
 if(action==='item'){
  if(!validUuid(projectId)||!await canProject(actor,projectId))return new Response('Project denied',{status:403});
  const cat=String(f.get('category')||''),area=areaForCategory(cat);
  if(!area||!itemCategories.includes(cat as typeof itemCategories[number])||!canArea(actor,area))return new Response('Module denied',{status:403});
  const title=String(f.get('title')||'').trim(),detail=String(f.get('detail')||'').trim(),url=String(f.get('url')||'').trim(),due=String(f.get('dueAt')||'').trim(),money=String(f.get('amount')||'').trim();
  if(title.length<2||title.length>160||detail.length>12000||url&&!safeHttps(url)||due&&Number.isNaN(Date.parse(due)))return new Response('Invalid item',{status:400});
  let cents:number|null=null;if(money){const n=Number(money);if(cat!=='budget'||!Number.isFinite(n)||n<0||n>10000000)return new Response('Invalid budget',{status:400});cents=Math.round(n*100);}
  const staffId=String(f.get('assignee')||'');let assignee:string|null=null;
  if(staffId){const staff=validUuid(staffId)?await opsOne<Staff>('pc_ops_staff',{id:`eq.${staffId}`,disabled:'eq.false'}):null;if(!staff||(!staff.all_projects&&!await opsAssignedStaff(staff.id,projectId)))return new Response('Assignee is not authorized for this project',{status:400});assignee=staffId;}
  const visible=String(f.get('clientVisible'))==='yes';if(visible&&!['lookbook','location','media','document','contract','approval','message'].includes(cat))return new Response('Cannot share this kind of internal record',{status:400});
  const item=await opsInsert<OpsItem>('pc_ops_items',{project_id:projectId,category:cat,title,detail,reference_url:url?safeHttps(url):null,amount_cents:cents,due_at:due?new Date(due).toISOString():null,assigned_staff_id:assignee,visible_client:visible});
  await audit(actor.kind,actor.id,'create_item',cat,item.id,{projectId,visible});return go(request,`/operations/projects/${projectId}`);
 }
 if(action==='status'||action==='comment'){
  const id=String(f.get('itemId')||''),item=validUuid(id)?await opsOne<OpsItem>('pc_ops_items',{id:`eq.${id}`}):null;
  const area=item?areaForCategory(item.category):undefined;if(!item||!area||!canArea(actor,area)||!await canProject(actor,item.project_id))return new Response('Forbidden',{status:403});
  if(action==='status'){
   const status=String(f.get('status')||'');if(!itemStatuses.includes(status as typeof itemStatuses[number]))return new Response('Invalid status',{status:400});
   await opsPatch('pc_ops_items',{id:`eq.${id}`},{status,updated_at:new Date().toISOString()});await audit(actor.kind,actor.id,'item_status',item.category,id,{status});
  }else{
   const message=String(f.get('message')||'').trim();if(!message||message.length>3000)return new Response('Invalid message',{status:400});
   await opsInsert('pc_ops_comments',{item_id:id,author_type:actor.kind,author_id:actor.id,message,visible_client:item.visible_client&&String(f.get('clientVisible'))==='yes'});await audit(actor.kind,actor.id,'comment',item.category,id);
  }
  return go(request,`/operations/projects/${item.project_id}`);
 }
 if(action==='casting'){
  if(!canArea(actor,'casting'))return new Response('Forbidden',{status:403});
  if(projectId&&(!validUuid(projectId)||!await canProject(actor,projectId)))return new Response('Project denied',{status:403});
  const title=String(f.get('title')||'').trim(),slug=String(f.get('slug')||'').trim().toLowerCase(),description=String(f.get('description')||'').trim(),requirements=String(f.get('requirements')||'').trim(),location=String(f.get('location')||'').trim(),compensation=String(f.get('compensation')||'').trim(),closes=String(f.get('closes')||'').trim();
  if(title.length<5||title.length>160||!/^[a-z0-9-]{6,100}$/.test(slug)||description.length>6000||requirements.length>4000||location.length>150||compensation.length>200||closes&&Number.isNaN(Date.parse(closes)))return new Response('Invalid casting',{status:400});
  const c=await opsInsert<Casting>('pc_ops_castings',{project_id:projectId||null,title,slug,description,requirements,location,compensation,closes_at:closes?new Date(closes).toISOString():null,status:'draft'});
  await audit(actor.kind,actor.id,'create_casting','casting',c.id);return go(request,'/operations/casting');
 }
 if(action==='casting_status'){
  if(!canArea(actor,'casting'))return new Response('Forbidden',{status:403});
  const id=String(f.get('castingId')||''),status=String(f.get('status')||'');if(!validUuid(id)||!['draft','open','closed'].includes(status))return new Response('Invalid action',{status:400});
  const c=await opsOne<Casting>('pc_ops_castings',{id:`eq.${id}`});if(!c||c.project_id&&!await canProject(actor,c.project_id))return new Response('Forbidden',{status:403});
  await opsPatch('pc_ops_castings',{id:`eq.${id}`},{status});await audit(actor.kind,actor.id,'casting_status','casting',id,{status});return go(request,'/operations/casting');
 }
 if(action==='application_status'){
  if(!canArea(actor,'casting'))return new Response('Forbidden',{status:403});
  const id=String(f.get('applicationId')||''),status=String(f.get('status')||'');if(!validUuid(id)||!['submitted','shortlisted','audition','selected','declined'].includes(status))return new Response('Invalid selection',{status:400});
  const app=await opsOne<Application>('pc_ops_applications',{id:`eq.${id}`});const c=app?await opsOne<Casting>('pc_ops_castings',{id:`eq.${app.casting_id}`}):null;
  if(!c||c.project_id&&!await canProject(actor,c.project_id))return new Response('Forbidden',{status:403});
  await opsPatch('pc_ops_applications',{id:`eq.${id}`},{status,updated_at:new Date().toISOString()});await audit(actor.kind,actor.id,'application_status','application',id,{status});return go(request,'/operations/casting');
 }
 if(action==='assign_staff'||action==='disable_staff'){
  if(actor.kind!=='owner')return new Response('Owner only',{status:403});
  const staffId=String(f.get('staffId')||'');if(!validUuid(staffId))return new Response('Bad staff',{status:400});
  if(action==='assign_staff'){
   if(!validUuid(projectId))return new Response('Bad project',{status:400});const present=await opsOne('pc_ops_staff_projects',{staff_id:`eq.${staffId}`,project_id:`eq.${projectId}`});if(!present)await opsInsert('pc_ops_staff_projects',{staff_id:staffId,project_id:projectId});
   await audit('owner',null,'assign_staff','project',projectId,{staffId});
  }else{
   const staff=await opsOne<Staff>('pc_ops_staff',{id:`eq.${staffId}`});if(!staff)return new Response('Staff not found',{status:404});
   await opsPatch('pc_ops_staff',{id:`eq.${staffId}`},{disabled:!staff.disabled,session_version:staff.session_version+1});await audit('owner',null,'toggle_staff','staff',staffId,{disabled:!staff.disabled});
  }
  return go(request,'/operations/team');
 }
 return new Response('Unknown action',{status:400});
}
