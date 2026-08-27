# Dirección de diseño — Fashion Stylist AI

## Tres rutas exploradas

| Tema | Introducción breve | Probabilidad |
| --- | --- | --- |
| **Prisma de seda** | Un editorial cálido con transparencias cremosas, metal suave y tipografía de revista. Se siente táctil, sereno y selecto. | 0.07 |
| **Atelier refractado** | Un paisaje de cristal grueso, luz líquida y capas con profundidad, donde cada interacción parece tallada en vidrio. La tecnología se percibe silenciosa y lujosa. | 0.04 |
| **Archivo cromático** | Una interfaz museográfica en blanco óptico, con tipografía sobria y gestos precisos de color. Prioriza orden, criterio y moda como cultura. | 0.09 |

## Enfoque seleccionado: Atelier refractado

### Movimiento de diseño

**Glassmorfismo matérico inspirado en el acabado industrial de Apple.** No se aplicará un efecto de desenfoque plano: las superficies usarán capas, bordes luminosos, sombras internas, reflejos desplazados y contraste tonal para sugerir cristal grueso con volumen real.

### Principios rectores

1. **Profundidad verificable:** cada pieza de vidrio debe tener un borde, una sombra y un plano posterior perceptibles.
2. **Luz como jerarquía:** los destellos suaves guían la lectura; no son decoración gratuita.
3. **Calma cinética:** los desplazamientos son continuos, físicos y breves; nunca compiten con el contenido.
4. **Precisión editorial:** el lenguaje visual y la interfaz se mantienen aspiracionales, claros y deliberadamente sobrios.

### Filosofía de color

La base será un negro azulado profundo que permita que el vidrio se perciba luminoso. Lavandas polarizadas, azul hielo y un **verde celadón eléctrico** aparecerán como refracciones y puntos de decisión. El brillo se usará con restricción: solo para revelar profundidad, foco o actividad.

### Paradigma de composición

La página será una sucesión de **placas de cristal que se solapan sobre un lienzo atmosférico**, en lugar de una cuadrícula rígida y centrada. El hero contiene una composición asimétrica: manifiesto a la izquierda y un laboratorio visual de looks a la derecha. Las secciones siguientes alternan densidad, escala y alineación para crear una narrativa de editorial digital.

### Elementos característicos

- **Cápsulas de cristal grueso** con halos internos, borde doble y refracción descentrada.
- **Píldoras orbitantes** que materializan beneficios, estilos y decisiones del asistente.
- **Arcos de luz líquida** que conectan visualmente paneles y marcan cambios de sección.

### Filosofía de interacción

Los controles aparecen por acumulación, como piezas que se ensamblan al entrar en escena. Los botones responden con compresión breve y un desplazamiento de reflejo; las tarjetas se inclinan apenas hacia el cursor para revelar su volumen. La interfaz conserva utilidad con teclado y respeta la preferencia de movimiento reducido.

### Animación

GSAP organizará las entradas mediante una secuencia de opacidad, desplazamiento vertical mínimo y escala inicial de 0.96. Las piezas agrupadas se desfasan entre 45 y 70 ms. Los destellos se desplazan en ciclos lentos y de baja amplitud; las respuestas de controles no superan 220 ms. El scroll activa revelados puntuales, no bucles invasivos.

### Sistema tipográfico

**DM Sans** es la voz funcional: limpia, contemporánea y muy legible. **DM Serif Display** aporta contraste editorial a titulares y cifras clave. Los titulares usan tamaño amplio, interlineado comprimido y cortes de línea intencionales; los textos operativos se mantienen cortos, densos y en versales pequeñas cuando describen estados.

### Esencia de marca

**Fashion Stylist AI convierte una intención personal en una decisión de estilo con criterio, contexto y presencia visual.**

Personalidad: **precisa, luminosa, selectiva**.

### Voz de marca

La voz es segura y breve, como una recomendación excelente de un estilista que sabe cuándo no añadir más. Los titulares evitan promesas vacías; los CTA invitan a una acción específica.

> «Tu estilo ya está ahí. Hagámoslo visible.»

> «Componer mi próximo look»

### Wordmark y símbolo

El símbolo es un monograma abstracto de dos lentes superpuestas que forman una silueta de percha y una chispa refractada. El nombre se compone en mayúsculas espaciadas, con un corte delicado en la “A” como guiño a una lente de cristal.

### Color de firma

**Celadón de refracción — `#9BFFC7`.** Un verde frío y brillante reservado para estados activos, pulsos y detalles que deben sentirse inequívocamente propios de la marca.

## Decisiones de estilo

- Se evitarán degradados púrpura genéricos, contenedores uniformemente redondeados y composiciones excesivamente centradas.
- Todo bloque translúcido deberá justificar su profundidad con por lo menos dos de estas señales: halo, borde doble, sombra interna, reflejo o plano de color detrás.
- La experiencia prioriza contraste legible y accesibilidad por encima de cualquier efecto de cristal.
