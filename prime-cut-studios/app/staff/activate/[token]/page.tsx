import {notFound} from 'next/navigation';import {sha256,opsOne} from '@/lib/operations-db';
export const runtime='nodejs';export const dynamic='force-dynamic';
export default async function Accept({params}:{params:Promise<{token:string}>}){
 const {token}=await params;if(!/^[A-Za-z0-9_-]{43}$/.test(token))notFound();
 const invite=await opsOne<{name:string;email:string;role:string}>('pc_ops_staff_invites',{token_hash:`eq.${sha256(token)}`,redeemed_at:'is.null',expires_at:`gt.${new Date().toISOString()}`});
 if(!invite)notFound();return <main className="shell"><section className="pagehero"><div className="eyebrow">Prime Cut Studios · Staff onboarding</div><h1>Welcome, {invite.name}</h1><p>Your role: {invite.role}. Invitation for {invite.email}.</p></section><section className="panel" style={{maxWidth:560,margin:'auto'}}><form method="post" action="/api/staff/activate" className="form"><input type="hidden" name="token" value={token}/><div className="field"><label>Choose a secure password (12+ characters)</label><input type="password" name="password" minLength={12} maxLength={128} autoComplete="new-password" required/></div><button className="btn">Activate my account</button></form></section></main>;
}
