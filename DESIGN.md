# Manual de diseño de Quokka Studio

Versión 4.0 · Actualizado el 16 de octubre de 2026.

La implementación vigente es el frontend React/Next.js de este repositorio. Este manual registra su comportamiento actual; no existe una implementación HTML paralela. La guía de componentes y de desarrollo está en [frontend/README.md](frontend/README.md). Los contratos pendientes de servidor están en [frontend/BACKEND-INTEGRATION.md](frontend/BACKEND-INTEGRATION.md).

## 1. Identidad y alcance

Quokka es un estudio digital colaborativo, editorial, cálido y juguetón. Las superficies amplias, titulares expresivos y pequeños gestos de movimiento acompañan la lectura. Los cinco integrantes comparten una identidad visual; no se inventan perfiles ni demos publicadas.

La página principal es /. Presenta inicio, manifiesto, equipo, servicios, proyectos, tecnologías y contacto. /iniciar-sesion es el acceso preparado para conectar autenticación. No hay rutas públicas de laboratorio o experiencia. Los componentes reutilizables viven en frontend/components; no son páginas ni dependen de una ruta.

El contenido del equipo y las propuestas vive en frontend/lib/site-content.js. Las imágenes de proyectos son maquetas identificadas como propuestas en desarrollo. La validación de contacto y login funciona en el cliente; envío y autenticación requieren sus adaptadores, y la interfaz no afirma que existan sesiones o envíos mientras no estén conectados.

## 2. Tipografía y énfasis

- Gabarito: marca, titulares y encabezados importantes; variable --font-display.
- Figtree: cuerpo, etiquetas, controles y lectura; variable --font-body.
- DM Mono: índices, metadatos y pills; variables --font-mono y --font-pill.
- Las fuentes se cargan con next/font/google en frontend/app/layout.js; no hay fuentes serif ni énfasis en cursiva.

Tres acentos compartidos reemplazan la cursiva: .word-marker es un resaltado de fondo; .word-wave es un subrayado ondulado; .word-color y su variante .word-outline destacan mediante color o contorno. La onda se dibuja por palabra en títulos con letras transformadas, para que no desaparezca entre inline-blocks. No usar estos recursos en cada frase.

AnimatedHeading se reserva para el h1 y los h2 importantes de las secciones. Conserva semántica y nombre accesible. Las letras aparecen con un pliegue una sola vez al entrar en pantalla; el hover mantiene un pliegue pequeño por palabra. Los párrafos y h3 de cards permanecen como texto normal, sin mediciones de proximidad ni animación por letra. Sin JavaScript el contenido sigue visible; movimiento reducido omite los pliegues.

## 3. Color: colección, superficie y componente

La apariencia tiene una sola fuente en AppearanceProvider, montado en el layout. useAppearance comparte theme, mode y sus setters entre página y login. Una navegación interna conserva la selección. Una recarga inicia en Sonrisa/claro; no hay persistencia en almacenamiento local.

En html, data-pal selecciona la colección y data-theme fuerza light o dark. El modo system elimina data-theme y sigue prefers-color-scheme. La selección por defecto es sonrisa y light. frontend/lib/palettes.js contiene nombres, muestras y textos; frontend/app/globals.css contiene los valores CSS. Deben permanecer sincronizados.

Cada colección tiene siete muestras en este orden:

1. --palette-bg-1: fondo principal.
2. --palette-bg-2: segunda superficie.
3. --palette-bg-3: tercera superficie.
4. --palette-deep: superficie profunda en ambos modos.
5. --palette-color-1: primer acento.
6. --palette-color-2: segundo acento.
7. --palette-color-3: tercer acento.

--palette-text define la tinta de lectura. Los roles derivados --theme-on-color, --theme-on-deep y --theme-deep-action controlan el contraste en superficies intensas y profundas. Los estados --status-error, --status-on-error, --status-success y --status-warning son semánticos e independientes de las colecciones. No usar colores fijos para componentes de interfaz; se exceptúan el pelaje natural del símbolo, las ilustraciones locales y el revestimiento neutral decorativo de la pila CardSwap.

Las muestras siguientes respetan el orden de siete tokens anterior. Son valores actuales, no paletas alternativas pendientes.

### Sonrisa (sonrisa)

La sonrisa del quokka: crema de manteca, coral, turquesa y mostaza

- Claro: #FFF7E6, #FBEBCB, #FFE6D8, #042425, #C3301A, #0D7376, #856311. Texto: #2B2238.
- Oscuro: #1E1A26, #2A2433, #33283A, #031E1E, #EC8171, #13B0B5, #D9A21B. Texto: #FFF3DD.

### Lago rosa (lagorosa)

El rosa intenso de los lagos salados contra el turquesa del mar

- Claro: #FFF3F5, #FFE1E8, #DFF4F6, #032427, #C1275D, #0A717B, #7F620A. Texto: #3A1626.
- Oscuro: #231318, #301B22, #142A2E, #031D20, #E3759B, #10A9B8, #CFA011. Texto: #FFEFF2.

### Ultramar (ultramar)

Cielo despejado de la isla: cobalto, frambuesa y verde menta

- Claro: #F3F6FF, #E1E8FF, #FFE6EE, #33101C, #3B5BDB, #C71B58, #0B7555. Texto: #141B3A.
- Oscuro: #10152B, #1A2040, #2B1830, #290D17, #7C91E7, #EA6896, #12B886. Texto: #EEF2FF.

### Pitaya (pitaya)

Fruta tropical: magenta, lima y violeta

- Claro: #FFF5FA, #FCE3F0, #EDF7D9, #1A2805, #C2255C, #47710E, #6E46E8. Texto: #2A1030.
- Oscuro: #1D1021, #2A172F, #1E2A12, #152104, #E5759C, #74B816, #A287F0. Texto: #FFEFFA.

### Verbena (verbena)

Flores de verano: violeta eléctrico, aqua y fucsia

- Claro: #F6F3FF, #E7E0FF, #DDF6FA, #05252A, #6B3EEF, #0E6F7C, #BA1A82. Texto: #1D1533.
- Oscuro: #130F26, #1E1838, #0F2A30, #041F22, #A387F5, #15AABF, #EA6ABD. Texto: #F1EDFF.

### Superficies

Section establece data-surface y reinicia todos los roles locales; no controla el tema ni guarda estado.

- page: bg-1; primer acento para acciones.
- card: bg-2; segundo acento para acciones.
- muted: bg-3; tercer acento para acciones.
- deep: palette-deep; tinta y acciones derivadas de theme-on-deep/deep-action.
- primary, secondary y accent: el acento correspondiente como fondo, con roles invertidos de texto y acción.

Los descendientes consumen --s-bg, --s-fg, --s-action, --s-on-action, --s-alt, --s-on-alt, --s-sweep, --s-on-sweep, --s-field, --s-on-field, --s-border, --s-line, --s-focus y --s-placeholder. Las secciones anidadas reinician esos roles. Los portales necesitan su propia Section porque CSS hereda del DOM real.

## 4. Composición y adaptación

La composición pública vive en components/portfolio y sus estilos en styles/portfolio.css. Se usa un contenedor editorial, grids que se apilan y espacio generoso entre secciones.

- Separación de sección: --spacing-section = clamp(4rem, 9vw, 7rem).
- Margen lateral: --spacing-gutter = clamp(1.1rem, 4vw, 2.5rem).
- Radios compartidos: --radius-card = 1.125rem; --radius-pill = 999px.
- Tamaños base: --text-hero, --text-title y --text-lead se adaptan con clamp; portfolio.css ajusta la jerarquía editorial.
- Permitir min-width:0 en grids, tarjetas y fieldsets. Las etiquetas largas no deben crear scroll horizontal.
- Bajo 768 px, personas y demos muestran flechas con iconos, nombres accesibles y área de 48 px. En escritorio se ocultan; siguen disponibles rueda, arrastre y teclado.

## 5. Navbar, menú y navegación

El navbar es sticky y transparente. Usa una sola capa de backdrop blur con máscara, sin aclarar las secciones coloreadas. Su tinta sigue la superficie visible mediante posiciones cacheadas; el scroll actualiza progreso y movimiento del símbolo en un único requestAnimationFrame.

Los accesos de menú y paleta son iconos que se transforman en cierre. El relleno al hover usa el mismo seguidor radial que Button, sin magnetismo. No hay una segunda X en los paneles.

El menú abre debajo del navbar, con altura automática según sus enlaces y un mínimo de 22rem, limitado por el alto disponible. El bloque de login permanece al pie del panel mediante margin-top:auto; los enlaces pueden hacer crecer el menú. Al alcanzar el alto disponible, la lista navega con scroll propio y el login permanece visible al pie. Se cierra con su disparador, Escape, clic exterior o navegación. Menú y paleta esperan la caída del panel anterior antes de alternarse.

NavigationTransition, montado una sola vez en el layout, cubre todo el viewport durante enlaces internos de sección y cambios de ruta, incluido login. Navega bajo cobertura y espera el cambio de página antes de revelar. Los enlaces externos, descargas y clics modificados conservan su comportamiento nativo. En la portada, el símbolo Sling usa desplazamiento suave al inicio, sin cubierta ni salto instantáneo. Desde login vuelve a / bajo la transición compartida.

Orden de capas: lluvia 1450; transición 1500; navbar y sus paneles 1700; progreso 1800; seguidor 1900; SwipeToast 1950. Mantener este orden al añadir portales.

## 6. Botones, campos y feedback

Button ofrece primary, secondary, accent y ghost; tamaños sm, md y lg; enlace con href y botón nativo sin href. Su relleno sigue al cursor y el contenido acompaña con movimiento discreto. magnetic=false desactiva el magnetismo, conservando relleno, foco y presión. El estado loading bloquea acciones; success y error expresan resultados reales del consumidor.

Los campos comparten FormField: etiqueta flotante, icono que modifica trazos al editar, ayuda y error vinculados por IDs propios. El borde habitual es estático. El error rojo pulsa en opacidad sin girar ni recorrer el campo; movimiento reducido lo mantiene fijo. Select usa Radix para foco, teclado, opciones y FormData. Checkbox y RadioGroup son primitivas reutilizables verificadas, aunque no aparezcan en la página principal.

SwipeToast anuncia con role=status y aria-live=polite. Se descarta con un arrastre hacia abajo, cierre, acción o Escape con foco. El temporizador y su línea se pausan al hover, interacción, foco y pestaña oculta. duration=0 mantiene la notificación hasta cerrarla. No reemplazar errores de campo por toasts: cada campo debe conservar su mensaje asociado.

## 7. Cards y carruseles

Card separa un marco inmóvil del panel 3D. El tilt se limita a mouse fino sin movimiento reducido; mide el marco al entrar, no en cada movimiento global. Texto y enlaces conservan legibilidad y foco. SkillCard desactiva tilt por defecto.

TeamGallery usa un único slot por integrante. CircularGalleryCards calcula la curva y duerme al asentarse; FlipCard gira la cara central con CSS. Solo la cara y tarjeta activas son accesibles. El cambio de persona restaura el frente. Sin retrato, se muestran iniciales; no existen retratos ficticios ni copias repetidas del equipo.

CardSlider adapta CardSwap de React Bits a las propuestas. La pila conserva la salida, profundidad, arrastre, retorno elástico y cambio automático de 4 segundos. No hay filtro ni shader de distorsión en las previews. El motor pausa el temporizador fuera de pantalla, con foco, al hover y en pestaña oculta; el bucle se detiene cuando se asienta. Solo la tarjeta frontal participa en foco y lectores de pantalla.

La rueda se captura solamente dentro de cada carrusel para que la página no avance a la vez. Zoom con Ctrl y campos editables siguen siendo nativos. En móviles se muestran dos controles con iconos; en escritorio no hay botones superpuestos a las cards. Las listas vacías no montan carruseles; una sola tarjeta no muestra flechas.

DemoCard puede representar un estado locked para una integración futura, sin montar el contenido protegido. Esto es presentación, nunca autorización de servidor. La página actual muestra cuatro propuestas distintas, con imágenes locales y sin enlaces a demos inexistentes.

## 8. Mascota, marquee e ilustración

El símbolo del navbar responde al scroll mediante desplazamiento y giro pequeños. SlingButton separa clic y lanzamiento: clic o Enter sube suavemente; estirar al menos el umbral y soltar activa lluvia; Escape/cancelación no lanza. El elástico es una sola línea punteada.

La lluvia usa como máximo 16 Quokkas en escritorio y 10 en móvil, con un único bucle limitado a 60 actualizaciones por segundo. Se pueden agarrar y lanzar; no hay colisiones ni suelo. Se ocultan al salir, expiran en ocho segundos y repetir el lanzamiento reemplaza el anterior. Se detiene al navegar, ocultar la pestaña o activar movimiento reducido. El toast ofrece detenerla; el pool se reutiliza sin acumulación de nodos.

La ilustración principal usa HalftoneReveal en color, invertido e interactivo. No usa wander continuo y limita el dibujo a 30 fps. Fuera de pantalla duerme; la imagen accesible sirve como alternativa a WebGL y movimiento reducido.

Marquee tiene una copia accesible y repeticiones decorativas. Responde al sentido del scroll, pausa por foco, Espacio o toque y duerme fuera de pantalla. No tiene controles visuales superpuestos.

## 9. Footer

El footer concentra navegación en dos columnas, equipo, red social, marca y créditos. No repite una llamada de contacto que lleve a la sección inmediatamente anterior.

Su curva SVG rebota al entrar en pantalla y vuelve al borde plano en 1.8 segundos. El wordmark y la mascota aparecen una sola vez. Observadores y animaciones son locales, sin contextos GSAP anidados en el footer; desmontar, ocultar la pestaña o activar movimiento reducido cancela los frames y restaura el borde.

## 10. Mantenimiento y comprobaciones

El frontend usa JavaScript y CSS plano, Next.js App Router, React, Tailwind, GSAP, Motion, Radix y Lucide. Las fuentes adaptadas de React Bits son CardSwap, CircularGalleryCards, FlipCard, HalftoneReveal, SlingButton y SwipeToast. Sus adaptadores conservan los roles de color y los contratos de accesibilidad de Quokka.

Antes de mergear ejecutar lint, tests, build y revisar rutas, menús, formularios, teclado, movimiento reducido y móvil. Los tests cubren contratos accesibles, IDs, gestos, limpieza, navegación y física acotada; no sustituyen una comprobación visual real. Ver frontend/README.md para comandos y limitaciones vigentes.

Al cambiar una paleta, fuente, ruta, componente o animación, actualizar este documento y la guía de componentes en el mismo cambio. No conservar motores, assets o configuración de variantes retiradas. El backend queda fuera de esta reorganización.
