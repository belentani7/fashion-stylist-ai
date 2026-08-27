# Evidencia de control de calidad

| Área | Comprobación | Resultado |
|---|---|---|
| Web | `pnpm test` | 15 pruebas aprobadas, incluidas captura móvil, catálogo multilingüe, frontera de portal y rechazo de back-office para cuenta cliente |
| Web | `pnpm check` | Tipos TypeScript correctos |
| Web | `pnpm build` | Compilación de producción correcta |
| Web | Revisión visual de `/studio` | Escritorio y móvil revisados |
| Móvil | `npx tsc --noEmit` | Correcto |
| Móvil | `npx expo export --platform web` | Exportación correcta |
| Móvil | `npx expo-doctor` | 21/21 comprobaciones aprobadas |
| Android/iOS | Estructura Expo precompilada | Carpetas nativas presentes; no se ejecutó build específico de plataforma |

## Alcance de pruebas

Se validaron el modelo de consentimiento, los prompts de estilo, la validación de imágenes privadas, las alternativas verificadas por identificador de prenda y las validaciones de formularios del cliente. Las entradas del Studio utilizan componentes con soporte para composición IME. La revisión de recursos públicos documentada en `GITHUB_RESOURCE_REVIEW.md` no añadió código externo: se incorporó únicamente el patrón declarativo de captura con cámara trasera para fotos de prenda y referencias, conservando los formatos admitidos y el límite de 4 MB.

La ampliación multilingüe incorpora español, portugués de Brasil, portugués de Portugal, inglés, francés, italiano y alemán. El selector se comprobó sin sesión: al cambiar de español a portugués de Brasil actualizó la presencia, el título, el control de propuesta y el aviso de voz. Una inspección posterior confirmó siete opciones configuradas y disponibilidad de `speechSynthesis` en el navegador de prueba. La reproducción es opcional y usa la síntesis local del navegador; no crea una grabación ni envía audio al servidor.

La auditoría móvil de `/studio` a 375 × 812 px verificó el recorrido de los tres nodos, el consentimiento, el estado vacío de propuesta y el asistente multilingüe sin desbordamiento horizontal. Una comprobación adicional a 320 × 720 px mantuvo la misma jerarquía y los controles dentro del ancho disponible. Se aumentaron los controles a un mínimo de 44–48 px, se evitó el zoom automático en entradas, se redujo la altura de paneles vacíos, se adaptó la zona segura inferior y se mantuvo la lectura de la pantalla de propuesta y del selector de idioma.

La separación de experiencias añadió el portal `/client`, un registro de acceso por correo invitado, consentimiento de lectura y la aprobación individual de looks con estado `ready`. Los procedimientos de clientas, encargos, decisiones, looks, referencias y propuestas contextuales del back-office ahora requieren rol administrador en servidor; una cuenta cliente no puede obtenerlos por la interfaz ni invocarlos como procedimientos profesionales. Una prueba de caller confirma que una cuenta con rol `user` recibe `FORBIDDEN` antes de consultar clientas, looks o propuestas de IA. La vista móvil sin propuesta se comprobó a 375 × 812 px: comunica que no expone mesa de trabajo, armario ni decisiones internas. La cobertura automatizada asciende a 15 pruebas; tipos y compilación de producción finalizaron correctamente. La validación final con una cuenta de clienta real, invitada y consentida queda pendiente para no crear datos de clientas ficticios.

En el último contraste externo, `https://fashstylist-gbgfkw2p.manus.space/client` continuó mostrando indisponibilidad por facturación, mientras que el Studio de desarrollo seguía disponible en `https://3000-i1piq6ez8xtyooyb7kxfv-0e00e1e4.us4.manus.computer/studio` para una sesión autenticada de Natalia.

## Validación que requiere sesión de Natalia

El navegador de validación no disponía de sesión autenticada. Al intentar enviar un formulario vacío, el sistema redirigió correctamente al inicio de sesión sin crear datos. La comprobación manual restante debe confirmar, con la sesión de Natalia, el foco por campo, la lectura del aviso de error y la navegación completa por teclado.

## Advertencia de bundle

El build web finaliza con advertencias de tamaño en dependencias de resaltado de código incluidas por componentes preinstalados. No bloquean la compilación ni el uso del Studio; una optimización posterior puede separarlas en cargas dinámicas.

## Límite de verificación móvil

La comprobación reproducible cubre TypeScript, exportación web de Expo, diagnóstico de Expo y la presencia de los proyectos nativos. No cubre una construcción o ejecución Android/iOS específica: este entorno no cuenta con SDK Android, Gradle, Xcode ni sesión Expo/EAS de Natalia. Por ello, los directorios nativos son una base preparada, no evidencia de un binario firmado.
