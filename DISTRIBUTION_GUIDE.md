# Guía de distribución de Fashion Stylist AI

## Estado disponible

La **web** está publicada en el dominio administrado del proyecto. La aplicación móvil paralela se encuentra en `/home/ubuntu/fashion-stylist-mobile/`, con proyectos nativos `android/` e `ios/` generados por Expo, una exportación web validada y una reflexión local de composición. Ningún artefacto se ha firmado ni enviado a una tienda.

| Entregable | Estado | Requisito pendiente |
|---|---|---|
| Web publicada | Disponible | Prueba manual autenticada de formulario accesible |
| App Android | Proyecto nativo listo | Sesión Expo/EAS de Natalia para generar APK firmado |
| App iOS | Proyecto nativo listo | Cuenta Apple Developer, firma y compilación remota |
| ZIP de entrega | Preparado al final del proceso | Incluirá fuentes, documentación y entradas de contexto autorizadas |

## Android

Natalia debe iniciar sesión en **Expo/EAS**. A continuación podrá solicitar una compilación interna `preview` configurada para Android. La generación de un APK firmado exige que la cuenta propietaria apruebe las credenciales de Android; esas claves no se almacenan en el proyecto ni en la documentación.

> La compilación no se inicia automáticamente. La firma es una decisión de la titular de la cuenta.

## iOS

Para obtener un archivo distribuible en iOS se requiere una cuenta activa de **Apple Developer** de Natalia, el identificador de paquete ya preparado (`com.belentani7.fashionstylistai`) y la aprobación de certificados/perfiles. La distribución de pruebas se realizará mediante el flujo autorizado por la titular, habitualmente TestFlight.

## No incluido deliberadamente

No se incluyen secretos, certificados, claves de firma, tokens de Expo, credenciales Apple ni bases de datos exportadas. Las fotografías privadas y los datos de clientas permanecen sujetos al consentimiento y a los controles del Studio.

## Cierre sin cuentas de pago

En esta entrega no se generó un APK firmado ni un archivo iOS distribuible porque no se dispone de una sesión Expo/EAS de titularidad de Natalia ni de una cuenta Apple Developer con capacidad de firma. Sí quedan disponibles los proyectos nativos, la configuración de paquetes, la exportación web de Expo y la guía exacta para que la titular complete la firma cuando decida hacerlo. No hace falta reconstruir el producto para continuar ese paso.

La comprobación de este entorno confirma además que no hay SDK Android configurado, Gradle instalado ni Xcode disponible. Por ello no existe una ruta local alternativa para fabricar binarios firmados de forma responsable.
