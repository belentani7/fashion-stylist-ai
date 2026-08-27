# Controles proporcionados para Natalia

Este documento traduce el prompt de auditoría aportado a la etapa real de Fashion Stylist AI. No declara conformidad total ni recomienda desplegar infraestructura que aún no aporta valor al Studio.

| Dominio | Decisión para Natalia | Evidencia / límite actual |
| --- | --- | --- |
| Privacidad y control | Aplicado | Consentimiento explícito antes de guardar perfil, prendas o solicitar recomendaciones; el permiso se puede pausar. |
| Autenticación y acceso | Aplicado | Sesión OAuth y procedimientos protegidos para datos personales. |
| Validación de entradas | Aplicado | Esquemas Zod con límites de longitud para perfil, prendas y conversaciones. |
| IA responsable | Aplicado | El prompt no inventa prendas, pide una única aclaración cuando falta información y evita lenguaje corporal prescriptivo. |
| Accesibilidad y transparencia | Aplicado | Foco visible, texto semántico, adaptación móvil, movimiento reducido y fallback de transparencia reducida. |
| Guardado de imágenes | Preparado, no activo | El esquema admite referencias seguras; no se han activado captura, análisis ni carga de fotos. |
| Procesos en segundo plano | No necesario ahora | No hay tareas periódicas ni trabajos pesados útiles en la fase actual; no se añaden colas o workers sin necesidad. |
| Modelo offline local | No necesario ahora | El Studio usa un servicio de recomendación bajo consentimiento; un modelo local no mejora todavía la experiencia de Natalia. |
| Escalado, WAF, SLO, CI/CD, pentest | Requisito de salida | Deben verificarse antes de un go-live público, junto con pruebas de carga, backup/restauración y revisión legal. |
| APK e iOS | Preparado, no distribuido | Existe una base Expo y proyectos nativos; faltan la sesión Expo/EAS y las credenciales de firma del titular. |

> El estado correcto es **hito funcional preproducción**, no “go” de producción. La siguiente decisión útil es conectar la autenticación móvil al backend compartido y después completar firma, pruebas en dispositivos físicos y la revisión de distribución.
