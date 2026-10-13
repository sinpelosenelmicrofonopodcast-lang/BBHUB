'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowUpRight,Camera,Images,Play} from 'lucide-react';
type Props={albumUrl:string;embedUrl?:string|null;title:string;description?:string;featured?:boolean};
// Adobe is the single photo source. No downloads, copying, image transformations,
// sync API calls, pollers or duplicate cloud storage. The browser loads the
// official album only when a visitor approaches this section.
export function LiveLightroomShowcase({albumUrl,embedUrl,title,description,featured=false}:Props){
 const node=useRef<HTMLElement|null>(null);
 const [near,setNear]=useState(false);
 const [loaded,setLoaded]=useState(false);
 const albumHost=(()=>{try{const u=new URL(albumUrl);return u.protocol==='https:'&&['adobe.ly','lightroom.adobe.com'].includes(u.hostname);}catch{return false}})();
 const source=(()=>{try{const u=new URL(embedUrl||'');return u.protocol==='https:'&&u.hostname==='lightroom.adobe.com'?u.toString():null;}catch{return null}})();
 // For an album share link, attempt a lazy preview with a guaranteed external
 // fallback. Some Lightroom share links disallow iframe embedding.
 const frameUrl=source||(albumHost?albumUrl:null);
 useEffect(()=>{
  const target=node.current;
  if(!target||near)return;
  if(typeof IntersectionObserver==='undefined'){setNear(true);return;}
  const observer=new IntersectionObserver((entries)=>{
   if(entries.some(e=>e.isIntersecting)){setNear(true);observer.disconnect();}
  },{rootMargin:'180px 0px',threshold:0});
  observer.observe(target);return ()=>observer.disconnect();
 },[near]);
 if(!albumHost)return null;
 return <section ref={node} className={'prime-live-gallery '+(featured?'prime-live-featured':'')} aria-label={title}>
  <div className="prime-live-gallery-copy">
   <div className="eyebrow"><span className="prime-live-pulse" aria-hidden="true"/> Lightroom · álbum en vivo</div>
   <h2>{title}</h2>
   <p>{description||'Nuestro trabajo fotográfico, actualizado desde Lightroom.'}</p>
   <div className="prime-live-gallery-actions">
    <a className="btn" href={albumUrl} target="_blank" rel="noopener noreferrer">Ver álbum completo <ArrowUpRight size={17}/></a>
    <span className="prime-live-gallery-caption"><Images size={16}/> Todas las fotos · Siempre la misma galería</span>
   </div>
  </div>
  <div className={'prime-live-stage '+(near?'prime-live-onstage':'')}>
   <div className="prime-live-stage-lines" aria-hidden="true"><span/><span/><span/></div>
   {near&&frameUrl?<iframe
    className={'prime-live-iframe '+(loaded?'prime-live-iframe-ready':'')}
    src={frameUrl} title={'Lightroom album — '+title}
    loading="lazy" referrerPolicy="strict-origin-when-cross-origin"
    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
    allowFullScreen onLoad={()=>setLoaded(true)}
   />:null}
   {!near&&<div className="prime-live-stage-idle"><Camera size={42} strokeWidth={1}/><span>PRIME CUT STUDIOS</span><strong>VISUAL STORIES</strong><small>Vista del álbum al entrar en pantalla</small></div>}
   {near&&!loaded&&<div className="prime-live-stage-wait"><Play size={30}/><span>Conectando la galería de Lightroom...</span></div>}
   <div className="prime-live-stage-edge" aria-hidden="true"/>
  </div>
  <p className="prime-live-gallery-footnote">Las imágenes se sirven desde Adobe cuando visitas esta sección. Si Lightroom bloquea la vista integrada, utiliza «Ver álbum completo».</p>
 </section>;
}