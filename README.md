# NATALIA — Personal Style Studio

**Tu estilo es tuyo.** Una aplicación real de armario personal y conjuntos, con identidad visual propia, preservando los principios de Natalia: autonomía, inclusión, privacidad y menos compras innecesarias.

Este es el repositorio original de **Natalia**, independiente de otros productos/personas del ecosistema. Su documentación histórica de visión a cinco años permanece en NATALIA_LEGACY.md y SYSTEM_PROMPT_GODNESS.md; las proyecciones de clientes, ingresos y asociaciones son objetivos hipotéticos, no resultados logrados.

## Producto funcional actual — 2026

1. Portada corporativa y navegación a las funciones reales.
2. Inventario de prendas: crear, categorizar, describir, registrar temporada, color y precio, filtrar y eliminar.
3. Conjuntos: elegir de 1 a 10 prendas, guardar looks con nombre y ocasión, consultar contenido, editar composición mediante nuevo conjunto y eliminar conjuntos.
4. Uso real: botón para registrar que llevaste un conjunto; incrementa el historial de sus piezas y calcula coste por uso sin inventar compras.
5. Propuesta de look por reglas transparentes: usa únicamente tus prendas, categoría, temporada, ocasión y menor número de usos. **No hay conexión a un LLM ni diagnóstico corporal.**
6. Estadísticas calculadas del estado real: piezas, conjuntos, prendas sin usos anotados, inversión registrada.
7. Exportación del armario completo a JSON local y restauración confirmada con validación rigurosa (sin enviar el archivo a un servidor).
8. Página diseñada para móvil, con soporte de teclado y preferencias de movimiento reducido. No usa trackers ni solicita fotos o medidas del cuerpo.

**No implementado y no anunciado como activo:** login, cuentas, comunidad, marketplace, IA generativa, análisis de fotos, audio de ElevenLabs, perfiles psicológicos, Stripe, Supabase, AR o recomendaciones meteorológicas. Son extensiones de la visión histórica que necesitan desarrollo, contratos, proveedores y controles antes de su activación. Esta entrega es un producto local-first con funcionalidad real, no la plataforma SaaS completa del roadmap.

## Instalación

Requiere Node.js 20 o posterior y npm.

    git clone https://github.com/belentani7/fashion-stylist-ai.git
    cd fashion-stylist-ai
    npm install --no-audit --no-fund
    npm run dev

Abre http://localhost:3000. Si alojas en Vercel, el repositorio contiene ahora las rutas Next 15 app/page.tsx y app/layout.tsx que antes faltaban. No presupone un backend ni conecta APIs privadas. La web debe desplegarse y abrirse en navegador para considerarse publicada.

## Calidad

    npm run test
    npm run typecheck
    npm run lint
    npm run build

La suite comprueba CRUD de armario, referencias de los looks, usos y costes, propuestas basadas únicamente en piezas existentes, validación de copias corruptas e identidad y entrada real Next. La CI exige todas esas condiciones sin ocultar fallos. **Hasta obtener pruebas ejecutadas y un deploy verificado, no declarar la publicación aprobada**.

El repositorio carecía de un proyecto Next utilizable a pesar del archivo package.json histórico. Los paquetes antiguos declaraban integraciones (Stripe, Auth, Supabase, Claude, etc.) que no tenían implementaciones. Se conservaron, como especificación histórica, en docs/legacy-stack-manifest.json. El manifiesto activo ahora incluye únicamente las dependencias realmente utilizadas por la aplicación para reducir conflictos. La entrega todavía requiere fijar un package-lock reproducible tras la instalación en un entorno autorizado.

## Contrato de privacidad

Los registros se guardan **únicamente en el localStorage** de este navegador bajo la clave natalia:wardrobe:v1. Sin cuentas ni copias automáticas, los datos se pueden perder al borrar el almacenamiento. La exportación manual JSON incluye nombres, notas, precios y conjuntos introducidos por quien usa la aplicación: debe guardarse en un lugar privado.

El modelo de datos rechaza IDs desconocidos o duplicados, referencias a prendas inexistentes, valores monetarios no finitos o negativos y copias de otro esquema. Importar requiere confirmación. No se obtienen datos biométricos, fotografías ni información de contacto. Los colores se restringen a una paleta segura antes de aplicarse al estilo CSS.

## Arquitectura

    app/page.tsx             producto, inventario, conjuntos, import/export
    app/layout.tsx           estructura HTML y SEO
    app/globals.css          identidad editorial responsive de Natalia
    lib/wardrobe.ts          dominio y validación de datos sin red
    tests/wardrobe.test.mjs  regresiones del dominio y producto
    .github/workflows/ci.yml quality gates
    ecosistema.html          directorio histórico de otros proyectos (conservado)
    NATALIA_LEGACY.md        visión histórica específica de Natalia
    SYSTEM_PROMPT_GODNESS.md arquitectura futura, no IA conectada actualmente
    docs/legacy-stack-manifest.json   dependencias históricas preservadas

## Diseño y criterio

No se infiere la talla, salud, género, raza o imagen corporal. Las sugerencias no se venden como ciencia ni como asesoramiento psicológico. Las opciones pretenden estimular el uso de prendas existentes, no maximizar consumo. Código de este producto bajo MIT; marcas y material de terceros tienen derechos independientes.
