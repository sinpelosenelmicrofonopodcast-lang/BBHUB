# Prime Cut Studios — fabricante y modelo como fuente de verdad

Preparado el 13 de octubre de 2026. Cambios listos para incorporar al próximo lanzamiento agrupado, **sin modificar ninguna rama Git ni provocar despliegue**.

## Reglas
- `name`: nombre comercial del fabricante y modelo, sin ordinales `#1/#2`.
- `id`: identificador único de cada unidad física; los 167 IDs y las 161 unidades operativas permanecen intactos.
- Foto de fabricante: una URL por modelo verificado; todas las unidades equivalentes pueden compartirla.
- Prohibido asignar una foto por marca o focal solamente; variante y montura son importantes.
- Alquiler: permisos, precios y estados sin cambios.
- `equipment-catalog.json` es el registro de referencias de fotografía; `equipment-catalog.ts` conserva los activos físicos y enlaza mediante nombre normalizado.

## Cambios de nombre con identificación suficiente
- `Canon RF 24-105mm F4 L IS USM` → `Canon RF24-105mm F4 L IS USM`.
- `Canon RF 28-70mm` → `Canon RF28-70mm F2.8 IS STM`. Verificar en inventario físico la inscripción de la variante antes de cambiar la ficha de adquisición.
- `LAOWA 24mm f/14 2X Macro Probe` → `Laowa 24mm f/14 2X Macro Probe`.
- `RØDE Wireless PRO Kit #1/#2` → `RØDE Wireless PRO`; IDs físicos diferentes.
- `Rokinon 14mm f/2.8` → `Rokinon 14mm F2.8`; **generación pendiente de verificar** (ED AS IF UMC, AF o II).
- `Yongnuo 35mm f/2 AF` → `Yongnuo 35mm F2 AF`; **montura y versión por verificar**.
- Nombres restantes con `#n`: eliminados del título comercial, pero IDs de activos intactos.

## Fotografías entrantes
En Drive: carpeta `1YLHOXyEamnWQRKXSsU_jTT8Qb42GPXnV`. Las 6 imágenes son privadas. No convertir un enlace de vista privado de Drive en URL pública del sitio. Verificar si `ZOOM H6.webp` es H6 o H6essential; comprobar si el Rokinon 24mm DS para NEX coincide con la montura/modelo físicos.

## Auditoría de datos
- Activos: 167.
- Activos operativos: 161.
- Modelos en galería fotográfica interna: 128 referencias.
- Fuentes con fotografía directa registrada: 25.
- Activos operativos vinculables por coincidencia exacta de modelo una vez normalizados: 33.
- No implica que esos enlaces externos estén probados desde cada navegador ni que el sitio se haya desplegado.

## Revisión pendiente antes de publicación
1. Verificar modelos no especificados completamente por marca, lente, montura o SKU.
2. Confirmar cada fotografía por fabricante y licencia o usar fotografía propia aprobada.
3. Probar build, navegación y seguridad cuando se programe el único deploy agrupado autorizado.
