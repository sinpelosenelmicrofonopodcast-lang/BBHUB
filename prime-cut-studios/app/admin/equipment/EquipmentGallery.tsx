'use client';

import {useMemo, useState} from 'react';
import {ArrowUpRight, Camera, ImageOff, Search, ShieldCheck} from 'lucide-react';
import styles from './catalog.module.css';

export type EquipmentItem = {
  id: number;
  name: string;
  category: string;
  manufacturer: string;
  quantity: number;
  imageUrl: string | null;
  officialUrl: string | null;
  sourceStatus: string;
  modelNote: string;
};

type Filter = 'all' | 'direct-image' | 'manufacturer-page' | 'unverified';

function EquipmentCard({item}: {item: EquipmentItem}) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(item.imageUrl && !failed);
  return <article className={styles.card}>
    <div className={styles.imageWrap}>
      {showImage ? <img
        src={item.imageUrl!}
        alt={`Fotografía de producto: ${item.name}`}
        className={styles.productImage}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      /> : <div className={styles.imageMissing}><ImageOff size={34} aria-hidden="true"/><span>{failed ? 'Imagen de producto no disponible' : 'Sin imagen directa verificada'}</span></div>}
      <span className={styles.quantity}>×{item.quantity}</span>
    </div>
    <div className={styles.cardBody}>
      <p className={styles.category}>{item.category}</p>
      <h3>{item.name}</h3>
      <p className={styles.maker}>{item.manufacturer || 'Fabricante por confirmar'} · Ref. {String(item.id).padStart(3,'0')}</p>
      <p className={item.sourceStatus === 'direct-image' && !failed ? styles.goodStatus : styles.pendingStatus}>
        {item.sourceStatus === 'direct-image' && !failed ? 'Foto del producto enlazada' : item.officialUrl ? 'Página del fabricante disponible' : 'Pendiente de fuente oficial'}
      </p>
      {item.modelNote ? <p className={styles.warning}>{item.modelNote}</p> : null}
      <div className={styles.cardActions}>
        {item.officialUrl ? <a href={item.officialUrl} target="_blank" rel="noopener noreferrer">Ver fabricante <ArrowUpRight size={15} aria-hidden="true"/></a> : null}
        {item.imageUrl ? <a href={item.imageUrl} target="_blank" rel="noopener noreferrer">Ver fotografía <ArrowUpRight size={15} aria-hidden="true"/></a> : null}
      </div>
    </div>
  </article>;
}

function groupManufacturerModels(items:EquipmentItem[]):EquipmentItem[]{
 const groups=new Map<string,EquipmentItem>();
 for(const item of items){
  const name=item.name.trim().replace(/\s+#\d+$/,'');
  const key=item.category+'|'+name.normalize('NFKD').toLocaleLowerCase('en-US');
  const found=groups.get(key);
  if(!found){groups.set(key,{...item,name});continue;}
  found.quantity+=item.quantity;
  if(!found.imageUrl&&item.imageUrl)found.imageUrl=item.imageUrl;
  if(!found.officialUrl&&item.officialUrl)found.officialUrl=item.officialUrl;
  if(item.sourceStatus==='direct-image'&&item.imageUrl)found.sourceStatus='direct-image';
 }
 return [...groups.values()];
}

export function EquipmentGallery({items}: {items: EquipmentItem[]}) {
  const models=useMemo(()=>groupManufacturerModels(items),[items]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState<Filter>('all');
  const categories = useMemo(() => [...new Set(models.map(item => item.category))].sort((a,b) => a.localeCompare(b, 'es')), [models]);
  const totalPhotos = models.filter(item => item.imageUrl).length;
  const totalSources = models.filter(item => item.officialUrl).length;
  const filtered = useMemo(() => models.filter(item => {
    const term=search.trim().toLocaleLowerCase();
    const text=`${item.name} ${item.manufacturer} ${item.category}`.toLocaleLowerCase();
    return (!term || text.includes(term)) &&
      (category==='all' || item.category===category) &&
      (status==='all' || item.sourceStatus===status);
  }), [models,search,category,status]);
  return <div className={styles.catalog}>
    <div className={styles.metrics}>
      <div><strong>{models.length}</strong><span>Modelos únicos</span></div>
      <div><strong>{totalPhotos}</strong><span>Fotos directas enlazadas</span></div>
      <div><strong>{totalSources}</strong><span>Fuentes de producto</span></div>
      <div><strong>{models.length-totalPhotos}</strong><span>Fotos pendientes</span></div>
    </div>
    <div className={styles.notice}><ShieldCheck size={20} aria-hidden="true"/><p><b>Catálogo interno.</b> Las imágenes son fotografías de referencia del producto, algunas recortadas para el catálogo; no representan el estado físico del inventario. La disponibilidad para alquiler no está habilitada ni se presume. Algunos modelos y variantes siguen pendientes de validación.</p></div>
    <div className={styles.filters}>
      <label className={styles.searchField}>
        <Search size={18} aria-hidden="true"/>
        <span className={styles.srOnly}>Buscar equipos</span>
        <input type="search" placeholder="Buscar equipo, marca o modelo" value={search} onChange={e=>setSearch(e.target.value)}/>
      </label>
      <label className={styles.selectField}><span className={styles.srOnly}>Categoría</span><select value={category} onChange={e=>setCategory(e.target.value)}><option value="all">Todas las categorías</option>{categories.map(c=><option value={c} key={c}>{c}</option>)}</select></label>
      <label className={styles.selectField}><span className={styles.srOnly}>Disponibilidad de fotografía</span><select value={status} onChange={e=>setStatus(e.target.value as Filter)}><option value="all">Todas las fuentes</option><option value="direct-image">Foto directa</option><option value="manufacturer-page">Página del fabricante</option><option value="unverified">Sin fuente verificada</option></select></label>
    </div>
    <p className={styles.count}><Camera size={16} aria-hidden="true"/> Mostrando {filtered.length} de {models.length} modelos</p>
    {filtered.length ? <div className={styles.grid}>{filtered.map(item=><EquipmentCard item={item} key={item.id}/>)}</div> : <div className={styles.noResults}>No encontramos equipos con esos filtros.</div>}
  </div>;
}
