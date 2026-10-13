import type {Metadata} from 'next';
import {SiteHeader} from '@/components/SiteHeader';
import {Footer} from '@/components/Footer';
import {ShieldCheck} from 'lucide-react';
import {RentalExperience} from './RentalExperience';
import catalog from '@/lib/equipment-catalog.json';

export const metadata:Metadata={
  title:'Equipment Rental Requests | Prime Cut Studios',
  description:'Explore Canon, DJI, Aputure, RØDE and other production equipment. Build a gear list and request a custom equipment rental quote in Central Texas. Availability and rates are confirmed individually.'
};

export default function Rentals(){
  return <><SiteHeader/><main>
    <div className="shell pagehero" style={{paddingBottom:25}}>
      <div className="eyebrow">Prime Cut Studios / Production Rentals</div>
      <h1>Rent the gear.<br/><em>Create your vision.</em></h1>
      <p className="muted" style={{maxWidth:760}}>Explore our professional production kit, pick the equipment for your shoot and build a rental request. All rates and eligibility are individually quoted.</p>
    </div>
    <section style={{paddingTop:10,paddingBottom:12}}>
      <div className="shell"><div className="note"><ShieldCheck size={20}/> <span>Rental requests are reviewed manually. Browsing and requesting a quote do not confirm availability, create a reservation or charge a payment.</span></div></div>
    </section>
    <section id="equipment-gallery" style={{paddingTop:34,scrollMarginTop:100}}>
      <div className="shell"><RentalExperience items={catalog}/></div>
    </section>
  </main><Footer/></>;
}
