import {NextResponse} from 'next/server';
import {requestIsSameOrigin,safeIp,sameOriginRedirect} from '@/lib/auth';
import {identifyIp,normalizedEmail,clientAccountByEmail,clientLoginThrottled,recordClientLoginFailure} from '@/lib/db';
import {setClientSession,verifyClientPassword} from '@/lib/client-auth';
import {staffMemberForAccount} from '@/lib/operations-staff';
export const runtime='nodejs';
export async function POST(request:Request){
  if(!requestIsSameOrigin(request))return new Response('Forbidden',{status:403});
  const form=await request.formData();
  const email=normalizedEmail(String(form.get('email')||''));
  const password=String(form.get('password')||'');
  const redirectTo=(name:string)=>NextResponse.redirect(sameOriginRedirect(request,`/client/login?status=${name}`),303);
  const hash=identifyIp(safeIp(request));
  if(await clientLoginThrottled(hash))return redirectTo('locked');
  if(!email||email.length>254||password.length>256)return redirectTo('invalid');
  const account=await clientAccountByEmail(email);
  if(!account||account.disabled||!verifyClientPassword(password,account.password_hash)){
    await recordClientLoginFailure(hash);
    return redirectTo('invalid');
  }
  await setClientSession(account);
  const staff=await staffMemberForAccount(account.id);
  return NextResponse.redirect(sameOriginRedirect(request,staff?'/team':'/client'),303);
}
