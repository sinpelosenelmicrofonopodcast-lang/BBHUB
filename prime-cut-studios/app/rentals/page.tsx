import type {Metadata} from 'next';
import {SiteHeader} from '@/components/SiteHeader';
import {Footer} from '@/components/Footer';
import {RentalExperienceV2} from './RentalExperienceV2';
import {consolidated,physicalSummary} from '@/lib/rental-availability';
import rates from '@/lib/rental-rates.json';
export const metadata:Metadata={title:'Equipment Rentals & Quotes | Prime Cut Studios',description:'Explore equipment, choose quantities, view daily/weekend/weekly reference prices and request a rental quote in Killeen, Texas. Booking is subject to approval.'};
export const runtime='nodejs';
export default function Rentals(){
 const items=consolidated();
 const stock=physicalSummary();
 return <><SiteHeader/><main>
  <div className="shell pagehero" style={{paddingBottom:20}}>
   <div className="eyebrow">Prime Cut Studios · Central Texas</div>
   <h1>Your production.<br/><em>Your equipment.</em></h1>
   <p className="muted">Build an equipment rental quote with real quantities and our published reference prices. Pickup, availability and eligibility are approved individually.</p>
  </div>
  <section id="equipment-gallery" className="shell" style={{paddingTop:30,paddingBottom:52}}>
   <RentalExperienceV2 items={items} stock={stock} rates={rates.rates}/>
  </section>
  <section id="rental-requirements" style={{background:'#11100e',borderTop:'1px solid #382d1b'}}>
   <div className="shell"><div className="eyebrow">Before your rental</div><h2 style={{fontFamily:'Georgia,serif',fontSize:'clamp(30px,4vw,49px)',margin:'14px 0 27px'}}>Rental requirements & policies</h2>
    <div className="grid" style={{gap:18}}>
     <article className="card"><h3>Identity & approval</h3><p className="muted">Full legal name, mobile number, email, billing address and intended use are required. A valid government-issued ID must be presented privately before pickup. High-value or specialized equipment may require experience verification and owner approval.</p></article>
     <article className="card"><h3>Insurance & security</h3><p className="muted">A security authorization/deposit may be required, based on equipment replacement risk. Commercial production insurance or a certificate of insurance may be requested for high-value items. Liability is determined by the signed rental agreement, not limited to the deposit amount.</p></article>
     <article className="card"><h3>Pickup, return & inspection</h3><p className="muted">Equipment is released only after approval, the signed agreement, required payment and any security authorization. Pickup/return windows must be confirmed. All items and included accessories are checked and photographed at pickup and return.</p></article>
     <article className="card"><h3>Late returns & damage</h3><p className="muted">Unapproved late returns may incur an additional day rate for each started rental day, plus documented permitted costs. Loss, theft, missing accessories, misuse and damage beyond normal wear are assessed under the signed rental agreement.</p></article>
     <article className="card"><h3>Restricted use</h3><p className="muted">No subrenting, unauthorized transfers, international travel, hazardous environments, unauthorized repairs or mounting to vehicles/aircraft without written approval. Water, sand and dust exposure require explicit authorization.</p></article>
     <article className="card"><h3>Rates, taxes & reservations</h3><p className="muted">Listed daily, weekend and seven-day rates are references or newly proposed estimates, not accepted bookings. Killeen sales tax is estimated at 8.25% and final tax depends on the transaction. Delivery is quoted separately. Written rental quotes generally expire after 14 days or sooner if availability changes. No payment is taken online in this flow.</p></article>
    </div>
    <p className="muted" style={{marginTop:28,fontSize:13,maxWidth:920}}>Prime Cut Studios productions take priority. Availability displayed for an inquiry is subject to final physical inspection and management approval; the system never promises that browsing or submitting a request reserves equipment. Equipment not ready for rental cannot be selected.</p>
   </div>
  </section>
 </main><Footer/></>;
}
