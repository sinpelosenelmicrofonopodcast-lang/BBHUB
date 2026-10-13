import {NextResponse} from 'next/server';
import {requestIsSameOrigin} from '@/lib/auth';import {opsTalent} from '@/lib/operations-auth';
import {opsOne,opsInsert,validUuid,type Application} from '@/lib/operations-db';
export const runtime='nodejs';
export async function POST(request:Request){
 if(!requestIsSameOrigin(request))return new Response('Forbidden',{status:403});
 const talent=await opsTalent();if(!talent)return new Response('Login required',{status:401});
 const f=await request.formData(),id=String(f.get('applicationId')||''),message=String(f.get('message')||'').trim();
 if(!validUuid(id)||!message||message.length>3000)return new Response('Invalid message',{status:400});
 const app=await opsOne<Application>('pc_ops_applications',{id:`eq.${id}`,talent_id:`eq.${talent.id}`});
 if(!app)return new Response('Application not found',{status:404});
 await opsInsert('pc_ops_talent_messages',{application_id:id,talent_id:talent.id,author_type:'talent',author_id:talent.id,message});
 return NextResponse.redirect(new URL('/talent',request.url),303);
}
