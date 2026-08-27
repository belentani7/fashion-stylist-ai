# Revisión curada de recursos públicos de GitHub

La revisión identificó dos referencias relevantes para el Studio. Se usaron **como investigación de producto**, no como código copiado ni como recursos visuales incorporados sin verificación de derechos.

| Recurso | Aporte identificado | Decisión |
|---|---|---|
| [AI Closet](https://github.com/zebangeth/ai-closet) | Referencia MIT de aplicación Expo; separa interfaz, estado y persistencia local, e ilustra la progresión de armario a propuesta. [1] | Mantener como referencia arquitectónica de la capa móvil; no copiar código. |
| [Libre Closet](https://github.com/Lazztech/Libre-Closet) | Organizador de armario con PWA, fotos y una solución explícita de captura de cámara móvil. [2] | Adoptar solo el patrón conceptual de captura desde cámara. No incorporar código por su licencia AGPL-3.0. |

## Selección aplicada

El recurso útil y proporcional es habilitar a la persona usuaria para tomar una fotografía de prenda o referencia desde la cámara del dispositivo, además de seleccionar un archivo. El Studio ya valida formato, tamaño, consentimiento y propiedad; se añade la sugerencia `capture="environment"` al control de carga como mejora móvil, sin copiar código externo.

No se descargan ni ejecutan repositorios externos. No se incluyen activos gráficos ajenos, datasets no verificados, claves, componentes con licencia incompatible ni dependencias adicionales.

## Referencias

[1]: https://github.com/zebangeth/ai-closet "zebangeth/ai-closet"
[2]: https://github.com/Lazztech/Libre-Closet "Lazztech/Libre-Closet"
