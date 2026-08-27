# Validación accesible del Studio

La comprobación de tipos y las pruebas unitarias cubren la validación de texto obligatorio y de imágenes permitidas. Los componentes `Input` usados por el Studio incluyen soporte para IME, bloqueando `Enter` mientras la composición está activa o acaba de finalizar.

La verificación de navegador se realizó sin una sesión autenticada: al intentar enviar el formulario vacío, la aplicación redirigió a inicio de sesión antes de guardar o modificar datos. Por tanto, no se creó ninguna ficha de clienta durante la comprobación.

## Verificación sin autenticación

La validación del formulario de nueva clienta se comprobó sin sesión y sin crear datos: al enviar el campo vacío, la página permaneció en el Studio, mostró el aviso `role="alert"` y devolvió el foco al campo de nombre. El campo se marcó mediante `aria-invalid="true"` y se asoció al aviso con `aria-describedby="studio-form-notice"`.

La inspección de la interfaz confirmó `focused: true`, `ariaInvalid: "true"`, `describedBy: "studio-form-notice"` y `alertRole: "alert"`. También se verificó que la capa refractada contiene una alternativa para `prefers-reduced-transparency: reduce` que elimina `backdrop-filter`.

Una prueba de tabulación posterior dejó el foco en el enlace superior `Manifiesto`, no en el siguiente campo del formulario. Esto indica que la comprobación debe repetirse desde el campo enfocado y con un orden de foco controlado antes de declarar cerrada la navegación por teclado.

La repetición controlada situó el foco en `Nueva clienta` y, al pulsar `Tab`, el foco avanzó a `Nota inicial opcional` (`TEXTAREA`). Esto confirma la secuencia de teclado del formulario al partir de un control enfocado.

También se enfocó `Crear ficha` y se activó con `Enter`. El formulario mostró el mismo aviso de validación y devolvió el foco al nombre de la clienta, sin iniciar sesión ni persistir datos.

Por último, se simuló una composición IME seguida de `Enter` sobre el campo de clienta. El foco permaneció en el campo, el aviso no cambió y el formulario no se activó. Esto complementa el soporte de composición existente en el componente `Input`.

## Flujo de look y archivos

La creación manual de looks ya no abre diálogos del navegador: incluye campos visibles para el nombre, la explicación profesional obligatoria y el ajuste opcional. El foco se desplaza a la explicación si falta, y el aviso se asocia con `aria-invalid` y `aria-describedby`.

Los controles de fotografía de prenda y de referencia envían los errores de formato o tamaño al mismo mecanismo de foco y asociación ARIA. El Studio se revisó en escritorio y móvil después de este cambio; la composición conserva jerarquía y superficies de cristal en ambos tamaños.

La siguiente comprobación manual autenticada puede verificar el mismo comportamiento en los formularios que se habilitan tras seleccionar una clienta y confirmar consentimiento, pero la validación base ya queda demostrada sin introducir datos de prueba.
