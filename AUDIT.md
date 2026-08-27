# Informe de Auditoría: fashion-stylist-ai

Fecha: 2026-08-27
Stack detectado: React 19 + Vite + TypeScript (cliente) · Express + tRPC v11 (API) · Drizzle ORM + MySQL (datos) · JWT en cookie HTTP-only (auth) · OpenAI-compatible LLM · pnpm
Commits analizados: 1 (e6fde9c — estado inicial, rama main)
Veredicto: **sano** · código de alta calidad y con buenas prácticas de seguridad; sin secretos ni bugs críticos; se documentan oportunidades de mejora menores/medias sin alterar código funcional.

## Lo mejor del repo

1. **Diseño de autenticación sólido y defensivo.** El flujo OAuth usa nonce CSRF en cookie `__Host-` (host-only, Secure, Path=/) que se contrasta contra el `state` en el callback (`server/_core/oauth.ts`, `shared/const.ts`). Las sesiones son JWT HS256 firmadas con verificación estricta de algoritmo y campos (`server/_core/sdk.ts`). El manejo del estado ofrece CSRF y rechaza `state` malformado con 403 sin nunca lanzar fuera del handler.
2. **Autorización completa y por recurso.** Todos los procedimientos de back-office pasan por `adminProcedure` y validan pertenencia con `requireOwnedClient`/`getOwnedClient` (ownership checks en cada `query`/`mutation`), y el portal de clienta filtra por estado `active` + consentimiento y solo sirve looks `ready`. El endpoint `stylist.propose` además valida que los `garmentIds` devueltos por el LLM existan realmente en el armario del usuario.
3. **API con validación estricta y consultas parametrizadas.** Toda entrada se valida con zod (límites de tamaño, enums, sanitización) y todo el acceso a datos usa Drizzle ORM con valores parametrizados (sin concatenación SQL → sin inyección). La subida de imágenes valida tipo y tamaño (máx. 4 MB).

Otros puntos fuertes: documentación abundante y honesta (README explica stack, puertos, variables y límites deliberados); CI/CD con GitHub Actions usando acciones v4 (sin `pull_request_target` vulnerables); headers de seguridad (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, cache immutable en assets); fallos controlados y degradación elegante cuando faltan `DATABASE_URL`/API keys.

## Hallazgos CRÍTICOS

Ninguno. No se detectaron secretos reales (solo `.env.example` con placeholders `replace-with-a-long-random-string`), ni RCE, inyección SQL, ni pérdida de datos inminente.

## Hallazgos ALTOS

1. **Proxy de almacenamiento sin control de acceso** — `server/_core/storageProxy.ts:5`
   El endpoint `GET /manus-storage/*` genera una URL firmada de descarga para **cualquier clave** sin autenticación ni verificación de pertenencia. Las cargas se escriben bajo rutas `private/{userId}/...` (`server/routers.ts:165,232`), por lo que un actor conociendo la clave de otro usuario podría descargar archivos "privados". El riesgo está mitigado por el sufijo aleatorio de 8 caracteres en la clave (`server/storage.ts` `appendHashSuffix`), que hace las claves difíciles de adivinar, pero sigue siendo un **gap de autorización** real: conviene validar que la clave pertenezca al usuario autenticado (y requerir sesión) antes de firmar. No se modifica código porque es una mejora funcional/arquitectónica que requiere decidir el modelo de permisos.

## Hallazgos MEDIOS

1. **LLM `stylist.reply` sin rate-limit ni costo por abuso** — `server/routers.ts:239`
   Está expuesto a cualquier usuario autenticado (`protectedProcedure`) y dispara llamadas al LLM de pago. Un cliente podría abusar para consumir cuota/coste. Falta throttling o límite. Solo se documenta; no se modifica la lógica de negocio.

2. **Límite de cuerpo HTTP muy amplio (50 MB)** — `server/_core/index.ts:34`
   `express.json/urlencoded({ limit: "50mb" })` es generoso y podría abrir una vía de DoS por memoria en despliegues de recursos limitados. Los payloads reales (imágenes máx. 4 MB, textos acotados por zod) no requieren 50 MB.

3. **No hay Content-Security-Policy** — `_headers`.
   Se fijan `X-Frame-Options` y `nosniff`, pero una CSP (TLS, default-src, etc.) sería la mejora natural de endurecimiento.

## Hallazgos BAJOS

- `server/_core/llm.ts:58` — El mensaje de error dice `"OPENAI_API_KEY is not configured"` pero la variable real es `BUILT_IN_FORGE_API_KEY`; inconsistencia cosmética en texto.
- `server/_core/systemRouter.ts` — `system.health` toma un `timestamp` innecesario en la entrada; trivial.
- No se observó `.editorconfig`; menor.

## Añadido por el auditor

- Creación de rama `agent/auditoria-2026-08-27` (sin cambios de código).
- Este informe (`AUDIT.md`) y su réplica en `C:\audit-github\informes\fashion-stylist-ai.md`.

## Próximos pasos recomendados

1. **Prioridad alta:** cerrar el gap de autorización en `/manus-storage/*` (exigir autenticación y validar que la clave pertenece al usuario) antes de exponer el servicio a producción con datos reales.
2. Añadir rate-limiting al endpoint LLM `stylist.reply` para contener costos/abuso.
3. Reducir el límite de body a un valor coherente con el caso de uso (p. ej. 6–8 MB) y añadir una CSP razonable.
4. Corregir el texto del mensaje de error en `llm.ts` para reflejar `BUILT_IN_FORGE_API_KEY`.
5. Configurar un proveedor CI que ejecute `pnpm check` y `pnpm test` de forma continuada (hoy el workflow de Pages solo construye el cliente).

## No tocado (pero anotado)

- **Verificación de build/tests:** no pudo ejecutarse en el entorno (no hay `node_modules` instalados y `pnpm` no está disponible en PATH). El README declara que `check`, `build` y `test` pasan; no hubo evidencia contraria. Se marca como "build no verificado en esta auditoría".
- No se modificó ningún archivo fuente ni lógica de negocio. Los hallazgos son exclusivamente de documentación/recomendación.
- No se detectaron secretos reales; de haber los hay, son placeholders en `.env.example` (ver regla 4: asumir que no son reales).
