import Link from 'next/link';
import {notFound, redirect} from 'next/navigation';
import {operationsSession, getTasks} from '@/lib/operations-db';
import {roleCan, scopeCan} from '@/lib/operations-policy';
import {getProject, listDeliverables} from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const pipeline = [
  ['Definición', 'Brief y objetivos'],
  ['Concepto', 'Tratamiento creativo'],
  ['Presupuesto', 'Acuerdos y alcance'],
  ['Planificación', 'Fechas y personal'],
  ['Casting', 'Talento y elenco'],
  ['Locaciones', 'Scouting y permisos'],
  ['Guion', 'Storyboard y paleta'],
  ['Preproducción', 'Últimos preparativos'],
  ['Rodaje', 'Producción principal'],
  ['Postproducción', 'Edición y sonido'],
  ['Revisión', 'Feedback y ajustes'],
  ['Entrega', 'Archivos finales'],
  ['Cierre', 'Archivo del proyecto'],
] as const;

const statusToStage:Record<string,number> = {
  planning:0, quoted:2, contract:2, 'deposit-pending':2,
  scheduled:7, shooting:8, editing:9, 'client-review':10,
  delivered:11, archived:12,
};
const statusNames:Record<string,string> = {
  planning:'En planificación', quoted:'Cotización', contract:'Acuerdos',
  'deposit-pending':'Depósito pendiente', scheduled:'Programado',
  shooting:'En rodaje', editing:'En edición', 'client-review':'Revisión del cliente',
  delivered:'Entregado', archived:'Archivado',
};
const taskNames:Record<string,string> = {todo:'Pendiente',doing:'En proceso',blocked:'Bloqueado',done:'Completado'};
function dateLabel(value:string|null|undefined){
  if(!value)return 'Por confirmar';
  const d=new Date(value);
  return Number.isNaN(d.getTime())?value:d.toLocaleDateString('es-US',{year:'numeric',month:'short',day:'numeric',timeZone:'UTC'});
}
function money(value:number|null){
  return value===null?'Por cotizar':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(value/100);
}
export default async function ProjectOperations({params}:{params:Promise<{id:string}>}){
  const member=await operationsSession();
  if(!member)redirect('/client/login');
  const {id}=await params;
  if(!scopeCan(member.scope,'projects.read',id))notFound();
  const project=await getProject(id);
  if(!project)notFound();
  const [tasks,files]=await Promise.all([
    roleCan(member.role,'tasks.read') ? getTasks([id],false) : Promise.resolve([]),
    listDeliverables(id,false),
  ]);
  const editable=scopeCan(member.scope,'projects.write',id);
  const taskEditor=scopeCan(member.scope,'tasks.write',id);
  const pending=tasks.filter(t=>t.status!=='done').length;
  const blocked=tasks.filter(t=>t.status==='blocked').length;
  const done=tasks.filter(t=>t.status==='done').length;
  const currentStage=statusToStage[project.status]??0;
  return <main className="pcos-workspace">
    <header className="pcos-topbar">
      <Link href="/team" className="pcos-wordmark">PRIME CUT <span>STUDIOS</span><small>Production OS</small></Link>
      <div className="pcos-topbar-actions"><span className="pcos-private">Área privada</span><Link href="/team" className="pcos-back">← Todos los proyectos</Link></div>
    </header>
    <div className="pcos-frame">
      <aside className="pcos-sidebar" aria-label="Navegación del proyecto">
        <p className="pcos-sidebar-label">ESTE PROYECTO</p>
        <a href="#resumen" className="pcos-sidebar-link">Resumen <span>01</span></a>
        <a href="#progreso" className="pcos-sidebar-link">Etapas de producción <span>02</span></a>
        <a href="#tareas" className="pcos-sidebar-link">Tareas y responsables <span>03</span></a>
        <a href="#archivos" className="pcos-sidebar-link">Archivos y entregables <span>04</span></a>
        <a href="#informacion" className="pcos-sidebar-link">Ficha de producción <span>05</span></a>
        <div className="pcos-sidebar-foot">Solo personal autorizado · {member.role.replaceAll('_',' ')}</div>
      </aside>
      <div className="pcos-main">
        <section className="pcos-project-header" id="resumen">
          <div className="pcos-overline">PRODUCCIONES / EXPEDIENTE <span>·</span> {project.id.slice(0,8).toUpperCase()}</div>
          <div className="pcos-heading-row">
            <div><h1>{project.title}</h1><p>Cliente: <strong>{project.client_name}</strong> · {project.location||'Locación por confirmar'}</p></div>
            <span className="pcos-state"><span className="pcos-state-dot"/> {statusNames[project.status]||project.status}</span>
          </div>
          <div className="pcos-stats">
            <div><span>Fecha del evento</span><strong>{dateLabel(project.event_date)}</strong></div>
            <div><span>Cotización</span><strong>{money(project.quote_amount_cents)}</strong></div>
            <div><span>Tareas abiertas</span><strong>{pending}</strong></div>
            <div><span>Bloqueos</span><strong>{blocked}</strong></div>
          </div>
        </section>
        <div className="pcos-split">
          <section className="pcos-card pcos-pipeline" id="progreso">
            <div className="pcos-card-head"><div><span className="pcos-overline">VISIÓN GENERAL</span><h2>Etapas de producción</h2></div><span className="pcos-chip">13 etapas</span></div>
            <p className="pcos-card-intro">Etapa identificada a partir del estado general del proyecto. Las etapas anteriores no se marcan como completadas sin evidencia registrada.</p>
            <ol className="pcos-stages">
              {pipeline.map(([label,description],index)=><li key={label} className={index===currentStage?'pcos-stage-current':''}>
                <span className="pcos-step">{String(index+1).padStart(2,'0')}</span>
                <div><strong>{label}</strong><small>{description}</small></div>
                {index===currentStage?<span className="pcos-now">Actual</span>:<span className="pcos-await">—</span>}
              </li>)}
            </ol>
          </section>
          <div className="pcos-right-column">
            <section className="pcos-card" id="tareas">
              <div className="pcos-card-head"><div><span className="pcos-overline">EQUIPO</span><h2>Acciones pendientes</h2></div><span className="pcos-chip">{done}/{tasks.length} cerradas</span></div>
              {tasks.length>0?<div className="pcos-task-list">{tasks.map(task=><article className="pcos-task" key={task.id}>
                <div className="pcos-task-heading"><strong>{task.title}</strong><span className={'pcos-task-status pcos-task-'+task.status}>{taskNames[task.status]}</span></div>
                {task.description&&<p>{task.description}</p>}
                <div className="pcos-task-footer"><small>Vence: {dateLabel(task.due_at)}</small>
                {taskEditor&&<form action="/api/team/tasks" method="post" className="pcos-inline-form">
                  <input type="hidden" name="returnToProject" value="1"/><input type="hidden" name="action" value="status"/><input type="hidden" name="id" value={task.id}/>
                  <select name="status" defaultValue={task.status} aria-label={'Estado de '+task.title}><option value="todo">Pendiente</option><option value="doing">En proceso</option><option value="blocked">Bloqueado</option><option value="done">Completado</option></select>
                  <button type="submit">Guardar</button>
                </form>}</div>
              </article>)}</div>:<p className="pcos-empty">No hay tareas registradas para este proyecto.</p>}
              {taskEditor&&<details className="pcos-add"><summary>+ Nueva tarea</summary><form action="/api/team/tasks" method="post" className="pcos-task-create">
                <input type="hidden" name="returnToProject" value="1"/><input type="hidden" name="projectId" value={project.id}/>
                <label>Tarea<input name="title" minLength={2} maxLength={180} placeholder="Ej. Confirmar locación" required/></label>
                <label>Detalles<textarea name="description" maxLength={2000} rows={3}/></label>
                <label>Fecha límite<input name="dueDate" type="date"/></label>
                <button type="submit">Crear tarea</button>
              </form></details>}
            </section>
            <section className="pcos-card" id="archivos">
              <div className="pcos-card-head"><div><span className="pcos-overline">RECURSOS</span><h2>Archivos y entregables</h2></div><span className="pcos-chip">{files.length}</span></div>
              {files.length?<div className="pcos-files">{files.map(file=><article key={file.id} className="pcos-file">
                <span className="pcos-file-icon">↗</span><div><strong>{file.title}</strong><small>{file.provider||'Archivo'} · {file.visible?'Visible al cliente':'Solo equipo'}</small></div>
                {file.url?<a href={file.url} target="_blank" rel="noopener noreferrer" aria-label={'Abrir '+file.title}>Abrir</a>:<span className="pcos-await">Pendiente</span>}
              </article>)}</div>:<p className="pcos-empty">Todavía no hay entregables vinculados.</p>}
            </section>
            <section className="pcos-card" id="informacion">
              <div className="pcos-card-head"><div><span className="pcos-overline">EXPEDIENTE</span><h2>Ficha del proyecto</h2></div></div>
              <dl className="pcos-details"><div><dt>Cliente</dt><dd>{project.client_name}</dd></div><div><dt>Correo</dt><dd>{project.client_email}</dd></div><div><dt>Locación</dt><dd>{project.location||'Por confirmar'}</dd></div><div><dt>Fecha</dt><dd>{dateLabel(project.event_date)}</dd></div></dl>
              <div className="pcos-notes"><strong>Notas de producción</strong><p>{project.quote_notes||'No hay notas registradas todavía.'}</p></div>
              {editable&&<div className="pcos-info-foot">Los cambios administrativos permanecen disponibles en los controles autorizados del proyecto.</div>}
            </section>
          </div>
        </div>
      </div>
    </div>
  </main>;
}
