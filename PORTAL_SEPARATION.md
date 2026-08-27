# Separación de experiencias: Natalia y clienta

El producto tiene tres zonas deliberadamente distintas. La página pública explica el método y no consulta datos. El Studio en `/studio` pertenece a Natalia, quien administra clientas, encargos, armario, referencias, decisiones, creación de looks, IA y aprobación. El portal en `/client` es una lectura personal de una clienta invitada.

| Experiencia | Quién entra | Qué puede ver | Qué no puede ver ni hacer |
|---|---|---|---|
| Landing público | Cualquier visitante | Manifiesto y explicación del método | Datos, fotos, clientas, looks y propuestas privadas |
| Studio de Natalia `/studio` | Cuenta administradora del Studio | Fichas, contexto, prendas privadas, referencias, decisiones, constructor, IA y estado de aprobación | No publica ni comparte automáticamente |
| Portal de clienta `/client` | Cuenta autenticada con correo invitado y consentimiento activo | Solo sus looks con estado `ready`, componentes textuales y explicación aprobada | Armario, fotografías privadas, referencias, memoria de decisiones, otras clientas, IA o edición |

## Flujo de autorización

Natalia selecciona una clienta y prepara el acceso con un correo concreto. La cuenta invitada inicia sesión con ese correo y debe aceptar la lectura limitada antes de ver contenido. Natalia aprueba cada look individualmente; un look en borrador o archivado no aparece. Al revocar el acceso, el portal deja de devolver la propuesta.

> El correo invitado y el consentimiento de portal son datos operativos de acceso. No se envían correos, enlaces públicos, fotografías ni propuestas de forma automática.
