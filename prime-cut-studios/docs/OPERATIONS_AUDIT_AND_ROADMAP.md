# PrimeCuts OS — Auditoría y plan de operaciones integral
**Estado:** código preparado en rama sin auto-deploy. **No se ha aplicado la migración nueva ni publicado esta actualización.**
**Base revisada:** BBHUB, PrimeCuts OS v0.4, proyecto Vercel `prime-cut-studios`, Supabase `mvrszgunjwvdqogtpyqm`.

## 1. Qué funciona hoy (v0.4 publicada)
- Sitio público; solicitud de cotización; administrador principal; proyectos manuales y conversiones desde solicitudes; presupuestos básicos; portal privado de cliente con invitación y contraseña; enlaces visibles/ocultos a Lightroom, Blackmagic Cloud y Google Drive; portfolio con consentimiento manual.
- RLS y servicio de base privado; claves solo servidor. Correos de invitación se copian manualmente, no se envían automáticamente.
- Blackmagic y Lightroom siguen siendo sitios externos; ningún comentario de los dos proveedores se replica automáticamente en Supabase.

## 2. Deficiencias constatadas
1. Sin cuentas/roles/alcance por proyecto para secretaria o empleados.
2. Sin casting público, cuenta de talento, solicitudes, audición ni estado de selección.
3. Sin centro colaborativo de tareas, locaciones, calendario, crew, lookbook, contratos y aprobaciones por proyecto.
4. Sin auditoría transversal de eventos de staff y clientes.
5. Sin proceso nativo de firma/aceptación de documentos.
6. No hay verificación de correo para público general, 2FA ni recuperación de contraseñas autogestionada.
7. No existe integración automática con Google Drive, Adobe Lightroom ni Blackmagic Cloud; las variables Drive guardadas son IDs de carpetas, no credenciales Google OAuth.
8. No hay pagos, facturas reglamentarias, firma electrónica de proveedor externo, calendario bidireccional, hojas de llamado exportables ni almacenamiento de grandes originales.

## 3. Qué añade la rama Operations (por activar al publicar + migrar)
- Portal `/operations`: sesiones individuales para personal, control por rol y asignación por proyecto.
- Owner: invitación y revocación de personal; roles manager, secretary, producer, editor, crew, accountant, casting.
- Espacio `/operations/projects/[id]`: tareas, horarios, locaciones, casting/crew, tableros creativos, media, presupuestos, documentos, contratos, decisiones y comentarios.
- Casting `/casting`: convocatorias borrador/abiertas/cerradas. Talentos adultos crean perfiles con consentimiento en `/talent/register`, se postulan por cuenta, ven su estado, y casting gestiona shortlist/audición/selección.
- Sala `/client/projects/[id]/operations`: contenido visible aprobado por producción; comentarios, aprobación/cambios, evidencia básica de aceptación electrónica con huella SHA-256.
- Auditoría de eventos para acceso, cambios, invitaciones, decisiones y contratos.
- Datos privados por defecto, sin subida redundante de video, sin API/servicio de pago, sin email automático.

## 4. Modelo de acceso (mínimo privilegio)
| Rol | Módulos habilitados | Alcance |
|---|---|---|
| Propietario (`ADMIN_EMAIL`) | Todo + invitaciones y desactivación staff | Todos los proyectos |
| Manager | Operación completa excepto administración de personal | Todos o asignados |
| Secretaria | Proyectos, casting, tareas, horarios, lookbook, documentos y contratos | Todos o asignados |
| Productor | Proyectos, casting, tareas, horarios, creatividad, media, contratos | Todos o asignados |
| Editor | Media, creatividad, tareas | Asignados |
| Crew | Tareas, horarios | Asignados |
| Contabilidad | Presupuesto, documentos, contratos | Asignados |
| Casting | Casting, creatividad, horarios | Asignados; convocatorias generales visibles al departamento |
| Cliente | Únicamente proyectos de los que es miembro | Nunca ve presupuesto interno, notas staff, ni otros clientes |
| Talento | Convocatorias abiertas y sus propias solicitudes | Sin ver otros candidatos |

La autorización se valida en cada ruta del servidor y no solo en la interfaz. Los secretos `service_role` nunca van al navegador. El personal jamás recibe acceso al admin principal `/admin`.

## 5. Flujo ejemplo: Tony Rivera
1. Crear o abrir producción manual `Contigo el Tiempo Vuela` (NO duplicar sin comprobar si ya existe).
2. Agregar lookbook y locaciones con los links del dossier ya existente; registrar elección del cliente en el portal.
3. Crear convocatoria casting de pareja joven adulta, sin exponer detalles confidenciales del artista si no está autorizado.
4. Recibir perfiles y audiciones; productor/casting decide estados y prepara shortlist. Para que Tony vote, crear una ficha de lookbook con **solo datos del talento cuya divulgación fue autorizada**.
5. Agregar tareas, presupuesto, shot list, calendario, responsabilidades, call sheets y acuerdo.
6. Revisiones DaVinci/Lightroom: enlace visible al cliente; feedback detallado vive en proveedor externo; decisión de aceptación queda también en PrimeCuts OS.
7. Guardar evidencia de aceptación y firmar documentos; realizar entrega final desde enlace con permisos externos estrictos.

## 6. Lo que NO se debe anunciar como listo
- Inicio de sesión con emails *verificados*: falta verificar propiedad del email de talentos.
- Recogida de menores: este diseño exige 18+; para menores hace falta flujo consentido de guardianes y políticas específicas.
- Firma legal certificada: existe aceptación electrónica básica, **no** sello de tiempo tercero, autenticación fuerte, firma cualificada ni garantía jurídica universal. Un contrato de consecuencias elevadas debe pasar por abogado y proveedor especializado.
- Colaboración Adobe/Blackmagic dentro del mismo reproductor: el enlace todavía sale a sitios del proveedor. Sus anotaciones no se reflejan automáticamente en este panel.
- Envío de invitaciones automático, SMS, email, notificaciones push, Stripe/PayPal, inventario con check-in/out, payroll o calendario Google.
- Un test end-to-end real en navegador y el build Next.js completo: no se han ejecutado sin recursos Vercel.

## 7. Prioridades para llevarlo al siguiente nivel (sin costes adicionales de software)
### P0 — Antes de exponer datos reales
- Verificación de emails de talentos/empleados, recuperación de acceso, bloqueo de cuenta y 2FA owner/staff con proveedor seguro. No habilitar público masivo sin ellos.
- Caducidad, revocación de enlaces y una política de retención/supresión de audiciones y datos personales.
- Backups/restauración comprobados; auditoría exportable, logs sin PII y pruebas de aislamiento multiusuario.
- Revisar usuarios existentes, secretos, CSP, dependencias, derechos de imagen y versiones documentales.
### P1 — Producción integrada
- Plantillas personalizables por servicio (videoclip, bodas, fotografía, comercial) que creen tareas, presupuestos y entregables sin rehacerlos.
- Shotlist + call sheet con exportación PDF, contactos por rol, mapa/horarios, confirmación de recepción.
- Tablero de preproducción con decisiones vinculadas a versiones: casting seleccionado, locación confirmada, vestuario, paleta, storyboard.
- Sistema de revisiones por versión con deadline, bloqueos y registro formal de aprobación.
- Registro de equipo y reservas de inventario con conflictos de calendario.
- Horarios y disponibilidad de crew con vista semanal y responsabilidades; costo calculado por horas.
### P2 — Automatización/ventas
- Formulario público de cotización con flujo a contrato, anticipo y agenda una vez que esté habilitado el cobro.
- Facturación, costeo real vs. previsto, rentabilidad por proyecto, subcontratos, W-9 y autorizaciones de imagen.
- Sincronización por OAuth con Drive, calendario y servicio de correo cuando haya una integración segura. No tratar ID de carpeta como credencial.
- Reportes comerciales: conversión, tiempos de entrega, aprobaciones retrasadas, ingresos y utilización del equipo.
- Portafolio automático **solo tras consentimiento verificable** y publicación explícita del propietario.

## 8. Estrategia de coste y release
- No hacer otro proyecto Vercel, no crear un segundo Supabase, no duplicar video original en Vercel/Supabase.
- Código en rama de preparación; `vercel.json` mantiene auto-deploy desactivado.
- Una única migración SQL reversible por diseño (aditiva) cuando se autorice; no se ha aplicado en este trabajo.
- Verificación antes de lanzamiento: Node 24 + `npm ci/npm install`, `npm run build`, pruebas de flujos por rol, navegador y móvil, límites de PostgREST, URLs externos, RLS/advisors y control de costes.
- Un solo deployment manual después de un build y revisión aprobados (NO solicitado hoy).
