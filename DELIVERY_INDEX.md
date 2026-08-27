# Índice de entrega — Fashion Stylist AI

## Contenido del paquete

| Carpeta o archivo | Contenido |
|---|---|
| `fashion-stylist-glass-landing/` | Proyecto web publicado, backend, esquema, migraciones, pruebas y documentación |
| `fashion-stylist-mobile/` | Proyecto Expo para Android/iOS, carpetas nativas, exportación web y documentación móvil |
| `chat-inputs/` | Textos proporcionados durante el alcance del producto |
| `CONVERSATION_HANDOFF.md` | Síntesis operativa del encargo y del protocolo de tres nodos |
| `QA_EVIDENCE.md` | Comprobaciones ejecutadas y limitaciones conocidas |
| `DISTRIBUTION_GUIDE.md` | Estado de distribución y pasos de firma de Android/iOS |
| `GITHUB_RESOURCE_REVIEW.md` | Revisión de referencias públicas, licencias y decisión de integración mínima |
| `PORTAL_SEPARATION.md` | Límites de visibilidad entre landing público, Studio de Natalia y portal de clienta |

## Exclusiones intencionadas

El paquete no contiene `node_modules`, directorios de control de versiones, cachés, registros, secretos, archivos `.env`, certificados ni claves de firma. Los datos de clientas y fotografías privadas no se exportan.

## Trazabilidad de esta entrega

| Elemento | Valor |
|---|---|
| Studio y landing publicados | https://fashstylist-gbgfkw2p.manus.space |
| Archivo de entrega | `Fashion_Stylist_AI_entrega.zip` |
| Verificación de integridad | SHA-256 comunicado junto con el archivo final |

La huella se calcula después de crear el ZIP y se comunica junto con la entrega para evitar una referencia circular del archivo a su propia suma de verificación. El contenido no incorpora secretos, fotografías privadas ni binarios móviles firmados.

> **Estado de URL pública al último control:** el dominio mostró un aviso de indisponibilidad por facturación de la plataforma. La separación entre `/studio` y `/client` se verificó mediante pruebas, compilación y entorno de desarrollo; la validación del dominio publicado debe repetirse cuando esa incidencia externa esté resuelta.
