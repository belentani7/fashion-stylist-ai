# Fashion Stylist AI

Landing de marca y producto para un asesor de estilo asistido por IA. Presenta
una lectura visual del estilo (Gestalt, armonía cromática y arquetipos) y una
experiencia de Studio profesional + portal de clienta. El landing actual es un
**sitio estático de marca**: usa datos de demostración y no entrega recomendaciones
operativas ni asesoramiento personalizado real.

## Stack

- **Cliente:** React 19 + Vite + TypeScript + Tailwind v4
- **API:** tRPC v11 sobre Express (`/api/trpc`)
- **Datos:** Drizzle ORM + MySQL (schema en `drizzle/`)
- **Auth:** sesión JWT en cookie HTTP-only (OAuth en plataforma Manus; degrada a demo)
- **LLM:** cliente OpenAI-compatible (`BUILT_IN_FORGE_API_URL` / `BUILT_IN_FORGE_API_KEY`)

## Puertos y rutas

| Ruta | Descripción |
| --- | --- |
| `/` | Landing público |
| `/studio` | Studio profesional (requiere rol `admin`) |
| `/studio/personal` | Armario y perfil personal |
| `/studio/proposal/:clientId` | Propuesta profesional |
| `/client` | Portal de clienta (acceso por invitación) |
| `/api/trpc` | API tRPC |
| `/api/oauth/callback` | Callback de OAuth |

## Scripts

```bash
pnpm install
cp .env.example .env   # rellena al menos JWT_SECRET y DATABASE_URL
pnpm dev               # servidor + cliente en modo desarrollo (puerto 3000)
pnpm build             # build de cliente (dist/public) + bundle de servidor (dist/)
pnpm start             # sirve el build de producción
pnpm check             # typecheck (tsc --noEmit)
pnpm test              # tests (vitest)
pnpm db:push           # genera y aplica migraciones Drizzle
```

## Variables de entorno

Ver `.env.example`. Sin `DATABASE_URL` el backend arranca pero las operaciones
de datos no persisten. Sin `BUILT_IN_FORGE_API_KEY` las llamadas al estilista
(`stylist.reply` / `stylist.propose`) devuelven error controlado.

## Auditoría y estado de completitud

El paquete entregado originalmente omitía el código fuente de `server/_core/*`,
`shared/_core/errors.ts` y `client/src/_core/hooks/useAuth.ts`, por lo que ni el
cliente ni el servidor compilaban. Estos módulos fueron reconstruidos fielmente
desde el bundle de producción (`dist/index.js`) incluido en la entrega. El
proyecto ahora:

- typecheck (`pnpm check`) pasa
- build de cliente y servidor pasa
- tests (`pnpm test`) pasan
- el servidor monta la API tRPC, OAuth, proxy de storage y el SPA

## Límites deliberados

El portal `/client` solo expone looks con estado `ready` aprobados por la estilista;
una cuenta `user` no puede invocar procedimientos de back-office (se rechaza con
`FORBIDDEN`). La subida de imágenes acepta JPG/PNG/WebP hasta 4 MB.
