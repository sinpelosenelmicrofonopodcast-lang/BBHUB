import Link from 'next/link';
import type {Metadata} from 'next';
import {SiteHeader} from '@/components/SiteHeader';
import {Footer} from '@/components/Footer';
import {ShieldCheck,Camera,Clapperboard,Lightbulb,ArrowDownRight} from 'lucide-react';
import {EquipmentGallery} from '@/app/admin/equipment/EquipmentGallery';
import catalog from '@/lib/equipment-catalog.json';

export const metadata:Metadata={
  title:'Production Equipment Gallery | Prime Cut Studios',
  description:'Explore cameras, lenses, lighting, professional audio and production gear used by Prime Cut Studios in Central Texas. Equipment rentals are not available for online booking.'
};

const categories=[
  {name:'Camera & cinema',icon:Camera,copy:'Cinema cameras, lenses and camera support tailored to each shoot.'},
  {name:'Lights & grip',icon:Lightbulb,copy:'Professional lighting and shaping tools for controlled looks.'},
  {name:'Production support',icon:Clapperboard,copy:'Audio, stabilization, monitoring and live-production workflows.'}
];

export default function Rentals(){
  const photos=catalog.filter(item=>Boolean(item.imageUrl)).length;
  return <><SiteHeader/><main>
    <div className="shell pagehero">
      <div className="eyebrow">Production equipment</div>
      <h1>The right tools.<br/><em>For the right story.</em></h1>
      <p className="muted">Explore the cameras, lenses, lights and production tools behind our work. Manufacturer reference images show equipment models, not the condition or appearance of individual units.</p>
      <div style={{marginTop:28}}>
        <Link className="btn secondary" href="#equipment-gallery">View equipment gallery <ArrowDownRight size={17}/></Link>
      </div>
    </div>

    <section style={{paddingTop:15,paddingBottom:12}}>
      <div className="shell">
        <div className="note"><ShieldCheck size={20}/> Public rental booking is not active. None of our internal equipment is advertised as available for rental until specifically approved by Prime Cut Studios.</div>
      </div>
    </section>

    <section id="equipment-gallery" style={{paddingTop:42,paddingBottom:65,scrollMarginTop:100}}>
      <div className="shell">
        <div className="sectionhead" style={{alignItems:'start',marginBottom:15}}>
          <div>
            <div className="eyebrow">Our production toolkit</div>
            <h2>Get closer to the gear.</h2>
            <p className="muted" style={{maxWidth:820,marginTop:12}}>
              Browse {photos} linked manufacturer photographs and a reference list of {catalog.length} equipment models.
              Choose a category or search by brand. Select <b>Ver catálogo completo</b> to reveal models still awaiting a direct manufacturer image.
            </p>
          </div>
        </div>
        <EquipmentGallery items={catalog} publicView/>
      </div>
    </section>

    <section style={{paddingTop:15}}>
      <div className="shell">
        <div className="sectionhead">
          <div><div className="eyebrow">Production capabilities</div><h2>One crew. Every angle.</h2></div>
        </div>
        <div className="grid" style={{marginTop:28}}>
          {categories.map(item=><div className="card" key={item.name}>
            <item.icon size={34} color="#d6b46d" strokeWidth={1.5}/>
            <h3>{item.name}</h3><p className="muted">{item.copy}</p>
            <span className="pill">For Prime Cut productions</span>
          </div>)}
        </div>
        <div className="panel" style={{marginTop:24}}>
          <h2>Need a production crew?</h2>
          <p className="muted">Tell us what you want to create and we will recommend the right crew and equipment for your shoot. Rates, schedules and availability are confirmed individually.</p>
          <Link className="btn" href={`/book?service=${encodeURIComponent('Custom Production')}`}>Discuss your project ↗</Link>
        </div>
      </div>
    </section>
  </main><Footer/></>;
}
