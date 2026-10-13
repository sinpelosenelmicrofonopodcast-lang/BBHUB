import {NextResponse} from 'next/server';import {requestIsSameOrigin} from '@/lib/auth';import {opsLogout} from '@/lib/operations-auth';
export async function POST(request:Request){if(!requestIsSameOrigin(request))return new Response('Forbidden',{status:403});await opsLogout('talent');return NextResponse.redirect(new URL('/talent/login',request.url),303);}
