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

function EquipmentCard({item, publicView=false}: {item: EquipmentItem; publicView?: boolean}) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(item.imageUrl && !failed);
  return <article className={styles.card}>
    <div className={styles.imageWrap}>
      {showImage ? <img
        src={item.imageUrl!}
        alt={`Fotografía del fabricante: ${item.name}`}
        className={styles.productImage}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      /> : <div className={styles.imageMissing}><ImageOff size={34} aria-hidden="true"/><span>{failed ? 'Imagen externa no disponible' : 'Sin imagen directa verificada'}</span></div>}
      {!publicView && <span className={styles.quantity}>×{item.quantity}</span>}
    </div>
    <div className={styles.cardBody}>
      <p className={styles.category}>{item.category}</p>
      <h3>{item.name}</h3>
      <p className={styles.maker}>{item.manufacturer || 'Fabricante por confirmar'}{!publicView ? ` · Ref. ${String(item.id).padStart(3,'0')}` : ''}</p>
      <p className={item.sourceStatus === 'direct-image' && !failed ? styles.goodStatus : styles.pendingStatus}>
        {item.sourceStatus === 'direct-image' && !failed ? 'Foto del fabricante enlazada' : item.officialUrl ? 'Página del fabricante disponible' : 'Pendiente de fuente oficial'}
      </p>
      {item.modelNote ? <p className={styles.warning}>{item.modelNote}</p> : null}
      <div className={styles.cardActions}>
        {item.officialUrl ? <a href={item.officialUrl} target="_blank" rel="noopener noreferrer">Ver fabricante <ArrowUpRight size={15} aria-hidden="true"/></a> : null}
        {item.imageUrl ? <a href={item.imageUrl} target="_blank" rel="noopener noreferrer">Ver fotografía <ArrowUpRight size={15} aria-hidden="true"/></a> : null}
      </div>
    </div>
  </article>;
}

export function EquipmentGallery({items, publicView=false}: {items: EquipmentItem[]; publicView?: boolean}) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState<Filter>(publicView ? 'direct-image' : 'all');
  const categories = useMemo(() => [...new Set(items.map(item => item.category))].sort((a,b) => a.localeCompare(b, 'es')), [items]);
  const totalPhotos = items.filter(item => item.imageUrl).length;
  const totalSources = items.filter(item => item.officialUrl).length;
  const filtered = useMemo(() => items.filter(item => {
    const term=search.trim().toLocaleLowerCase();
    const text=`${item.name} ${item.manufacturer} ${item.category}`.toLocaleLowerCase();
    return (!term || text.includes(term)) &&
      (category==='all' || item.category===category) &&
      (status==='all' || item.sourceStatus===status);
  }), [items,search,category,status]);
  return <div className={styles.catalog}>
    <div className={styles.metrics}>
      <div><strong>{items.length}</strong><span>Modelos y referencias</span></div>
      <div><strong>{totalPhotos}</strong><span>Fotos directas enlazadas</span></div>
      <div><strong>{totalSources}</strong><span>Fuentes de producto</span></div>
      <div><strong>{items.length-totalPhotos}</strong><span>Fotos pendientes</span></div>
    </div>
    <div className={styles.notice}><ShieldCheck size={20} aria-hidden="true"/><p><b>{publicView ? 'Production equipment showcase.' : 'Catálogo interno.'}</b> Las imágenes son referencias externas de los fabricantes, no fotografías de las unidades físicas. El equipo se utiliza en nuestras producciones. <strong>No hay alquileres en línea ni disponibilidad anunciada.</strong> Algunas variantes e imágenes están pendientes de confirmación.</p></div>
    <div className={styles.filters}>
      <label className={styles.searchField}>
        <Search size={18} aria-hidden="true"/>
        <span className={styles.srOnly}>Buscar equipos</span>
        <input type="search" placeholder="Buscar equipo, marca o modelo" value={search} onChange={e=>setSearch(e.target.value)}/>
      </label>
      <label className={styles.selectField}><span className={styles.srOnly}>Categoría</span><select value={category} onChange={e=>setCategory(e.target.value)}><option value="all">Todas las categorías</option>{categories.map(c=><option value={c} key={c}>{c}</option>)}</select></label>
      <label className={styles.selectField}><span className={styles.srOnly}>Disponibilidad de fotografía</span><select value={status} onChange={e=>setStatus(e.target.value as Filter)}><option value="all">Todas las fuentes</option><option value="direct-image">Foto directa</option><option value="manufacturer-page">Página del fabricante</option><option value="unverified">Sin fuente verificada</option></select></label>
    </div>
    <div className={styles.galleryToolbar}><p className={styles.count}><Camera size={16} aria-hidden="true"/> Mostrando {filtered.length} de {items.length} referencias</p>{publicView && <button type="button" className={styles.showAllButton} onClick={()=>setStatus(status==="all"?"direct-image":"all")}>{status==="all"?"Ver solo equipos con fotografías":"Ver catálogo completo (128 referencias)"}</button>}</div>
    {filtered.length ? <div className={styles.grid}>{filtered.map(item=><EquipmentCard item={item} publicView={publicView} key={item.id}/>)}</div> : <div className={styles.noResults}>No encontramos equipos con esos filtros.</div>}
  </div>;
}
