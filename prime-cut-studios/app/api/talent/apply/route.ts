import {NextResponse} from 'next/server';import {requestIsSameOrigin} from '@/lib/auth';import {opsTalent} from '@/lib/operations-auth';
import {opsOne,opsInsert,safeHttps,type Casting} from '@/lib/operations-db';
export const runtime='nodejs';
export async function POST(request:Request){
 if(!requestIsSameOrigin(request))return new Response('Forbidden',{status:403});
 const talent=await opsTalent();if(!talent)return NextResponse.redirect(new URL('/talent/login',request.url),303);
 const f=await request.formData(),id=String(f.get('castingId')||''),intro=String(f.get('intro')||'').trim(),link=String(f.get('auditionUrl')||'').trim();
 if(intro.length>2000||link&&(!safeHttps(link)||link.length>1000))return new Response('Invalid application',{status:400});
 const casting=await opsOne<Casting>('pc_ops_castings',{id:`eq.${id}`,status:'eq.open'});
 if(!casting||casting.closes_at&&Date.parse(casting.closes_at)<Date.now())return new Response('Casting closed',{status:409});
 const exists=await opsOne('pc_ops_applications',{casting_id:`eq.${id}`,talent_id:`eq.${talent.id}`});if(exists)return new Response('Application already submitted',{status:409});
 await opsInsert('pc_ops_applications',{casting_id:id,talent_id:talent.id,intro,audition_url:link?safeHttps(link):null});
 return NextResponse.redirect(new URL('/talent',request.url),303);
}
