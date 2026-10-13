# Manual de Diseño y Estilo
## Sistema visual de Quokka Studio

**Versión:** 3.0  
**Referencia de implementación:** `Quokka.html`  
**Implementación actual:** prototipo HTML autocontenido y migración en curso a React/Next.js con Tailwind; backend Node.js. El contrato cromático vive en `frontend/app/globals.css`.  
**Idioma del contenido:** español. Los nombres de tecnologías y algunas etiquetas técnicas pueden mantenerse en inglés.  
**Tema:** portfolio colaborativo, cálido y editorial, con identidad inspirada en los quokkas y una base técnica.

**Uso de componentes React:** consultar [la guía del frontend](frontend/README.md)
para imports, props, responsabilidades y límites de reutilización. La página de
pruebas no debe convertirse en una dependencia de los componentes.

---

## 1. Propósito

Este documento registra el sistema visual que debe mantenerse al modificar o ampliar Quokka Studio. Sirve como referencia para colores, tipografías, composición, espaciado, tarjetas, navegación, interacciones y adaptación responsive.

La interfaz debe sentirse:

- **Cercana:** formas amigables, color orgánico y lenguaje directo.
- **Creativa:** composición editorial, titulares expresivos y detalles visuales reconocibles.
- **Técnica:** etiquetas monoespaciadas, índices de sección y referencias al desarrollo.
- **Coherente:** una misma identidad en todas las secciones, aunque cambien sus fondos y acentos.
- **Legible:** contraste suficiente, descripciones cómodas de leer y jerarquía clara.
- **Responsive:** composición adaptable a escritorio, tablet y móvil sin depender de posiciones absolutas para organizar el contenido.

El portfolio presenta al equipo, sus capacidades, tecnologías, proyectos de muestra y una representación del sistema que se proyecta desarrollar. Los prototipos o datos ilustrativos no deben presentarse como funcionalidades de producción ya implementadas.

---

## 2. Dirección visual

### 2.1 Personalidad de marca

Las palabras guía son:

- **Amable:** el lenguaje visual toma como inspiración la apariencia simpática y curiosa de los quokkas, sin convertir la interfaz en algo infantil.
- **Editorial:** titulares grandes, frases destacadas, variaciones de escala y generoso espacio negativo.
- **Orgánica:** verdes apagados, tonos tierra, crema y superficies con calidez.
- **Técnica:** tipografía monoespaciada en metadatos, índices, etiquetas y detalles relacionados con desarrollo.
- **Colaborativa:** cada integrante tiene identidad propia, pero las tarjetas comparten la misma estructura y reglas visuales.
- **Interactiva:** animaciones y microinteracciones que ayudan a entender la interfaz, no que distraen de su contenido.

### 2.2 Qué evitar

- Volver a una estética SaaS genérica con degradados decorativos por todas partes.
- Usar cuatro o cinco colores dominantes simultáneamente en una misma vista.
- Repetir caritas, mascotas o ilustraciones de quokkas en todas las tarjetas del equipo.
- Añadir etiquetas solo para llenar espacio, especialmente si repiten información ya presente en el título.
- Duplicar el prefijo `//` en los encabezados de sección.
- Usar monoespaciada para párrafos largos.
- Utilizar Fraunces como fuente principal de lectura.
- Añadir bordes gruesos, sombras pesadas o demasiados radios redondeados a todos los componentes.
- Centrar párrafos largos cuando una alineación a la izquierda mejora la lectura.
- Ocultar información esencial en móvil o hacer que una acción dependa exclusivamente del hover.
- Usar emojis como sustituto de iconos funcionales.
- Presentar prototipos, métricas simuladas o ejemplos como datos reales del sistema.

---

## 3. Sistema de color: tema → superficie → componente

Esta sección es normativa para el equipo y sus asistentes. La colección activa es la única fuente de colores de marca de toda la página. Una sección NO crea su propia paleta.

### 3.1 Nivel 1: colección del tema

`data-pal` en `<html>` selecciona `eucalipto` (por defecto), `salinas`, `marea`, `corteza`, `crepusculo` o `pastizal`. `data-theme="light|dark"` fuerza el modo; si falta, se sigue `prefers-color-scheme`. Tema y modo son decisiones independientes.

Cada tema tiene exactamente siete colores por modo, en este orden canónico:

1. `--palette-bg-1`: fondo base.
2. `--palette-bg-2`: segunda superficie.
3. `--palette-bg-3`: tercera superficie.
4. `--palette-deep`: oscuro profundo, también en modo claro.
5. `--palette-color-1`: primer color de marca.
6. `--palette-color-2`: segundo color de marca.
7. `--palette-color-3`: tercer color de marca.

No agregar rellenos independientes para hero, equipo, contacto o gráficos. El modo nocturno conserva la familia del tema: tres fondos oscuros, un profundo y tres colores luminosos. Los colores diurnos de marca son más profundos para permitir texto y controles legibles. Solo sombras, bordes sutiles y overlays pueden usar transparencia; no generar nuevas superficies con mezclas, blanco o negro ajenos a la colección.

#### Colecciones exactas y nombres evocadores

Las listas siguientes mantienen el orden canónico de los siete tokens. Los nombres describen lo que evoca cada muestra; nunca su función técnica. Son diferentes en modo nocturno.

**Eucalipto y niebla** (`eucalipto`)

Las hojas y los matorrales bajos son el refugio y buena parte de la comida del quokka. Esta paleta lleva ese verde salvia a la interfaz y lo acompaña con la bruma azulada que sube del mar en las mañanas de la costa.

- Claro: caliza tibia `#F1EEE4`; papel de hojas `#E7E3D4`; bruma costera `#D5D9D4`; sombra del refugio `#1B1E21`; hoja de eucalipto `#435C4D`; mar entre niebla `#3E5E72`; pelaje tostado `#6D5744`.
- Oscuro: matorral nocturno `#1B1E21`; hojas en sombra `#25292D`; refugio entre ramas `#303A35`; noche cerrada `#101714`; salvia bajo la luna `#8DB39A`; bruma lunar `#86A9BF`; pelaje a la luz de luna `#E7D8C3`.

**Salinas** (`salinas`)

Viene de los lagos salados rosados de la isla de Rottnest, el hogar del quokka. Ese rosa nace de microorganismos que viven en el agua salada. Aquí se combina con la arena clara de la orilla y el verde apagado del mar poco profundo, para una página suave, cálida y distinta.

- Claro: espuma salada `#F6F0EA`; orilla rosada `#EBDDD6`; sal húmeda `#E3E8E2`; sombra de salina `#211C1F`; rosa de los lagos `#76535C`; agua quieta `#485F5C`; arena seca `#6D5B4F`.
- Oscuro: lago de noche `#211C1F`; salina en sombra `#2D2528`; orilla nocturna `#393031`; noche sobre la sal `#140F12`; rosa bajo la luna `#D6A3AE`; agua de luna `#8FB8B3`; sal iluminada `#EFE0C8`.

**Marea** (`marea`)

Toma el agua turquesa que rodea la isla, las playas de arena casi blanca y la piedra caliza de la costa. Es la paleta más fresca: su azul verdoso hace resaltar el pelaje tostado del quokka, que es justo su color complementario.

- Claro: arena blanca `#F4F3EE`; espuma de marea `#E3ECEA`; caliza de playa `#E9E0D2`; fosa marina `#152024`; agua turquesa `#3A676A`; horizonte costero `#4C646F`; roca húmeda `#5E625A`.
- Oscuro: mar de noche `#152024`; oleaje en sombra `#1E2D31`; roca sumergida `#2B3A3D`; abismo marino `#0C1518`; turquesa lunar `#7FC0BE`; horizonte de luna `#8DB2C6`; espuma iluminada `#EEE1CC`.

**Corteza** (`corteza`)

Recuerda a las melaleucas, árboles de corteza en finas capas de papel que crecen entre los matorrales y las zonas húmedas donde el quokka busca sombra, agua y refugio. Tonos de corteza, musgo y niebla de pantano para una página cálida y natural.

- Claro: papel de corteza `#F3EFE6`; hojas caídas `#E6DECF`; niebla de pantano `#DDE3D8`; hueco del árbol `#1E1C19`; corteza de melaleuca `#665847`; musgo del refugio `#5C604E`; piedra del sotobosque `#5A5D57`.
- Oscuro: bosque nocturno `#1E1C19`; corteza en sombra `#2A2723`; musgo de noche `#373A30`; hueco sin luz `#12110E`; corteza de luna `#C2A98A`; musgo bajo la luna `#A3AE8C`; niebla iluminada `#E1E7DE`.

**Crepúsculo** (`crepusculo`)

Los quokkas son más activos al caer la tarde y durante la noche, cuando salen a comer y a moverse. Esta paleta captura ese momento: cielo lavanda, azul de atardecer y un durazno rosado muy tenue que recuerda la última luz del día.

- Claro: luz de lavanda `#F4F0F3`; nube violeta `#E6E0EA`; cielo del ocaso `#DDE3ED`; noche naciente `#1B1B27`; violeta del horizonte `#5D597C`; azul de la tarde `#595E71`; última luz rosada `#695C62`.
- Oscuro: cielo nocturno `#1B1B27`; nube en sombra `#272636`; horizonte de noche `#343342`; medianoche `#10101A`; lavanda lunar `#B1ABD9`; azul de luna `#8FA6CC`; resplandor del ocaso `#F0DCD4`.

**Pastizal salino** (`pastizal`)

Reúne lo que forma su dieta: hojas plateadas de arbustos que crecen cerca del mar, pasto seco, tallos y semillas. Salvia plateada, color paja y marrón de semilla para una página sobria y tranquila.

- Claro: paja clara `#F5F2E8`; pasto seco `#E9E6D2`; hojas plateadas `#DBE5DF`; sombra entre tallos `#1D2122`; salvia salina `#51625A`; semilla de pasto `#615E48`; tierra seca `#686051`.
- Oscuro: pastizal nocturno `#1D2122`; tallos en sombra `#272D2C`; refugio de noche `#363A31`; noche entre raíces `#111615`; salvia lunar `#9FBDB3`; paja bajo la luna `#D6C592`; semilla iluminada `#EEE0D1`.

### 3.2 Nivel 2: contexto de superficie

Cada contenedor declara `data-surface` y aplica `bg-surface text-on-surface`, como hace `components/section.jsx`. Todos sus descendientes heredan los roles. Un contenedor anidado con `data-surface` reinicia TODOS los roles, sin arrastrar combinaciones del padre. Agregar solo `bg-card` no crea un contexto nuevo.

- `page`: bg-1, texto del tema, acción color-1, alternativa color-2.
- `card`: bg-2, texto del tema, acción color-2, alternativa color-1.
- `muted`: bg-3, texto del tema, acción color-3, alternativa color-1.
- `primary`, `secondary`, `accent`: fondo color-1, color-2 o color-3. Texto y acciones invertidos: bg-1 en claro, deep en oscuro; texto del botón igual al color de la superficie.
- `deep`: fondo deep, texto bg-1 en claro / color-3 en oscuro. Acción bg-1 en claro / color-1 en oscuro, texto deep. Hover bg-2, texto deep en claro / color-3 en oscuro.
- Compatibilidad: `tint-primary` equivale a bg-2 con acción color-1; `tint-secondary` a muted con acción color-2; `tint-accent` a muted. No generan tintes nuevos. Preferir `page`, `card`, `muted` en componentes nuevos.

Texto del tema: deep en claro, color-3 en oscuro. Texto sobre colores: bg-1 en claro, deep en oscuro. El texto secundario conserva ese color; la jerarquía se expresa con tamaño, peso y espaciado, sin bajar contraste arbitrariamente.

Roles heredados y utilidades Tailwind:

- `--s-bg` / `--s-fg`: `bg-surface`, `text-on-surface`.
- `--s-action` / `--s-on-action`: `bg-action`, `text-on-action`.
- `--s-alt` / `--s-on-alt`: `bg-alt`, `text-on-alt`.
- `--s-sweep` / `--s-on-sweep`: relleno y texto del hover/foco.
- `--s-panel`: `bg-panel`, superficie de panel interior. Para crear una tarjeta con botones propios, declarar también su `data-surface`.
- `--s-field` / `--s-on-field`: `bg-field`, `text-on-field`, `border-field-border`, campos legibles aun dentro de una sección de color.
- `--s-border` / `--s-line`: `border-surface-border` para controles, `border-surface-line` para divisores decorativos. Nunca usar el divisor tenue como único límite de un input.
- `--s-focus`: `outline-focus`, anillo de foco con separación visible.
- `--s-placeholder`: `placeholder:text-placeholder`, siempre junto a un label; no sustituye la etiqueta.

### 3.3 Nivel 3: componentes y estados

Los componentes no consultan `data-pal`, ni tienen ramas por tema, ni reciben props con HEX. Consumen roles de su contexto CSS más cercano. Las variantes expresan jerarquía, no un color concreto.

```jsx
<Section surface="deep" className="py-section px-gutter">
  <Button variant="primary">Ver proyectos</Button>
  <Section as="article" surface="card">
    <Button variant="accent">Ver perfil</Button>
    <input className="bg-field text-on-field border border-field-border
      placeholder:text-placeholder focus-visible:outline-2
      focus-visible:outline-offset-2 focus-visible:outline-focus" />
  </Section>
</Section>
```

- Botón `primary`: action/on-action; hover y foco sweep/on-sweep.
- Botón `secondary`: transparente, borde y texto action; hover y foco action/on-action.
- Botón `accent`: alt/on-alt; hover y foco sweep/on-sweep. NO usar on-action sobre alt.
- Botón `ghost`: texto action, overlay sutil derivado de action, foco visible.
- Deshabilitado: conservar el par de colores, bajar opacidad y bloquear interacción. Carga: mismo tratamiento y `aria-busy`; no comunicarla solo mediante animación.
- Inputs, selects y textareas: field/on-field, borde field-border, placeholder legible, foco focus. Error con texto explícito y `aria-invalid`.
- Tarjetas, formularios, diálogos y popovers: declaran su superficie si pintan un fondo propio. Si un diálogo se monta en un portal, transportar `data-surface` explícitamente; no asumir que hereda el DOM del disparador.
- Carruseles y chips: controles con los mismos roles; selección también mediante forma, texto o `aria-pressed`, no solo color.
- Identidad del equipo y gráficos: reutilizar color-1/2/3; repetir colores cuando haga falta y distinguir con nombres, numeración o patrones. No conservar HEX por integrante fuera del tema.

### 3.4 Estados semánticos y accesibilidad

#### Animación: React, CSS y GSAP

- React controla contenido, tema, acciones y estados (loading/disabled). CSS controla superficies, colores, tipografía, foco y el fallback de relleno accesible. GSAP controla transformaciones y secuencias: una propiedad animada tiene un único responsable. No combinar transiciones CSS de transform/scale/translate/rotate con GSAP sobre el mismo elemento.
- Importar gsap, useGSAP, ScrollTrigger y MOTION desde frontend/lib/gsap.js. Ese módulo registra los plugins una vez y define tiempos compartidos sin modificar defaults globales. ScrollTrigger queda preparado para la siguiente etapa de entradas y secuencias; no crear triggers dentro de Button ni convertir Section en un componente cliente.
- Usar useGSAP con scope local; si hay dependencias de movimiento/estado, usar revertOnUpdate: true. Envolver callbacks que creen animaciones después del montaje con contextSafe. Quitar listeners, nodos decorativos y callbacks del ticker al desmontar. Evitar selectores globales y no usar estado de React por frame.
- Las secuencias de páginas se definen cerca de cada página, sobre wrappers propios: un Reveal futuro animará su wrapper, sin disputar el transform de Button. Respetar movimiento reducido; el contenido siempre debe ser accesible sin animaciones.

#### Button y CursorFollower

- Button delega movimiento a frontend/hooks/use-button-motion.js. Mantiene su API: magnetic, strength (0–1, por defecto 0.28), maxRotation (0–15°, por defecto 7), variantes, tamaños, href, carga y deshabilitado.
- Magnetismo: GSAP quickTo reutiliza tweens de posición y giro (0.35s, power3.out). A la derecha, arriba gira en negativo y abajo en positivo; a la izquierda se invierte. Texto e iconos se desplazan juntos dentro del botón, aproximadamente 7px horizontal/4px vertical con fuerza normal, con un límite para preservar padding. magnetic=false desactiva también ese movimiento interno.
- Al salir, botón y contenido regresan con elastic.out(1, 0.4) durante 0.7s. Reentrar interrumpe el retorno y retoma desde los valores reales. No agregar wiggle constante en reposo.
- Presión: escala 0.96 en 80ms, giro al 25%; al soltar recupera escala 1 en 200ms con back.out(1.4). GSAP usa overwrite:auto para no cancelar propiedades independientes. La acción no espera la animación. Enter/Space siguen la semántica nativa; soltar fuera, cancelar o perder foco libera el estado.
- El foco por clic no reinicia magnetismo. El foco visible de teclado centra botón/contenido. Con movimiento reducido no hay magnetismo, rebote ni escala; el borde cambia inmediatamente al presionar. Touch conserva presión y fallback visual sin seguidor.
- Button funciona sin CursorFollower: mantiene contenido, foco, presión y acciones. El seguidor es un complemento decorativo global montado una sola vez en layout.js, nunca un requisito para ejecutar onClick.
- Un único círculo ampliado pasa de body al contexto de Button, detrás del contenido y recortado por su forma. Su radio objetivo es el 85% del ancho (diámetro 170%). Sigue al puntero durante todo el hover, compensando posición, rotación y escala GSAP. Adopta el color local exacto de hover (sweep/action/overlay de ghost), sin inversión dentro del botón. Los pares cromáticos siguen definidos en la sección; esta migración no cambia la paleta.
- CursorFollower usa quickTo sobre su estado (0.22s, power3.out) y quickSetter para dibujar. Su callback del ticker solo coordina geometría/capas: no interpola ni implementa otra física. Fuera de hover se desconecta al terminar los tweens. Cambios de tema, disabled y desmontaje se detectan también sin mover el mouse.
- Hover real: usar elementFromPoint con las coordenadas, sin confiar en event.target capturado durante un arrastre. Salir cancela presión y retira el fondo aunque siga apretado el mouse. No usar :active para mantener relleno de mouse.
- Durante la retirada el círculo sigue al cursor y reduce el radio hacia 9px. Vuelve a body cuando ya no intersecta el rectángulo del botón o su radio es menor que 9.5px. Reentrar cancela la retirada sin reiniciar geometría. data-cursor-ink conserva el par de texto mientras el círculo cubre el centro.
- Una bolita exterior auxiliar de 18px comparte el centro del seguidor durante la retirada y se muestra apenas ese centro sale del botón. Al volver el círculo principal a body, toma su lugar en el mismo frame. La auxiliar nunca crece. En modo libre clip-path:circle(9px at 50% 50%) evita el destello gigante; dentro del botón se retira esa máscara.
- Libre, blanco + mix-blend-mode:difference invierte el fondo (excepción óptica, no un color de marca). Los nodos llevan aria-hidden y pointer-events:none; no reciben foco ni interceptan clics. Con teclado, touch, movimiento reducido, scroll o pérdida de foco de ventana se oculta el seguidor.
- Texto: sm 16px, md 18px, lg 20px. Colisiones entre botones quedan fuera del alcance actual.

Únicas excepciones cromáticas: `--status-error` (#9C3328 / #FFB4A9), `--status-success` (#24613D / #A4DDB5) y `--status-warning` (#765400 / #EFCE83), claro / oscuro. Se usan sobre fondos bg-1/2/3 con mensaje e icono o etiqueta, nunca como decoración ni como marca. En fondos de color, colocar el mensaje en un panel neutro con contexto `card`.

Exigir 4.5:1 para texto normal y 3:1 para controles, foco y texto grande. Revisar combinaciones en los seis temas y ambos modos, incluyendo superficies anidadas. Los alias globales `--bg`, `--card`, `--fg`, `--primary`, `--secondary`, `--accent`, `--line` siguen disponibles para el marco de la aplicación; un componente reutilizable debe preferir `--s-*`.

### 3.5 Selector del prototipo

- Conservar las historias y la animación del nombre y la descripción, respetando movimiento reducido.
- Mostrar una tira continua con exactamente siete muestras de la colección activa, sin HEX ni etiquetas visibles permanentes.
- Cada muestra tiene nombre evocador accesible. Aparece al hover, al foco de teclado o al tocar; el toque lo mantiene visible hasta elegir otra muestra. No usar solo el tooltip nativo `title`.
- El cambio de modo actualiza simultáneamente muestras y nombres; nunca describir un fondo nocturno como arena blanca.
- Cerrar siempre la descripción con: “El sitio reparte estos colores entre sus secciones; en modo oscuro usa la versión nocturna de la misma colección”.
- Guardar la preferencia es opcional: la interfaz funciona sin localStorage.

### 3.6 Fuente y mantenimiento

`frontend/app/globals.css` es el contrato de producción. Los dos `Quokka.html` son prototipos autocontenidos con los mismos valores y roles. Al cambiar una colección, actualizar el manual, los siete tokens CSS y las muestras/nombres de ambos prototipos. No actualizar solo el selector: sus muestras deben coincidir con los valores computados de la página. Los tokens heredados del prototipo son adaptadores, no nuevas paletas.

---

## 4. Tipografía

### 4.1 Familias

La interfaz usa cuatro familias con responsabilidades diferentes. Aunque se procura mantener pocas voces tipográficas, Fraunces funciona como acento editorial y no como una familia de uso general.

- **Gabarito:** logotipo, titulares, nombres de integrantes, encabezados de tarjetas, números grandes y texto de impacto. Aporta formas cálidas y una personalidad cercana.
- **Source Sans 3:** cuerpo de texto, descripciones, navegación general, botones y contenido que necesita lectura sostenida.
- **IBM Plex Mono:** índices, etiquetas técnicas, roles, metadatos, nombres de tecnologías y pequeños elementos de interfaz.
- **Fraunces:** acentos editoriales puntuales, especialmente palabras en cursiva dentro de títulos y frases del manifiesto.

Google Fonts se carga mediante el enlace presente en el HTML. Si el proyecto se migra a Next.js, estas familias deben cargarse de manera centralizada y exponerse como variables CSS equivalentes a `--font-display`, `--font-body`, `--font-mono` y `--font-serif`.

### 4.2 Escala tipográfica

Los tamaños principales deben ser fluidos con `clamp()` para adaptarse al ancho disponible.

| Rol | Familia | Especificación aproximada | Uso |
|---|---|---|---|
| Display / H1 | Gabarito | `clamp(3.6rem, 11.5vw, 9.6rem)`, peso 800, line-height 0.95–1 | Titular principal del hero; mayúsculas y fuerte impacto visual. |
| H2 de sección | Gabarito | `clamp(2.6rem, 6.8vw, 5.6rem)`, peso 800, tracking cercano a `-0.04em` | Títulos de secciones. |
| H3 | Gabarito | `clamp(1.6rem, 3.2vw, 2.4rem)`, peso 700 | Títulos de subsección y contenido destacado. |
| Título de tarjeta | Gabarito | `1.35rem` a `3.4rem`, según componente | Integrantes, servicios, tecnologías y proyectos. |
| Acento editorial | Fraunces | `1.15em` respecto al título o frase | Palabras puntuales en cursiva, no bloques completos. |
| Subtítulo técnico | IBM Plex Mono | `0.8rem`–`1rem`, peso 600–700, uppercase | Índices, roles, meta y etiquetas de sección. |
| Navegación | Source Sans 3 / IBM Plex Mono según componente | `0.9rem`–`1rem`, peso 600–700 | Navegación principal y controles técnicos. |
| Cuerpo | Source Sans 3 | `1.05rem`, line-height `1.6` | Texto general. |
| Descripción de sección | Source Sans 3 | `1.15rem`, line-height `1.6`, ancho máximo `55ch` | Resumen de cada sección. |
| Texto del manifiesto | Source Sans 3 | `clamp(1.35rem, 2.7vw, 2.1rem)`, line-height `1.45` | Declaraciones editoriales de mayor énfasis. |
| Micro / índice | IBM Plex Mono | `0.75rem`–`0.88rem`, normalmente bold | Numeración, etiquetas cortas y metadatos. |

### 4.3 Reglas de lectura

- Gabarito y Source Sans 3 deben sostener la mayor parte de la interfaz.
- IBM Plex Mono se reserva para textos cortos y señales técnicas; no usarla en párrafos.
- Fraunces es un acento visual: usarla con moderación y preferentemente en cursiva.
- El H1 puede ocupar varias líneas en desktop, pero debe ajustarse en mobile sin desbordarse.
- Los párrafos deben mantener un ancho legible, normalmente entre `45ch` y `65ch`.
- Usar line-height de `1.5` a `1.65` en descripciones y párrafos.
- Reservar uppercase para etiquetas, metadatos, roles y titulares que lo requieran.
- Usar tracking negativo en display y tracking positivo moderado en etiquetas monoespaciadas.
- No reducir demasiado el cuerpo para hacer entrar contenido: reorganizar el layout antes de disminuir la legibilidad.
- Los estilos semánticos y de clase, como `.desc` y `.manifiesto-text`, deben conservar la familia tipográfica de su rol; no sobrescribirlos con reglas globales de encabezado o etiquetas.

---

## 5. Layout, grid y espaciado

### 5.1 Contenedor

El contenedor central actual usa `.wrap`:

```css
.wrap {
  max-width: 1380px;
  margin: 0 auto;
  padding: 0 clamp(1.2rem, 4.5vw, 3.5rem);
}
```

- Padding horizontal mínimo aproximado: `1.2rem` (19–20px).
- Padding horizontal fluido en tablet y desktop: `4.5vw`.
- Padding horizontal máximo: `3.5rem` (56px).
- Ancho máximo del contenedor: `1380px`.
- No fijar anchos absolutos para párrafos, títulos o descripciones.
- Mantener la alineación de los encabezados y del contenido de cada sección.

### 5.2 Ritmo vertical

- Microseparación entre etiqueta y título: `8px`–`12px`.
- Separación entre elementos relacionados: `16px`.
- Separación entre grupos de contenido: `24px`–`32px`.
- Separación de encabezado a contenido: aproximadamente `48px`–`77px`, fluida según viewport.
- Padding vertical de sección: `clamp(5rem, 9vw, 8rem)` (aproximadamente 80–128px).
- Padding interno de tarjetas: normalmente `2rem` o más en desktop, reducido en móvil.
- Hero: altura mínima aproximada de la ventana menos el header; padding vertical fluido.
- No agregar separadores decorativos adicionales si la sección ya tiene una línea inferior o un cambio de fondo.

### 5.3 Prioridad de layout

1. Flexbox para navegación, filas, acciones y alineación de contenido.
2. CSS Grid para tarjetas, equipo, tecnologías y vistas de varias columnas.
3. `clamp()` para tipografía, padding y gaps fluidos.
4. `position: absolute` solo para decoración, ilustraciones, fondos y elementos que no definan la estructura.
5. `position: sticky` solo en efectos intencionales, como el apilado de las tarjetas del equipo; debe revisarse en móvil para evitar solapamientos incómodos.
6. Evitar alturas fijas en contenido que puede crecer o cambiar.

### 5.4 Responsive

Breakpoints de referencia presentes o recomendados:

- `640px`: móvil grande / tablet pequeña.
- `768px`: tablet.
- `880px`: ajuste de filas de servicios y componentes similares.
- `1024px`: tablet horizontal / desktop compacto.
- `1100px`: navegación horizontal completa cuando haya espacio.
- `1280px`: desktop amplio.

Comportamiento móvil:

- El hero pasa a una composición vertical.
- Los botones se agrupan y envuelven sin chocar entre sí.
- El texto del hero debe conservar jerarquía sin forzar saltos incómodos.
- Las grids de tarjetas pasan a una columna cuando dos columnas dejan de ser cómodas.
- Las tarjetas del equipo priorizan nombre, rol, descripción y acciones; no deben depender de una ilustración repetida.
- Las etiquetas de servicios se alinean a la izquierda y pueden ocupar varias líneas.
- La navegación de proyectos debe permitir seleccionar un proyecto con controles grandes y claros, sin depender de hover ni de desplazamientos horizontales difíciles.
- Los elementos esenciales no deben ocultarse para conservar la composición.
- Evitar overflow horizontal en el body, títulos, chips y controles.

---

## 6. Arquitectura de la página

La página de Quokka Studio está organizada en secciones visuales que forman un portfolio y una demostración del proyecto. La estructura puede evolucionar, pero no deben eliminarse secciones existentes sin una decisión explícita del equipo.

Secuencia visual actual:

1. **Header y navegación:** marca, acceso a secciones y controles generales.
2. **Hero:** propuesta de valor, titular, descripción y acciones principales.
3. **Manifiesto / presentación:** motivación e identidad del equipo.
4. **Equipo:** tarjetas de integrantes, responsabilidades y datos de perfil.
5. **Servicios:** capacidades y módulos contemplados por el proyecto.
6. **Stack técnico:** tecnologías y arquitectura propuesta.
7. **Proyectos y demos:** tarjetas o vistas de demostración navegables.
8. **Proceso de trabajo:** etapas o sprints del proyecto.
9. **Panel de métricas / gestión:** ejemplo visual de la administración del portfolio; los datos de muestra deben identificarse como ilustrativos.
10. **FAQ y contacto:** preguntas frecuentes y formulario o vías de contacto.
11. **Footer:** cierre visual, enlaces y créditos mínimos.

La organización interna debe conservar una jerarquía semántica clara. Cada sección tiene un identificador único para la navegación y un encabezado reconocible.

### Solapamiento del footer

El cierre contiene un llamado al formulario, navegación en tres columnas,
avatares de muestra, marca recortada y mascota vectorial. Consumir los roles
de la superficie `deep`; nunca fijar el color de la sección anterior.
La entrada escalonada de las letras y la mascota es independiente del rebote
SVG. Con `prefers-reduced-motion: reduce`, ambos quedan en reposo y visibles.
`Footer` recibe `contactHref`, `teamHref`, `homeHref`, `links` y `email` para
adaptarse a la página. El correo y los integrantes actuales son ejemplos.

La sección que precede inmediatamente al footer debe conservar la clase
`footer-predecessor`. Es obligatoria: aumenta su padding inferior para que su
propia superficie continúe detrás del borde animado del footer. La onda puede
invadir ese espacio en ambas direcciones y revelar el color heredado de la
sección, sin codificar su color en el componente. Si falta esta clase, la zona
transparente del solapamiento deja ver el fondo de la página y la animación queda
recortada visualmente. Al cambiar qué sección cierra `<main>`, trasladar la clase
a la nueva sección inmediatamente anterior al footer; no quitarla ni reemplazarla
por un color o margen local.

---

## 7. Componentes

### 7.1 Encabezado de sección

Responsabilidad: presentar índice, etiqueta técnica, título y descripción.

Patrón:

- Índice o etiqueta en IBM Plex Mono.
- Prefijo `//` generado una sola vez, mediante contenido o CSS, nunca ambos.
- Título en Gabarito, con contraste de tamaño respecto de la descripción.
- Descripción en Source Sans 3, con ancho máximo legible.
- Separación inferior consistente antes del contenido.
- Una sola línea divisoria por encabezado; no duplicar líneas con pseudo-elementos y contenido literal.

### 7.2 Logo

- Mantener el nombre **Quokka Studio** como marca principal.
- Puede usarse un pequeño detalle de puntuación o color para darle identidad.
- Evitar sumar un descriptor académico largo junto al logo.
- El logo debe enlazar al inicio cuando se use como parte de la navegación.
- Cualquier animación del logo debe ser breve y respetar `prefers-reduced-motion`.

### 7.3 Navegación

- Usar un `<header>` y un `<nav aria-label="Navegación principal">`.
- La navegación debe permitir acceder a las secciones sin desbordarse.
- Usar estados hover y focus visibles con el color de acento de la vista.
- El header puede tener superficie translúcida si mantiene contraste y legibilidad.
- En móvil, mostrar un menú compacto o controles apilados; no forzar todos los enlaces en una fila.
- La navegación de proyectos es independiente de la navegación global y debe ser más sencilla que un carrusel de controles pequeños.
- No usar solo color para indicar la selección activa.

### 7.4 Botones

El estilo base es compacto, redondeado y con texto claro. El CSS actual usa botones tipo píldora con borde y una transición de relleno.

CTA primario:
- Fondo o relleno del acento activo.
- Texto con contraste alto.
- Una acción primaria clara por bloque.

CTA secundario:
- Fondo transparente.
- Borde visible.
- En hover, cambiar borde, fondo o texto sin perder contraste.

Reglas:

- No colocar demasiados CTA con el mismo peso visual en el hero.
- Agrupar las acciones relacionadas y mantener un gap consistente.
- En el inicio, una acción puede llevar a conocer el equipo y otra a explorar proyectos; no añadir más botones redundantes sin una necesidad clara.
- Todos los botones deben tener estados default, hover, focus-visible y disabled cuando corresponda.
- Usar `<button>` para acciones y `<a>` para navegación; no convertir un `<div>` en botón.
- El foco de teclado debe ser claramente visible.

### 7.5 Tags / chips

Usar para tecnologías, roles breves y metadatos; nunca para párrafos ni para repetir el texto del título.

- Tipografía: IBM Plex Mono o Source Sans 3 según la importancia del dato.
- Texto con contraste alto.
- Fondo sutil basado en el acento de la sección.
- Radio pequeño o medio; evitar mezclar chips rectangulares y píldoras sin un motivo.
- Separación entre chips de aproximadamente `8px`–`10px`.
- Los chips deben envolver a una nueva línea en espacios estrechos.
- En servicios, alinear el grupo a la derecha en desktop si la composición lo permite y a la izquierda en móvil.
- No añadir tags genéricos como “portfolio colaborativo” en el hero si repiten la finalidad ya explicada en el título o la descripción.

### 7.6 Tarjetas de proyectos

Estructura recomendada:

1. Imagen, demo o bloque visual con proporción estable.
2. Metadato breve si ayuda a distinguir el proyecto.
3. Título claro.
4. Descripción breve del problema o propósito.
5. Tecnologías relevantes.
6. Una acción principal para ver detalles o abrir la demo.

Reglas:

- Usar bordes discretos y superficies coherentes con la paleta.
- Evitar decoración innecesaria dentro de cada tarjeta.
- Mantener todo el contenido importante visible sin hover.
- Si una demo requiere iniciar sesión en el sistema real, indicarlo con claridad; no fingir que una vista está protegida si es solo una maqueta.
- Las imágenes informativas necesitan `alt` útil; las decorativas deben usar `alt=""`.
- Los botones y enlaces deben ser utilizables con teclado.
- Los metadatos de autores o tecnologías no deben competir con el título.
- Una tarjeta no debe tener varias acciones primarias.

### 7.7 Tarjetas del equipo

- Usar una estructura común para todos los integrantes.
- Los acentos pueden variar por persona, reutilizando los tres colores de la colección activa; no usar colores fijos por integrante.
- Mostrar nombre, rol o área, descripción y responsabilidades pertinentes.
- Las iniciales grandes pueden usarse como recurso gráfico; no repetir caritas de quokkas en cada tarjeta.
- Aprovechar el espacio para el contenido útil en vez de duplicar elementos decorativos.
- El nombre debe ser el foco principal, el rol el segundo nivel y la biografía el tercero.
- Las etiquetas técnicas deben ser breves y consistentes.
- El apilado sticky debe mantener legibilidad y no impedir el acceso a contenido en móvil.

### 7.8 Servicios y microinteracciones

- Las filas de servicios deben tener un título fuerte, descripción concreta e índice.
- Los tags asociados se presentan como chips con contraste y espaciado consistente.
- La microinteracción puede desplazar ligeramente la fila o cambiar el fondo, pero no debe dificultar la lectura.
- Mantener el efecto hover como mejora, no como única forma de descubrir contenido.
- En dispositivos táctiles, el contenido debe seguir siendo visible sin hover.
- Evitar bordes, rellenos y animaciones simultáneos demasiado intensos.

### 7.9 Stack técnico y paneles

- Las tarjetas tecnológicas usan el mismo sistema de superficie, borde y padding.
- Los nombres de tecnologías se escriben de forma consistente.
- Los paneles de métricas deben diferenciar claramente títulos, números, leyendas y datos de muestra.
- No representar valores ilustrativos como estadísticas reales.
- La tipografía monoespaciada puede usarse en indicadores, tablas, leyendas y etiquetas cortas.
- Los gráficos deben tener leyendas legibles y no depender exclusivamente del color.

### 7.10 Hero visual

El hero combina el fondo profundo de la colección activa, tipografía de gran escala, una cuadrícula sutil y elementos decorativos flotantes.

- El contenedor declara `data-surface="deep"`; `--hero-bg` es un alias del prototipo para el profundo activo.
- El texto usa `--s-fg`; `--hero-ink` es su adaptador en el prototipo.
- La cuadrícula debe tener baja opacidad y no competir con el titular.
- La ilustración o mascota de marca se usa como un elemento protagonista puntual, no como decoración repetida en toda la página.
- Los botones deben agruparse en una zona clara y no quedar dispersos entre el título y la ilustración.
- El texto debe conservar prioridad visual.
- En móvil, la composición se apila y las acciones permanecen cerca del texto que las explica.
- Cualquier animación flotante debe respetar `prefers-reduced-motion`.

---

## 8. Prototipado visual

El prototipo debe ayudar a validar estructura y jerarquía, además del aspecto final.

### 8.1 Wireframe

Objetivo: validar estructura antes de afinar el estilo.

Debe mostrar:

- Header y navegación.
- Hero con titular, descripción y acciones principales.
- Presentación / manifiesto.
- Equipo y responsabilidades.
- Servicios y tecnologías.
- Proyectos y demos.
- Proceso de trabajo, paneles y contacto.
- Bloques neutros para imágenes o ilustraciones.
- Jerarquía de tamaños y agrupación de contenido.

El wireframe no debe depender del color para resolver problemas de estructura. Los botones y selectores deben representarse en ubicaciones reales para evaluar si son cómodos de usar.

### 8.2 Alta fidelidad

Objetivo: validar la experiencia visual que seguirá el sitio.

Debe mostrar:

- Papel cálido o tinta nocturna según el tema.
- Titulares Gabarito con escala fluida.
- Source Sans 3 para lectura.
- IBM Plex Mono para señales técnicas.
- Fraunces solo en acentos editoriales.
- Tarjetas reales con la paleta aprobada.
- CTA claros y con contraste.
- Los tres colores de la colección activa usados con moderación.
- Estados hover, focus y activo.
- Hero con composición editorial y detalle gráfico.
- Versiones desktop y mobile.

### 8.3 Estados y variantes

Si se muestran variantes del mismo componente, el control debe indicar claramente cuál está activo.

- Usar botones accesibles con `aria-pressed` cuando corresponda.
- Mantener el foco en el control activado.
- No depender de navegación de página para alternar estados locales.
- Probar la interacción con teclado y dispositivos táctiles.
- Respetar `prefers-reduced-motion`.
- Los controles de tema deben conservar contraste en ambos temas.

---

## 9. Accesibilidad

Checklist obligatorio para cada sección y componente:

- HTML semántico: `header`, `nav`, `main`, `section`, `article`, `form` y `footer` cuando corresponda.
- Un solo H1 por página.
- Jerarquía de encabezados coherente.
- `alt` útil para imágenes informativas; `alt=""` para elementos decorativos.
- Focus-visible visible en enlaces, botones, tabs y controles.
- No comunicar selección, estado o error solo mediante color.
- Labels visibles o accesibles para todos los campos de formulario.
- Contraste mínimo WCAG AA: 4.5:1 para texto normal y 3:1 para texto grande.
- Estados `aria-expanded`, `aria-controls` y `aria-pressed` cuando correspondan.
- Animaciones reducidas o desactivadas mediante `prefers-reduced-motion`.
- No usar caracteres decorativos como sustitutos de iconos funcionales.
- Controles táctiles suficientemente grandes y separados.
- Ninguna acción esencial debe requerir hover.
- El contenido no debe desbordarse ni quedar oculto por tarjetas sticky.

---

## 10. Reglas de implementación

Antes de modificar la web:

1. Inspeccionar el HTML, CSS y JavaScript existentes.
2. Reutilizar las variables de color y tipografía antes de crear otras nuevas.
3. Preservar todas las secciones existentes salvo que se solicite explícitamente eliminarlas.
4. Actualizar el contenido sin inventar funcionalidades implementadas.
5. Mantener separados los datos de ejemplo y los datos reales.
6. Revisar los estilos específicos de clases como `.desc`, `.manifiesto-text`, `.tag-col` y los componentes del equipo antes de añadir reglas globales.
7. Evitar reglas generales que sobrescriban tipografías específicas de componentes.
8. No duplicar `//` si ya lo agrega un pseudo-elemento CSS.
9. No agregar etiquetas decorativas que repitan el propósito de la sección.
10. Mantener nombres de clases y tokens existentes cuando una sustitución amplia pueda romper componentes.
11. No añadir dependencias ni cambiar de stack sin una razón explícita.
12. No introducir persistencia de navegador como requisito para que la interfaz funcione.

Después de modificar la web:

1. Comprobar que el HTML y JavaScript no tengan errores de sintaxis.
2. Revisar el diseño en desktop y mobile.
3. Probar navegación global y navegación entre proyectos.
4. Comprobar el cambio de tema y los estados interactivos.
5. Revisar los botones del hero y las tarjetas.
6. Confirmar que no se hayan perdido secciones o contenido útil.
7. Verificar contraste, foco de teclado y reducción de movimiento.
8. Comprobar que no haya overflow horizontal.
9. Confirmar que las familias tipográficas específicas sigan aplicándose a las descripciones y al manifiesto.
10. Comparar visualmente el resultado con la versión anterior para detectar regresiones.

---

## 11. Convenciones de código

### CSS y variables

- Componentes nuevos: usar roles `--s-*` mediante Tailwind; `--palette-*` solo en la definición de contextos y el selector.
- Evitar duplicar hexadecimales en múltiples reglas.
- Mantener los nombres de tokens existentes para no romper componentes dependientes.
- Los tokens heredados pueden tener nombres históricos poco literales; documentarlos antes de renombrarlos.
- Mantener las reglas responsive junto al componente o en una sección claramente identificada.
- Preferir `clamp()` para tamaños fluidos.
- Evitar `!important` salvo que exista una razón documentada.

### Componentes y estructura

- Preferir funciones pequeñas y nombres descriptivos.
- Mantener el contenido repetible en estructuras de datos cuando la implementación lo permita.
- Separar estilo, contenido y comportamiento cuando el proyecto migre a componentes.
- No convertir una actualización visual en una reescritura completa de arquitectura.
- Mantener las secciones y los IDs de navegación estables.

### JavaScript e interacciones

- Añadir comportamiento solo cuando exista una acción clara para el usuario.
- No hacer que el contenido dependa de animaciones para ser visible.
- Comprobar estados activos y desactivados.
- Respetar `prefers-reduced-motion`.
- Evitar interacciones que funcionen solo con mouse.
- Identificar los prototipos y simulaciones como tales.

### Imágenes y recursos

- Preferir assets locales o generados que encajen con la identidad visual.
- Definir ratio de aspecto para evitar saltos de layout.
- Proporcionar `alt` según el propósito de cada imagen.
- Evitar placeholders externos permanentes.
- Usar la mascota de marca con moderación para que mantenga valor visual.

---

## 12. Copy y tono

### Voz

- Cercana, directa y segura.
- Frases breves, con información concreta.
- Explicar qué es cada módulo y qué aporta.
- Evitar claims exagerados o lenguaje corporativo vacío.
- No repetir el nombre de la materia en todos los encabezados.
- Usar etiquetas técnicas cuando ayudan a orientarse, no como decoración.
- Mantener una distinción explícita entre funcionalidades previstas, demos ilustrativas y funcionalidades ya desarrolladas.

### Ejemplos de etiquetas

- `// manifiesto`
- `// equipo`
- `// servicios`
- `// stack técnico`
- `// proyectos`
- `// proceso`
- `// contacto`
- `Tecnologías`
- `Explorar proyectos`
- `Conocer al equipo`

### Regla para proyectos

Cada proyecto debe comunicar en este orden:

1. Qué es.
2. Qué problema o necesidad aborda.
3. Qué parte desarrolló o propone el equipo.
4. Qué tecnologías están previstas o se utilizaron realmente.
5. Qué puede hacer el visitante a continuación.

No afirmar que una demo está conectada a una API, base de datos o sistema de autenticación si solo es una representación visual.

---

## 13. Checklist de aceptación

Una nueva sección o actualización cumple el sistema cuando:

- Usa exactamente la colección activa y el contrato de superficies de la sección 3 en ambos modos.
- Respeta los roles tipográficos de Gabarito, Source Sans 3, IBM Plex Mono y Fraunces.
- Tiene jerarquía clara entre etiqueta, título, descripción y contenido.
- Respeta el contenedor `.wrap` y su padding fluido.
- Mantiene un ritmo vertical generoso sin huecos accidentales.
- Funciona en mobile sin overflow horizontal.
- Tiene estados hover, focus y activo.
- Tiene HTML semántico y atributos accesibles apropiados.
- No introduce colores fuera de la paleta sin justificación.
- No repite etiquetas, iconografía o decoración innecesaria.
- Mantiene el prefijo `//` una sola vez por encabezado.
- Conserva las secciones existentes.
- Mantiene la identidad de Quokka Studio sin volverse infantil.
- Distingue prototipos de funcionalidades reales.
- No introduce una estética incompatible con el resto de la página.
- Conserva el contenido de `.desc`, `.manifiesto-text` y otros componentes con sus estilos tipográficos específicos.

---

## 14. Estructura actual de archivos

El prototipo es un HTML autocontenido. La aplicación React/Next.js se está construyendo en `frontend/`, con `app/globals.css`, `components/section.jsx` y `components/ui/button.jsx`.

Al migrar a una aplicación por componentes, una estructura orientativa podría ser:

```text
app/
  layout.tsx
  page.tsx
  globals.css
components/
  site-header.tsx
  hero.tsx
  manifesto.tsx
  team.tsx
  services.tsx
  tech-stack.tsx
  projects.tsx
  workflow.tsx
  dashboard-preview.tsx
  faq.tsx
  contact.tsx
  site-footer.tsx
lib/
  design-tokens.ts
  portfolio-data.ts
public/
  images/
```

Esta estructura es una propuesta de organización futura, no una descripción de archivos que ya existan en el HTML actual.

---

## 15. Resumen operativo

Al crear o modificar cualquier componente de Quokka Studio:

> Fondo papel cálido o tinta nocturna; Gabarito para titulares; Source Sans 3 para lectura; IBM Plex Mono para metadatos técnicos; Fraunces como acento editorial; colección activa de siete colores, contexto `data-surface` y roles heredados en cada componente; espacio negativo generoso; botones claros; tarjetas coherentes; navegación cómoda en desktop y mobile; accesibilidad y microinteracciones moderadas.

Este manual reemplaza la dirección visual anterior basada en una estética oscura violeta/cian. La referencia visual actual es el sistema implementado en `Quokka.html`.

---

**Fin del Manual de Diseño y Estilo — v3.0**

### Menú de navegación (`SiteMenu`)

**Posición y estilo unificados vigentes:** ambos paneles flotan por encima del Navbar, desde el margen superior del viewport (0.75rem). Se elimina la reserva de alto de Navbar para recuperar espacio móvil; la X es el cierre principal. El morphing de navegación sigue recortado debajo de Navbar, independientemente de la posición de los paneles. `side-panel` comparte padding, borde, radio, Source Sans 3 y superficie page entre navegación principal y paleta. Titulares/enlaces usan peso 800 y espaciado -0.03em; metadatos usan Geist Mono. Las tarjetas de cuenta y proyecto conservan sus contextos card/deep. Se preservan las revelaciones de texto, líneas y hover de Claude, y los tiempos de entrada/caída existentes. Navbar no mide ya su alto para colocar los paneles. Sus accesos reutilizan Button secondary sin magnetismo, con iconos y `iconOnlyOnMobile`. Esta prop oculta visualmente la etiqueta hasta 700px, manteniendo su nombre accesible y un área de 2.75rem; si falta icono se conserva el texto. No se introduce estado de viewport ni otro componente de botón. Estas normas reemplazan las indicaciones anteriores de colocar los paneles debajo de la barra y del peso 650.

**Selector de paleta actual:** `palette-panel.jsx` recupera el selector de Quokka.html: dos modos, seis colecciones, previews, nombre e historia animados y tira de siete colores con nombres evocadores por hover, foco o toque. Los nombres y previews cambian según modo (incluido sistema); la tira activa consume tokens CSS. `lib/palettes.js` conserva el contenido original y colores de preview, sin modificar el contrato de roles. El panel reutiliza Section y Button sin magnetismo para cerrar. Se coloca arriba a la derecha, debajo de Navbar, con exactamente la columna de SiteMenu (42rem/55vw, ancho disponible móvil), altura natural y scroll en pantallas cortas. Entrada lateral 0.65 s power3.out; salida 0.08 s de espera + 0.42 s power2.in, giro 9° y diagonal para salir entero. No usa morphing. Navbar recibe tema, modo y callbacks; coordina refs close() que resuelven al terminar la salida, esperando el cierre del panel anterior antes de abrir el siguiente. Solicitudes antiguas se descartan al alternar rápido. Menú y paleta nunca están abiertos juntos. Se elimina el popover de prueba anterior; Escape, clic exterior y movimiento reducido siguen disponibles.

**Tiempos finales:** morphing completo de 0.9 s; espera antes de la caída de 0.08 s, caída de 0.42 s y desfase de 0.035 s por panel (cierre completo: 0.57 s). Reemplazan los 0.65 s de morphing y los 0.16 s de espera anteriores. Se conservan los disparadores, las dos capas y la posición bajo Navbar.

**Ajuste vigente de duración y disparadores:** la timeline completa de las dos capas se comprime a 0.65 s, conservando las proporciones del algoritmo original. Ese tiempo coincide con la salida completa del menú (0.16 s de espera + 0.42 s de caída + 0.07 s de desfase final). SOLO elegir un enlace de sección en SiteMenu dispara el morphing, simultáneamente con la caída. La X, Escape, el disparador y clic exterior cierran sin cubierta. Navbar mide su propio alto con ResizeObserver y lo transmite mediante `--navbar-height`: el dialog comienza debajo de la barra y usa el alto restante. Cada apertura desde cerrado reinicia scrollTop para mostrar siempre el encabezado del menú. Estas reglas reemplazan toda indicación anterior de mostrar morphing al cerrar sin navegar o de conservar los tiempos originales sin compresión.

**Morphing actual (reemplaza la onda prefijada anterior):** se adapta el algoritmo original de GSAP/Blake Bowen, https://codepen.io/GreenSock/pen/qBedXpg. Diez alturas animadas generan el borde mediante curvas cúbicas; duración 0.9 s, power2.inOut, retrasos aleatorios de hasta 0.3 s por punto compartidos entre capas y desfase de 0.25 s entre capas. La salida invierte su orden. Se usan dos colores sólidos de la colección activa (color-2 y color-1), sin gradientes externos. No requiere MorphSVGPlugin. La transición empieza en el mismo evento que el cierre del menú, también al cerrar sin destino; el desplazamiento y foco solo cambian bajo cobertura total si se eligió una sección. Reabrir cancela la animación y la navegación pendiente. Navbar permanece por encima (z-index 1200); la cubierta usa 1100 y ocupa solamente el área bajo su borde inferior, medido con ResizeObserver y al redimensionar. El scroll natural no activa el efecto. Movimiento reducido mantiene navegación directa sin espera ni cubierta. La entrada y caída del menú conservan sus propios tiempos.

**Transición de navegación implementada:** `section-transition.jsx` expone `play(onCovered)` mediante ref y usa MorphSVGPlugin, registrado en `lib/gsap.js`. Solo SiteMenu la invoca después de cerrar sus paneles y al elegir otro destino. Una onda asciende desde abajo (0.60 s), cubre todo el viewport, ejecuta el cambio de hash/foco/scroll y se retira hacia arriba (0.60 s, pausa central 0.06 s). Los controles SVG usan un viewBox proporcional que mantiene la cobertura al redimensionar. No se activa por scroll, enlaces normales, historial ni al cerrar sin navegar. Elegir la sección actual navega directamente. La capa usa un portal en body con Section primary, sin colores HEX; queda por encima del cursor. Bloquea interacción y desplazamiento únicamente mientras cubre/revela la página. Una sola timeline evita transiciones simultáneas; prefers-reduced-motion navega directamente y cambiar esa preferencia durante la animación la completa y libera la capa. Desmontar cancela y limpia listeners sin ejecutar navegación pendiente. Estas reglas reemplazan las menciones anteriores al morphing pendiente.

**Separación actual:** `frontend/components/navbar.jsx` contiene marca, PalettePanel y SiteMenu. Recibe `items`, `theme`, `mode`, `onThemeChange` y `onModeChange`; la página mantiene el estado de apariencia. Navbar coordina que los paneles no se abran simultáneamente y pasa su ref al morphing para medir el recorte, sin consultas globales por clase. SiteMenu administra disparador, foco y paneles animados. La posición sticky corresponde a Navbar. Los enlaces usan Source Sans 3 con peso 800, sin subrayado en reposo, ubicación actual ni hover; se conserva `aria-current`, el foco visible y las animaciones de entrada y hover. Estas reglas reemplazan las menciones anteriores a otros pesos y al subrayado.

- `frontend/components/site-menu.jsx` recibe `items: [{ href: "#id", label: "Nombre" }]`. Los destinos deben existir y tener `tabIndex={-1}` para recibir el foco al navegar. La lista temporal de la página de pruebas se reemplaza por las secciones reales al integrarlo.
- La barra permanece accesible al recorrer la página. El menú usa un dialog no modal (show, nunca showModal): no hay backdrop de color, contenido inerte ni bloqueo de scroll. La capa transparente deja pasar eventos fuera de los paneles. Tab continúa por la página; Escape y clic exterior inician el cierre sin consumir el clic.
- El menú ocupa el lateral derecho (máximo 31rem, 44vw en escritorio; 92vw en móvil). Paneles apilados con radio de 0.5rem y separación de 1rem. Enlaces y frase destacada usan Fraunces, ya definida en el diseño y cargada mediante next/font. Entrada desde la derecha de 0.65 s con desfase de 0.075 s y power3.out. Salida con un rebote preparatorio de 12px hacia arriba (0.075 s y desfase de 0.015 s), seguido de caída de 0.29 s con desfase de 0.025 s, power2.in y rotaciones de 9°, -12° y 7°. Interrumpir conserva la posición visual actual y cancela el tween anterior.
- El fondo conserva su scroll e interacción durante toda la animación. Cerrar devuelve el foco al disparador solo si seguía dentro del menú; elegir un enlace espera la salida, actualiza el hash, desplaza al destino y le da foco.
- Los paneles de navegación y preferencias establecen contextos `page` y `card` mediante Section. No contienen colores por tema ni gradientes nuevos. En móvil se apilan y el diálogo puede desplazarse si no entra en el viewport.
- La salida mide cada panel y añade su diagonal para que la rotación tampoco deje esquinas visibles. No hay recorte en el contenedor de paneles: solo en el viewport. El diálogo permanece abierto hasta completar la caída del último panel. prefers-reduced-motion omite el movimiento. useGSAP limpia transformaciones y callbacks; el desmontaje también cierra el diálogo y retira los listeners del documento.
- El morphing NO está implementado en esta etapa. Se incorporará solamente al seleccionar una sección desde el menú; nunca al atravesar secciones mediante el scroll natural.

#### Composición actual del menú

La referencia visual es `menu_bloques_propuesta.html`: se adaptan sus bloques a la columna existente, siempre navegación → cuenta → proyecto. Radios de tarjeta del sistema, líneas horizontales entre enlaces (sin cajas, flechas ni numeración), título monoespaciado, Source Sans 3 en enlaces y cierre circular con borde. No mostrar «Sección actual». La cuenta incorpora un indicador circular discontinuo, descripción y etiquetas informativas; sus dos Button siguen siendo una plantilla sin acciones. El bloque del proyecto incluye cinco siluetas decorativas superpuestas y GitHub real, sin inventar iniciales, correo ni una mascota provisional. Cada bloque conserva su Section y sus colores contextuales; los círculos utilizan exclusivamente colores de la colección activa. No copiar colores HEX de la referencia ni su distribución inferior en dos columnas. Se conservan entrada lateral, caída al cerrar y scroll libre.

- Tres Section apiladas: navegación en primary; plantilla de cuenta en card; información del proyecto en deep. Columna de hasta 42rem / 55vw en escritorio, ancho disponible en móvil y altura mínima de viewport menos márgenes. Bordes uniformes de 1px y separación de 1rem.
- Enlaces libres, sin números, cajas, bordes ni flechas. Source Sans 3, peso 500; ubicación actual y hover se distinguen con subrayado. El foco mantiene su contorno accesible. La X de cierre es un control nativo de icono con aria-label; los enlaces de navegación son anclas nativas.
- Iniciar sesión y Crear cuenta reutilizan Button (tamaño sm), dentro de Section card, en dos columnas iguales que pasan a una en pantallas muy estrechas. Por pedido del grupo son una plantilla: por ahora no ejecutan acciones ni navegan a rutas inexistentes. Conectar autenticación cuando esté disponible.
- El panel informativo muestra Quokka, Lenguajes IV, descripción breve y enlace al repositorio real https://github.com/BautistaGenovese/Quokka. No agrega eslóganes decorativos.
- La salida es caída directa desde el reposo, sin movimiento preparatorio hacia arriba ni rebote: 0.42 s, desfase 0.035 s, power2.in; conserva rotaciones por panel y cálculo de distancia hasta salir completo del viewport. La entrada lateral y el scroll libre se mantienen.
- La paleta continúa en su botón independiente en la cabecera, mediante PalettePanel y un dialog no modal sincronizado con el estado de la página; Navbar coordina la exclusión con SiteMenu.

#### Interacciones del menú actualizadas

Los enlaces conservan la animación de la propuesta: texto revelado desde abajo (0.7 s, expo.out, desfase 0.07 s) y separadores dibujados desde la izquierda; en hover los demás enlaces se atenúan y aparece la descripción disponible. Una única timeline GSAP coordina la entrada para poder interrumpirla. Cerrar y GitHub reutilizan Button secondary con magnetic={false}; los dos botones de cuenta también desactivan magnetismo. El cierre espera 0.16 s antes de la caída directa; reabrir cancela esa espera. Movimiento reducido omite animaciones y espera. Estas reglas reemplazan las menciones anteriores al cierre nativo y la caída inmediata.

### Texto de carga de Button

Button anima los cambios entre children y loadingLabel mediante TextPlugin de GSAP (0,45 s), en ambos sentidos. El componente ButtonLabel separa el texto accesible completo de la copia visual animada y reserva espacio para ambas etiquetas. No animar JSX ni iconos como texto. loading bloquea los clics inmediatamente y mantiene aria-busy; la duración de la petición pertenece al consumidor. Interrumpir la animación anterior ante cambios rápidos y limpiar al desmontar. Con prefers-reduced-motion, reemplazar el texto inmediatamente, también si la preferencia cambia durante la animación. Mantener este efecto separado de los transforms de magnetismo y presión.


Actualización de carga: Button admite status=idle/loading/success/error y conserva loading como alias compatible. successLabel y errorLabel personalizan los mensajes finales (¡Enviado! y ¡Error!). El reemplazo dura 0,9 s; durante loading los puntos avanzan cada 0,5 s en un ciclo de cero a tres, sin spinner. La preferencia de movimiento reducido muestra tres puntos estáticos. El consumidor controla el resultado y el reinicio; éxito/error permiten volver a interactuar, salvo disabled explícito. Se cancelan el reemplazo y el ciclo al cambiar de estado o desmontar. Esta regla reemplaza los tiempos anteriores de texto de carga.


El estado error de Button usa los roles semánticos globales --status-error y --status-on-error (bg-error/text-on-error), independientes de la paleta y con versiones light-dark. Es una excepción semántica a los siete colores decorativos. loading/disabled deben devolver cuerpo, giro, escala y contenido al reposo, incluso si se activan durante el magnetismo.


### Cards reutilizables

Card (components/ui/card.jsx) es un contenedor article con children, surface (card por defecto), tilt (false por defecto), className de layout y atributos HTML. Reutiliza Section para establecer todos los roles cromáticos; no recibe HEX ni conoce datos de negocio. El marco exterior permanece inmóvil y aporta perspectiva; GSAP rota únicamente el panel interior hasta 6 grados y limpia eventos/tweens al cambiar tilt o desmontar. Desactivar inclinación en táctil, movimiento reducido y mientras el foco o el puntero interactúan con un control interno. No anidar enlaces alrededor de botones ni hacer clicable todo el article.

ProjectCard compone preview, title, description, technologies, demoHref y codeHref; TeamCard compone name, role, description, portrait y profileHref, con iniciales si falta retrato; SkillCard compone title, description, icon y tags. Proyecto y equipo usan tilt=true por defecto; habilidad es estática. URLs opcionales: omitir acciones sin destino. Los botones internos reutilizan Button sin magnetismo, y mantienen el color contextual. Cada card vincula su encabezado con aria-labelledby y useId; iconos y previews decorativos no duplican la información accesible. Estas cards pueden integrarse luego en un slider sin incorporar navegación o lógica de carrusel a la base.


Relieve del contenido: las cards con tilt=true usan transform-style:preserve-3d en el panel y cada contenedor intermedio card-content. data-card-depth=title/body/detail adelanta texto 48/24/12 px respectivamente; las acciones permanecen en el plano base. No aplicar overflow:hidden, filtros u opacidad al panel o contenedores intermedios porque aplanan el espacio 3D. Recortar únicamente previews y retratos con sus bordes propios. El relieve comparte las condiciones de accesibilidad del tilt y se desactiva si tilt=false, en táctil o con movimiento reducido. No cambia el layout de las variantes.


Ajuste de relieve y espaciado: todos los textos marcados data-card-depth comparten un único plano translateZ(32px), reemplazando los anteriores niveles de 48/24/12 px. Las etiquetas title/body/detail identifican contenido, no profundidad. Los cuerpos de ProjectCard, TeamCard y SkillCard usan padding de 2rem en móvil y 2,5rem desde sm para que el texto adelantado conserve margen respecto del borde.


Tipografía de las cards: encabezados, subtítulos y categorías en Source Sans 3 peso 800 (font-body font-extrabold); descripciones en Source Sans 3 peso 400 (font-body font-normal); pills en Geist Mono peso 600, dentro del rango 500–700 (font-pill font-semibold). Fraunces se reserva para acentos editoriales: nombre de proyecto/demo y las iniciales del retrato. font-pill referencia --font-geist-mono ya cargada por next/font. Esta jerarquía reemplaza la tipografía anterior de las cards.


Distribución por variante: TeamCard es horizontal desde sm, con retrato a la izquierda e información a la derecha; en móvil se apila. SkillCard agrupa icono y encabezado en una fila y descripción/pills debajo, sin espacio de relleno artificial. ProjectCard conserva preview superior y lectura vertical. La sección decide los anchos mediante layout externo; no igualar alturas entre variantes distintas ni fijar alturas del contenido. El ejemplo usa proyecto a la izquierda y equipo/habilidad apilados a la derecha en escritorio; en pantallas menores quedan en una columna. Mantener card-content en contenedores intermedios para preservar el relieve.


Intensidad actual del tilt: máximo de 8 grados por eje (reemplaza los 6 grados anteriores), conservando retorno de 0,35 s y relieve de texto de 32 px.


### Slider de cards

CardSlider recibe children (cards con tilt=false), label y className. GSAP anima una posición continua y wrap redistribuye los elementos sin duplicar DOM/IDs. Draggable usa un proxy, permite scroll vertical en táctil y no captura enlaces/botones. Navegación circular por arrastre, controles Button secundarios sin magnetismo y flechas de teclado al enfocar la ventana. No hay autoplay ni secuestro del scroll de la página. Solo la diapositiva central es accesible/interactiva (inert y aria-hidden en las demás); el contador anuncia el índice al finalizar. ResizeObserver recalcula paso y altura con cambios de tamaño o contenido. Movimiento reducido elimina la transición. Limpiar observers, tweens, Draggable y listeners al desmontar. Con cero cards no se renderiza; con una se deshabilitan los controles y el arrastre.


Las cards del slider pueden usar tilt=true (por defecto en ProjectCard): el slider traslada el wrapper exterior y Card rota su panel interior. Esto reemplaza la recomendación anterior de tilt=false. Se conserva el relieve uniforme de texto de 32 px, el retorno suave y la desactivación en táctil/movimiento reducido. Solo la card central interactiva recibe el tilt; las laterales permanecen inert.


Slider: sin contador visual. Las cards mantienen opacidad 1; la central usa escala 1 y las laterales bajan suavemente hasta 0,9 mediante una curva coseno; entran y salen por los bordes del viewport, sin fade ni desaparición dentro de la ventana. El escaparate de demos ocupa el ancho completo de la ventana, con encabezado independiente dentro de su contenedor. Paso = máximo entre ancho de card +48 px y (ancho de viewport + ancho de card +96 px) / cantidad de cards: el salto circular queda fuera de pantalla incluso con pocas cards o ventanas muy anchas. Draggable usa InertiaPlugin y snap para conservar impulso y frenar alineando una card. Permitir interrumpir el impulso al volver a sujetar o usar flechas. Con movimiento reducido no hay inercia. El tilt se neutraliza durante el arrastre.


### Inputs, Textarea y Tooltip

Input y Textarea comparten FormField y el diseño Aire: etiqueta flotante a la izquierda sobre el borde superior al enfocar, tener contenido o mostrar error. Label en Source Sans 3 600 y contenido en 400. Foco mediante cambio de color del propio borde, sin aro exterior ni desplazamiento del control. Iconos FieldIcon con MorphSVG: reposo según el tipo, lápiz al enfocar y X ante error (prioridad sobre foco). FieldBorder interpola en 420 ms entre reposo recto, foco senoidal suave de 2 px y error serrado de 3,5 px (prioridad sobre foco). La onda recorre todo el perímetro, incluidas las esquinas, sin reiniciar su fase al cambiar de estado; el área de escritura nativa permanece estable. Campo y label usan --s-bg y --s-fg de la sección más cercana. El ticker se pausa fuera de pantalla o con la pestaña oculta. ResizeObserver adapta el borde al tamaño real; la etiqueta tapa su tramo superior. Error consume el rojo semántico independiente de paleta y adaptado a claro/oscuro. Movimiento reducido cambia estados inmediatamente; forced-colors usa borde y foco del sistema. Textarea permite resize vertical entre 7rem y 15rem y scroll interno. readonly permite copiar; disabled atenúa y bloquea.

Props compartidas: label, icon (person/mail/message/text o false), labelAccessory debajo del campo, description, error, wrapperClassName para layout y className del control. Aceptan atributos/ref nativos, handlers de foco/blur, valores controlados o FormData. Generar IDs con useId y conectar label, ayuda y error por htmlFor/aria-describedby, conservando IDs externos; aria-invalid ante error. Consumir roles de Section, sin colores de una paleta concreta. La validación y el foco del primer error pertenecen al consumidor. Los estilos definitivos viven en frontend/app/fields.css; eliminar los estilos y componentes de propuestas descartadas.

Select comparte FormField y el borde Aire, siempre con etiqueta flotante. Radix Select gestiona la lista accesible, teclado, búsqueda por letras, foco, FormData y reset. Recibe children option/optgroup, value/onValueChange o defaultValue; ref al trigger. El menú GSAP sigue el dropdown de easeReverse: panel desde scale 0.7/yPercent -30 con elastic.out(1.2,0.3), opciones desde x=-20 escalonadas con back.out(3), salida reverse a 2.5x con power3.out/power2.out. Timeline de 1 s, Presence conserva 400 ms para cerrar sin cortes. Sin Portal para heredar colores; evitar clipping. Movimiento reducido salta al estado final. Checkbox y RadioGroup comparten ChoiceField: controles nativos con marca decorativa animada y foco visible, sin magnetismo. Casillas para decisiones independientes; radios dentro de fieldset/legend para una opción entre varias. Mantener checked/onChange o defaultChecked, value/onValueChange o defaultValue en RadioGroup, name, required, disabled, ref y FormData. No duplicar estado nativo para animar. RadioGroup genera un name único si se omite; el consumidor aporta valores de opción únicos. Alto contraste conserva el control del sistema; movimiento reducido elimina transiciones.

Tooltip ofrece content, label accesible, side, variant, magnetic, children como contenido del activador y open/onOpenChange o defaultOpen. Reutiliza Button y su magnetismo; el contenido se ancla al wrapper inmóvil. Por abrirse al clic/tacto/Enter/Espacio usa Popover de Radix, sin apertura automática al hover. Cierra al pulsar de nuevo, con la X, Escape o clic fuera; respeta gestión de foco y colisiones de Radix. Solo mensajes breves, nunca instrucciones esenciales ni contenido interactivo aportado por el consumidor. Content sin Portal hereda el contexto real de la sección (evitar contenedores que recorten). Activador ? compacto de 32 px mediante CSS local; símbolo de 1.6rem/700 y burbuja sin triángulo. Reutilizar Button sin copiar su lógica ni añadir variantes globales por este caso. Entrada de 300 ms y salida de 120 ms con Presence. Movimiento reducido elimina animaciones. ContactFormDemo usa Input/Textarea/Select/RadioGroup/Checkbox: valida campos requeridos, permite provocar y corregir errores y reiniciar; no almacena ni transmite datos.


### Marquee entre secciones

Panel superior opcional mediante showControls, false por defecto. Sin panel visible, mantener la pausa accesible para lectores de pantalla y revelarla al recibir foco de teclado. Medir el ancho natural del grupo de frases y renderizar al menos ceil(ancho de ventana / ancho de grupo) + 1 copias. No estirar grupos con min-width ni repartir espacio vacío entre frases; envolver el desplazamiento por el ancho natural de un grupo.

Tamaños predefinidos mediante size: sm para tiras compactas, md por defecto para separadores habituales y lg para momentos protagonistas (el tamaño grande original). Cada tamaño coordina tipografía, padding y separación, con escalas responsive; también se respeta en movimiento reducido. El tamaño no modifica la velocidad ni el comportamiento del loop. No fijar alturas por instancia.

Marquee es un separador de texto reutilizable que hereda --s-bg/--s-fg/--s-action de Section, sin decidir su propia paleta. Source Sans 3 800 para las frases principales, Fraunces en frases alternadas y Geist Mono 600-700 para controles/separadores. No ocupa una pantalla completa ni bloquea el scroll.

Props: items (strings), speed (px/s, 70 por defecto), direction (left/right), followScroll (true), pauseOnHover (true), label y className. direction define el sentido inicial y al bajar; al subir se invierte con una transición de velocidad de 500 ms. El loop repite grupos idénticos para cubrir la ventana y usa posición modular sobre el ancho de un grupo; no debe verse un reinicio. Medir al redimensionar o cargar fuentes y conservar el progreso relativo. Pausa manual independiente por instancia mediante Button sin magnetismo; hover pausa solo con mouse, nunca persiste por un toque.

Copias visuales aria-hidden y un único texto accesible. Con prefers-reduced-motion mostrar el contenido completo, quieto y con salto de línea, sin control de pausa innecesario. Pausar ticker fuera de pantalla y en pestaña oculta. Limpiar observers, listeners, tween de dirección, ticker y ScrollTrigger al desmontar. No modificar defaults de GSAP ni interceptar wheel/touch. Componentes y estilos: ui/marquee.jsx, hooks/use-marquee-motion.js y app/marquee.css.

### Cards de demos: vista previa protagonista

DemoCard es una variante visual de Card, distinta de ProjectCard. Preview grande
16:10 con esquinas suaves y recorte cover, sin bandas. Título en Source Sans 3
600 y acceso con Button secundario sin magnetismo, dentro de la imagen sobre
un panel oscuro deep con backdrop blur. En reposo mostrar solo título/acceso;
Su fondo se extiende 3rem sobre la imagen y enmascara gradualmente tanto la
oscuridad como el desenfoque para evitar un borde superior visible.
al hacer hover o foco el panel crece hacia arriba y revela una descripción
breve en Source Sans 3 400. En táctil mostrar también la descripción. Respetar
movimiento reducido. Sin categorías ni pills. Preview es un slot; no
conoce URLs de captura ni carga el sitio externo. Las capturas actuales viven
en public/previews y deberán actualizarse al completar los sitios reales.
Conservar el tilt de Card y el carrusel horizontal con inercia. El ancho es
responsabilidad del layout demo-showcase; no cambiar dimensiones de otras cards.

DemoPreview aplica ondas y separación RGB con WebGL nativo, impulsadas por la
velocidad horizontal de CardSlider (arrastre, inercia y flechas). Un canal por
slider comunica esa velocidad sin renders React por frame. Retirada de 650 ms;
no mantener un ticker permanente. Sin WebGL o con movimiento reducido, usar
la imagen normal con el mismo cover. No permitir drag nativo de imágenes.
Limpiar suscripciones, observers, tweens y recursos WebGL al desmontar. Pausar
fuera de pantalla y con pestaña oculta. Referencia: GreenSock/EaVbXeM.


Estado bloqueado de DemoCard: locked=true omite el slot preview, nombre,
descripción y enlace reales. Mostrar únicamente contenido genérico de acceso
para miembros, un candado y una textura abstracta sin datos de ningún proyecto.
Reutilizar DemoPreview y el mismo shader para la textura locked.svg; integrar
sus tonos neutros con la superficie mediante luminosidad. La decisión de acceso
pertenece al consumidor. El botón Registrarse (prueba) del laboratorio alterna
las vistas con estado local; no crea cuentas ni representa autenticación real.
Al integrar registro, validar acceso y entrega de datos en el servidor.


Tipografía de Button: Source Sans 3, peso 600, letter-spacing 0 y line-height 1.1. Referencia md: 1.5rem; sm: 1.333333rem; lg: 1.666667rem. Los tres tamaños conservan sus paddings y la proporción tipográfica previa entre tamaños. Las previews de DemoCard usan un clip-path redondeado además de overflow para recortar también el shader durante la inclinación 3D.


## Movimiento unificado (norma vigente)

Esta sección reemplaza las intensidades por defecto descriptas en iteraciones anteriores. Conservamos el laboratorio en / y evaluamos la convivencia en /experiencia, que es una composición de prueba, no el sitio definitivo ni un sistema de cuentas.

Tres niveles: respuesta funcional (foco, clic, carga, error), interacción expresiva (atracción/profundidad cuando se interactúa) y momentos protagonistas (shader de demos, morphing al navegar desde el menú). Dentro de una interacción hay un efecto principal y los demás acompañan. Evitar acumular loops decorativos visibles. No animar texto mientras debe leerse ni mover un campo mientras se escribe.

Button y Card aceptan motion="subtle" (por defecto) o motion="expressive". En Button, subtle usa strength 0.12 y giro 2 grados con retorno discreto; expressive conserva strength 0.28, giro 7 grados y retorno elástico. strength y maxRotation explícitos prevalecen sobre el preset; magnetic=false conserva clic, foco y relleno pero anula la atracción. Reservar expressive para una acción destacada por bloque. Navbar, cierres, registro, acciones del carrusel y formularios utilitarios no necesitan magnetismo. Tooltip usa subtle y conserva la opción magnetic.

Card sigue opt-in mediante tilt; si está activo usa 4 grados en subtle y 8 en expressive. ProjectCard/TeamCard/DemoCard conservan sus propias proporciones y la profundidad uniforme del texto. El slider mueve su wrapper; la card mueve su panel: no compartir el transform entre ambos. En demos el shader y la inercia protagonizan; el tilt es discreto y se neutraliza al arrastrar. data-cursor-quiet="true" evita la bolita decorativa sobre las previews, conservando el cursor nativo y el relleno de los botones internos.

FieldBorder conserva onda de foco y borde irregular de error. Su fase recorre el borde durante 1.2 segundos al cambiar de estado y luego se estabiliza, manteniendo forma, color y mensaje hasta que cambie el estado. No hay un ticker permanente mientras se escribe. Se detiene fuera de pantalla, con pestaña oculta o movimiento reducido. Los iconos y labels comparten una transición breve; las opciones conservan la entrada escalonada y el cierre reversible con un rebote moderado.

MOTION y BUTTON_MOTION viven en frontend/lib/gsap.js. CSS usa los equivalentes de frontend/app/motion.css para respuestas (240 ms), cambios (360 ms), entradas (550 ms) y salidas (180 ms). No imponer un mismo tiempo a todas las animaciones: paneles, reemplazo de texto y shader conservan presets propios porque cumplen funciones distintas. No introducir defaults globales de GSAP. Las constantes geométricas de un efecto específico permanecen junto a ese efecto.

Menú y paleta comparten preparePanelEntry/enterPanels/dropPanels en frontend/lib/panel-motion.js. Estado, foco, promesas de cierre y navegación siguen en cada componente. Se conservan entrada por derecha, caída con pausa de 80 ms, animaciones de enlaces y exclusión mutua. Morphing sigue exclusivamente al navegar por un enlace del menú, nunca al cerrar ni al scrollear naturalmente.

Reveal es un wrapper opcional para entradas únicas de 18 px; no debe envolver cada palabra ni aplicarse a todos los controles. No ocultar contenido por CSS esperando JavaScript. La vista /experiencia usa una acción expresiva en el inicio, cards discretas, el carrusel como momento protagonista y un único marquee pequeño a 32 px/s. El laboratorio mantiene variantes intensas para comparar; no copiar toda esa concentración al sitio final.

React controla contenido y estados; CSS, superficies/colores; GSAP, transforms y secuencias. useGSAP + contextSafe limpian animaciones creadas en callbacks. Desmontar cancela listeners, observers, timers y tweens del componente. Respetar teclado, táctil y prefers-reduced-motion; los efectos nunca son necesarios para acceder al contenido. Mantener estos contratos al incorporar componentes nuevos.

Navbar (norma vigente): frontend/components/navbar.jsx + app/navbar.css. Cabecera simplificada: marca y únicamente Paleta/Menú. El acceso a cuenta vive en el menú; no hay Ingresar duplicado ni enlaces centrales. Ambos activadores reutilizan Button secondary sin magnetismo, 6.5rem x 2.6rem, Source Sans 3 .9rem/600, espaciado 0, iconos animados de 18px a la derecha. Por debajo de 640px ambos muestran solo el icono en un botón cuadrado con mínimo táctil de 44px, conservando su nombre accesible. items corresponde exclusivamente a los destinos del menú; homeHref define el inicio.

useNavbarMotion coordina una vuelta de la mascota durante todo el documento, el progreso superior y el ocultamiento gradual al bajar. Al subir revela la cabecera; cerca del inicio, con panel abierto o foco de teclado permanece visible. La barra de progreso vive fuera del header y permanece arriba al ocultarse este. Se anima top, nunca transform ni opacity del header: sus dialogs fixed no deben cambiar de containing block ni desaparecer con él. El blur sigue en ::before. La animación de hover del SVG y el giro de scroll usan nodos distintos. Movimiento reducido conserva progreso funcional y cabecera visible, sin giro. El hook limpia observadores, listeners, frame pendiente y contexto GSAP.

La mascota es una ilustración de identidad: --quokka-fur y --quokka-muzzle conservan los colores naturales del dibujo original en ambos modos. Esta excepción de marca evita que un fondo nocturno convierta el hocico en una mancha negra; no agrega colores de uso general para botones, secciones o formularios. La navegación sigue exclusivamente en SiteMenu, con sección activa, morphing, exclusión mutua con Paleta y sus animaciones existentes.

## Página de pruebas del portfolio

La ruta / es ahora la página principal de pruebas con contenido del portfolio. /experiencia conserva acceso al mismo componente, frontend/components/portfolio-preview.jsx. El laboratorio anterior se mantiene en /componentes. Quokka.html sigue como referencia histórica.

El contenido vive en frontend/lib/site-content.js. TEAM contiene Bautista Genovese, Juan Girón, Lautaro Jándula, Ignacio Giangrieco y Micaías Villa, con responsabilidades extraídas de la bitácora del proyecto (Sprint 2). No inventar fotos, experiencia profesional, correos o perfiles de compañeros. TeamCard usa iniciales si no hay retrato. TeamAvatars consume esos mismos datos y permite sustituir members.

Secciones actuales: inicio, manifiesto, equipo, servicios, stack-tech, proyectos y contacto. Se componen con Section, Reveal, TeamCard, SkillCard, DemoCard, DemoPreview, CardSlider, Marquee y la UI de formularios existente. SkillCard admite eyebrow para rotular Servicio/Tecnología sin duplicar componentes. Se omiten timeline, estadísticas, paneles y FAQ hasta contar con sus componentes. La mascota original de Quokka.html vive en public/quokka-hero.webp.

PROJECTS conserva cuatro propuestas del prototipo, identificadas como en desarrollo. Sus imágenes SVG son maquetas ilustrativas, no capturas de aplicaciones publicadas. No agregar demoHref hasta tener un destino verdadero. El control Registrarse (prueba) es solo una comparación local del estado locked; no representa autenticación ni seguridad del servidor.

ContactForm valida nombre, correo, categoría y mensaje; reutiliza Input, Select, Textarea, Tooltip y Button. Sin onSubmitMessage solo valida y lo informa. Cuando el backend esté disponible, el consumidor podrá pasar esa función asíncrona; los campos quedan deshabilitados durante la petición. No mostrar éxito de envío antes de completarla. ContactFormDemo se conserva únicamente en el laboratorio.

Footer y SiteMenu reutilizan SectionTransition y section-navigation.js. Solo los enlaces internos válidos, activados sin modificadores, hacen morphing; correo, URLs externas, nueva pestaña y destinos inexistentes conservan comportamiento nativo. Incluye enlaces de navegación, equipo, marca y CTA de contacto. Navbar expone su nodo mediante ref para compartir la altura real. La cubierta reserva esa altura incluso si el navbar estaba oculto; useNavbarMotion observa data-active para revelarlo durante la transición. El scroll natural nunca activa la cubierta.

El footer no muestra un correo ficticio ni una red sin URL; email es opcional. Para agregar información de contacto o links personales, usar datos confirmados del equipo.
