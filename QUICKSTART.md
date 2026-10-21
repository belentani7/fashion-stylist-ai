# NATALIA — Quickstart de la aplicación real (2026)

## Lo que hace esta versión

El producto activo es un estudio de estilo local con inventario de prendas, conjuntos, historial de usos, coste por uso y copia JSON exportable. No necesita Supabase, Stripe, Claude, ElevenLabs ni una tarjeta de crédito.

Las guías antiguas describían una arquitectura hipotética e incluían SQL de ejemplo sin un conjunto completo de políticas de acceso. **No ejecutes ese SQL como instalación segura de una plataforma multiusuario.** Se necesita un diseño de identidades, consentimiento y RLS completo antes de trabajar con datos personales reales en nube.

## Ejecución

En la raíz del repositorio:

    node --version
    npm install --no-audit --no-fund
    npm run dev

Abrir http://localhost:3000. Añade una prenda al armario, otra complementaria, crea un conjunto, registra un uso y comprueba la variación del coste por uso.

## Guardado y restauración

En la sección 'Tu información te pertenece' pulsa **Exportar mi armario**. Esto crea un archivo JSON local. Si deseas restaurarlo, usa **Restaurar copia JSON**: el sistema valida el formato y solicita confirmación antes de reemplazar el armario actual.

No hay sincronización entre dispositivos: conserva la copia en un lugar privado. Si el navegador deniega acceso a localStorage, la interfaz mostrará un error y no declarará guardado.

## Verificación antes de publicar

    npm run test
    npm run typecheck
    npm run lint
    npm run build

Ningún resultado de prueba es válido hasta que un runner realmente ejecute estos pasos. Si el instalador falla por incompatibilidad de versiones o faltan dependencias bloqueadas, resolver primero y registrar el lockfile antes de promocionar un release.

## Límites de la primera edición

- Sin lectura de fotografías, cuerpo o rostro.
- Sin análisis psicológico o médico.
- Sin asistentes IA conectados; la sugerencia utiliza reglas categóricas locales.
- Sin precios de comercios, marketplace, pagos ni enlaces de afiliación.
- Sin backend, cuentas ni comunidad.
- Sin despliegue confirmado hasta verificar URL y funcionamiento real.

La visión a largo plazo se conserva en NATALIA_LEGACY.md como documento de producto, no como declaración de características implementadas. Natalia es un proyecto autónomo y no debe fusionarse por similitudes de nombre con otros productos.
