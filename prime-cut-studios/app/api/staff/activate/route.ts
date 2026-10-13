import {NextResponse} from 'next/server';import {requestIsSameOrigin} from '@/lib/auth';
import {opsList,opsRedeemStaffInvite,opsStaffById,sha256,audit} from '@/lib/operations-db';
import {hashOpsPassword,setStaffCookie} from '@/lib/operations-auth';
export const runtime='nodejs';
export async function POST(request:Request){
 if(!requestIsSameOrigin(request))return new Response('Forbidden',{status:403});
 const f=await request.formData(),token=String(f.get('token')||''),pw=String(f.get('password')||'');
 if(!/^[A-Za-z0-9_-]{43}$/.test(token)||pw.length<12||pw.length>128)return new Response('Invalid invite or password',{status:400});
 const inv=await opsList<{token_hash:string}>('pc_ops_staff_invites',{token_hash:`eq.${sha256(token)}`,redeemed_at:'is.null',expires_at:`gt.${new Date().toISOString()}`,limit:'1'});
 if(!inv.length)return new Response('Invite expired or used',{status:410});
 const id=await opsRedeemStaffInvite(token,hashOpsPassword(pw));if(!id)return new Response('Invitation no longer available',{status:409});
 const staff=await opsStaffById(id);if(!staff)return new Response('Cannot start session',{status:500});
 await setStaffCookie(staff);await audit('staff',staff.id,'activate_staff','staff',staff.id);
 return NextResponse.redirect(new URL('/operations',request.url),303);
}
