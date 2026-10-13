import {NextResponse} from 'next/server';
import {requestIsSameOrigin} from '@/lib/auth';
import {clearClientSession} from '@/lib/client-auth';
export async function POST(request:Request){
  if(!requestIsSameOrigin(request))return new Response('Forbidden',{status:403});
  await clearClientSession();
  return NextResponse.redirect(new URL('/client/login',request.url),303);
}
