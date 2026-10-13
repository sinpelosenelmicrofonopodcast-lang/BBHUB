# PrimeCuts OS — Auditoría integral y sistema único de operaciones

**Estado:** especificación y código base preparados; NO desplegado ni activado sobre producción.
**Fuente revisada:** BBHUB rama primecuts-client-portal-v04-no-deploy (commit b93800b), tablas pc_* de BBHUB Supabase y proyecto prime-cut-studios en Vercel.
**Restricción:** cero builds, cero deployments, cero recursos de pago, ninguna migración aplicada en esta revisión.

## Diagnóstico de implementación
| Área | Estado verificado | Brecha |
| --- | --- | --- |
| Landing, solicitudes y portafolio | existe | faltan pipeline comercial y analíticas |
| Proyectos y cotizaciones | existe | proyectos no disponen de partidas de costos ni entregables por hito |
| Portal de clientes | existe, usuario+contraseña y membresía por proyecto | sin discusiones/decisiones nativas ni aprobaciones versionadas |
| Lightroom/Blackmagic/Drive | enlaces externos por proyecto | no hay sincronización API ni control de permiso externo |
| Operaciones internas | un único administrador con secreto de entorno | falta personal, roles, permisos por proyecto y revocación |
| Casting | no existe | convocatoria, inscripción, evaluación, consentimientos, contratación |
| Planeación | estado de proyecto y fecha | tareas, dependencias, locaciones, call sheet, calendario |
| Inventario | no existe | reservas de equipos y prevención de dobles reservas |
| Finanzas | monto de cotización | presupuesto interno, gasto real, aprobaciones, factura y pagos |
| Legal | texto de cotización | contrato firmado, evidencia, versión, consentimiento |
| Seguimiento | ninguno nativo | actividad, bitácora, notificaciones, fechas límite |

## Arquitectura: un solo centro y ninguna duplicación de originales
Frontend único: Next.js en prime-cut-studios (proyecto Vercel existente).
Base de datos: proyecto Supabase BBHUB existente; esquema restringido, RLS en cada nueva tabla.
Archivos originales: Google Drive y proveedores autorizados; guardar IDs/URLs y metadatos, NO duplicar videos de calidad master.
Revisión de imagen: enlaces de álbum Lightroom con opción invite-only y comentarios.
Revisión de video: Presentations de Blackmagic Cloud; comentarios de timeline en DaVinci.
Portal: autenticación propia + membresía por proyecto, links sólo visibles tras la comprobación de permisos.
Privacidad: un enlace externo con guest access permanece accesible fuera de PrimeCuts OS; activar invitación individual, fecha de caducidad o regeneración de vínculo cuando sea posible.
Eventos: bitácora sin editar para decisiones, firmas, cambios de estado, permisos y versiones.
Todo acceso sensible: consultas desde servidor, NO exponer SUPABASE_SECRET_KEY.

## Permisos sugeridos
- owner: todas las funciones y manejo de accesos
- administrator: gestión operativa general; no rotar secretos sin owner
- secretary: intake, CRM, comunicaciones, agenda y documentos autorizados
- producer: producción, cotizaciones, casting y assignments
- casting_manager: convocatorias, aplicaciones y selección; sin finanzas internas
- editor: archivos, comentarios, tareas y entregas de proyectos asignados
- photographer: archivos, horarios y tareas asignadas
- crew: call sheet, agenda y sus propias tareas
- finance: presupuestos, pagos y reportes financieros sin talento sensible
- client: sólo proyectos habilitados como cliente; sin costos internos
- talent: sólo sus aplicaciones, invitaciones, acuerdos y call sheets autorizados

NO usar texto role recibido del navegador como autorización. Role y proyecto deben consultarse en servidor.
Revocación inmediata: disabled, session_version y eliminación de membership. No confiar en cookies sin revalidar cuenta.
Toda operación requiere autorización por capability + project_id en backend, auditar cada cambio.

## Flujos obligatorios
1. Comercial: contacto -> solicitud -> oportunidad -> cotización -> contrato -> anticipo -> proyecto activo.
2. Casting: convocatoria -> aplicaciones -> shortlist -> feedback del cliente -> selección -> oferta -> release -> call sheet.
3. Planificación: brief -> ideas -> referencias -> casting y locación -> presupuesto -> permisos -> calendario -> equipo y crew.
4. Rodaje: call sheets, confirmaciones, check-in, shot list, incidentes y control de media.
5. Post: media de revisión -> comentarios externos -> tareas -> versión -> aprobación registrada -> entrega.
6. Cierre: conformidad, factura/pago, publicación en portafolio sólo con autorización y archivo.

## Módulos y campos principales
People: cuenta, nombre, correo, roles y permisos, 2FA opcional, último acceso, activo, audit trail.
Casting: proyecto, convocatoria, categoría, remuneración/rango, requisitos, fecha límite, solicitudes, estados, enlaces de headshots y reels, autorización de datos, revisión.
Project: cliente, responsable, etapa, presupuesto aprobado, fechas, entregables y acuerdos.
CRM: contacto, compañía, fuente, servicio, seguimiento, notas internas restringidas.
Production: escenas, locaciones, referencia/permiso, casting, equipo asignado, call sheets y horarios.
Creative: paletas, moodboard, referencias, comentario, propuesta y voto, aprobación versionada.
Assets: proveedor, enlace verificado, visibilidad, propietario, revisión v1/v2, caducidad.
Contracts: plantilla, partes, versión inmutable, consentimiento, firma, auditoría, descarga PDF.
Finance: alcance y costos, facturas, anticipo, pagos, saldo, visibilidad limitada.
Inventory: cámaras, lentes, luces, audio, accesorios, reservas, estado/ubicación.
Tasks: responsable, prioridad, vencimiento, etapa, bloqueadores y notificaciones.
Reports: duración de lead -> contrato, margen, retrasos, horas de revisión, conversión de casting.

## Caso piloto Tony Rivera
Videoclip 'Contigo el Tiempo Vuela'. Drive: dossier de locaciones
https://docs.google.com/document/d/1y7ivwbQxAQHzXJwdn09qZXIM_nH8d8N044s4SN96U1g/edit
Sin inventar correo, talentos seleccionados, contrato firmado ni pago recibido.
Mostrar alternativas Temple, Belton y Killeen sólo como referencias sujetas a permisos.
Casting: pareja latina adulta joven, vestuario casual conservador; presupuesto global orientativo $1,200 sujeto a acuerdo registrado.
Crear el proyecto interno sólo una vez que se haya verificado destinatario y permisos; no activar convocatorias públicas sin publicación expresa.

## Roadmap de implementación (una sola liberación agrupada)
Gate A: identidad del personal, invitaciones seguras, ACL/roles, proyecto y audit log + tests de seguridad.
Gate B: CRM, casting y registro de talento; solicitudes / shortlist con límites, consentimiento y retención.
Gate C: producción, tareas, calendarios, crew, inventario, locaciones, call sheets y notificaciones internas.
Gate D: propuestas/versiones/aceptaciones, contratos con evidencia, finanzas restringidas y entrega.
Gate E: pruebas E2E de 6 roles, accesibilidad móvil, permisos negativos, rendimiento, backups y restauración.
Sólo una publicación controlada tras pasar gates y contar con autorización. No prometer que la especificación equivale a software listo.

## Seguridad / costo
No subir medios originales a Vercel, límites de subida estrictos, antivirus/manual para audiciones, enlaces firmados para previews sensibles, RLS + grants.
Menores de edad: requerir tutor, consentimiento, retención restringida y revisar requisitos laborales locales antes del alta.
Firmas: registrar consentimiento, autenticación, versión firmada, timestamp y evidencia; revisar proveedor/cumplimiento antes de llamarlas firmas legales.
Integraciones con Drive/Lightroom/Blackmagic: comenzar con enlaces y permisos propios del proveedor; no prometer que enlaces privados están protegidos tras copiarlos.
Medir utilización de almacenamiento, ancho de banda y funciones; los planes existentes pueden cobrar excedentes.
