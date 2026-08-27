# Auditoría de producto — Fashion Stylist AI para Natalia

**Fecha:** 26 de agosto de 2026  
**Criterio rector:** una función solo entra si ahorra tiempo a Natalia, mejora una decisión de estilismo o mejora de forma directa la propuesta que recibe una clienta.

## Estado verificado

| Área | Estado real | Decisión |
| --- | --- | --- |
| Landing editorial | Funciona y conserva la identidad Atelier refractado. | Mantenerlo como entrada de marca; no convertirlo en dashboard. |
| Studio | Existe como ruta autenticada, con perfil, armario, conversación y consentimiento. | Convertirlo en espacio de trabajo profesional. |
| Autenticación y datos | OAuth, tRPC, MySQL/Drizzle y procedimientos protegidos están disponibles. | Reutilizar; no reconstruir la base. |
| Perfil y armario | El perfil y las prendas se guardan en base de datos; las entradas están validadas. | Ampliar con información estructurada y correcciones manuales. |
| Asistencia de IA | Existe una llamada de servidor con contexto de perfil y armario. | Sustituir la respuesta genérica por propuestas estructuradas y verificables. |
| Privacidad | Se exige consentimiento activo antes de guardar datos de estilo o consultar al asistente. | Mantenerlo y extenderlo a los nuevos datos. |
| PWA | Manifest y arranque independiente en `/studio` configurados. | Mantener como acceso móvil web; no trabajar ahora en distribución nativa. |
| Aplicación nativa | Hay una base Expo paralela y no distribuida. | Posponer conforme a la instrucción actual. |

## Huecos que no se confundirán con funciones reales

El producto todavía no posee gestión de clientas, contexto por encargo, referencias visuales almacenadas, constructor de looks, comparador, memoria de decisiones, propuestas compartibles ni análisis de fotografías. Tampoco se declarará una recomendación como generada o guardada si faltan prendas, ocasión o confirmación humana.

## Protocolo de tres nodos

El protocolo no crea procesos de fondo, agentes autónomos ni una red externa. Es una regla de producto para impedir que la IA se convierta en un chat aislado y para mantener cada decisión editable.

| Nodo | Propósito | Datos que recibe | Resultado verificable |
| --- | --- | --- | --- |
| **1. Persona y encargo** | Definir para quién se trabaja y qué necesita. | Clienta, preferencias confirmadas, contexto y ocasión. | Una ficha editable con restricciones y objetivo de imagen. |
| **2. Mesa de composición** | Construir el look a partir del armario y las decisiones. | Prendas registradas, referencias separadas y restricciones del nodo 1. | Uno o varios looks modificables, con sustituciones y decisiones guardadas. |
| **3. Propuesta profesional** | Comparar, explicar y presentar la elección. | Looks del nodo 2, explicación contextual y notas de Natalia. | Comparativa y propuesta limpia que Natalia puede revisar antes de compartir. |

> La información pasa del nodo 1 al 2 y del 2 al 3. Una modificación en cualquier nodo vuelve a ser una decisión humana explícita; el asistente puede proponer, pero nunca confirma ni publica por sí mismo.

## Prioridad de implementación

1. Crear ficha de clienta, encargo y preferencias editables.
2. Convertir el armario en fuente de un constructor manual de looks.
3. Guardar decisiones y permitir comparar alternativas con explicación.
4. Añadir una presentación de propuesta; integrar la IA como ayuda contextual y no como requisito.

Las cargas de fotografías, el análisis visual, la sincronización móvil, los trabajos en segundo plano, pagos y distribución de apps permanecen fuera de este incremento hasta que haya una necesidad operativa concreta.
