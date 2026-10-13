import {NextResponse} from 'next/server';import {requestIsSameOrigin,safeIp} from '@/lib/auth';import {identifyIp,clientCanAccess} from '@/lib/db';
import {clientAuthenticated} from '@/lib/client-auth';import {opsOne,opsInsert,opsPatch,audit,opsSignatureHash,type OpsItem} from '@/lib/operations-db';
export const runtime='nodejs';
export async function POST(request:Request){
 if(!requestIsSameOrigin(request))return new Response('Forbidden',{status:403});
 const client=await clientAuthenticated();if(!client)return new Response('Client login required',{status:401});
 const f=await request.formData(),id=String(f.get('itemId')||''),action=String(f.get('action')||''),note=String(f.get('note')||'').trim();
 const item=await opsOne<OpsItem>('pc_ops_items',{id:`eq.${id}`,visible_client:'eq.true'});
 if(!item||!await clientCanAccess(client.id,item.project_id)||note.length>3000)return new Response('Unauthorized / invalid',{status:403});
 if(action==='respond'){
  const status=String(f.get('response')||'');if(!['approved','changes_requested'].includes(status)||!['media','lookbook','location','approval','document'].includes(item.category))return new Response('Invalid approval',{status:400});
  const prior=await opsOne('pc_ops_responses',{item_id:`eq.${id}`,account_id:`eq.${client.id}`});
  if(prior)await opsPatch('pc_ops_responses',{item_id:`eq.${id}`,account_id:`eq.${client.id}`},{response:status,note,responded_at:new Date().toISOString()});
  else await opsInsert('pc_ops_responses',{item_id:id,account_id:client.id,response:status,note});
  await audit('client',client.id,'respond',item.category,id,{status});
 }else if(action==='comment'){
  if(!note)return new Response('Message required',{status:400});
  await opsInsert('pc_ops_comments',{item_id:id,author_type:'client',author_id:client.id,message:note,visible_client:true});
  await audit('client',client.id,'comment',item.category,id);
 }else if(action==='sign'){
  if(item.category!=='contract'||String(f.get('agree'))!=='yes')return new Response('Consent required',{status:400});
  const name=String(f.get('typedName')||'').trim();if(name.length<2||name.length>120||item.detail.length<20)return new Response('Invalid signature',{status:400});
  const signed=await opsOne('pc_ops_signatures',{item_id:`eq.${id}`,account_id:`eq.${client.id}`});
  if(signed)return new Response('Already signed; contact your producer to amend',{status:409});
  await opsInsert('pc_ops_signatures',{item_id:id,account_id:client.id,typed_name:name,document_sha256:await opsSignatureHash(item),consent_text:'I consent to use an electronic signature and agree to the complete document as displayed.',signer_ip_hash:identifyIp(safeIp(request))});
  await audit('client',client.id,'signed_document','contract',id,{sha256:await opsSignatureHash(item)});
 }else return new Response('Unknown action',{status:400});
 return NextResponse.redirect(new URL(`/client/projects/${item.project_id}/operations`,request.url),303);
}
