import {NextResponse} from 'next/server';
import {availabilityForDates, datesValid} from '@/lib/rental-availability';

export const dynamic='force-dynamic';
export const runtime='nodejs';

export async function GET(request:Request){
  const url=new URL(request.url);
  const start=url.searchParams.get('start')||'',end=url.searchParams.get('end')||'';
  if(!datesValid(start,end))return NextResponse.json({error:'Invalid or unsupported date range'},{status:400,headers:{'Cache-Control':'no-store'}});
  try{
    const availability=await availabilityForDates(start,end);
    // Only public-safe quantities and commercial reference rate; never private asset IDs.
    return NextResponse.json({availability},{headers:{'Cache-Control':'no-store, max-age=0'}});
  }catch{
    return NextResponse.json({error:'Availability verification temporarily unavailable'},{status:503,headers:{'Cache-Control':'no-store'}});
  }
}
