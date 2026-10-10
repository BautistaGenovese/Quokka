# Manual de Diseño y Estilo
## Sistema visual de Quokka Studio

**Versión:** 2.0  
**Referencia de implementación:** `Quokka_portfolio_revisado.html`  
**Implementación actual:** HTML, CSS y JavaScript en un único documento; sistema preparado para trasladarse a componentes si el proyecto evoluciona.  
**Idioma del contenido:** español. Los nombres de tecnologías y algunas etiquetas técnicas pueden mantenerse en inglés.  
**Tema:** portfolio colaborativo, cálido y editorial, con identidad inspirada en los quokkas y una base técnica.

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

## 3. Paleta de colores

La implementación dispone de una paleta clara y una oscura, además de acentos por sección. Los componentes deben usar variables CSS en vez de repetir valores hexadecimales directamente.

### 3.1 Neutros y superficies

| Nombre | Hex / valor | Token | Uso |
|---|---|---|---|
| Papel cálido | `#F1EEE4` | `--paper` / `--bg` | Fondo principal del tema claro. |
| Papel secundario | `#E7E3D4` | `--paper-soft` / `--card` | Tarjetas y superficies alternas. |
| Arena | `#EBE2CF` | `--bg-sand` | Secciones editoriales con contraste suave. |
| Niebla | `#E2EAEC` | `--bg-mist` | Variación fría y ligera de fondo. |
| Tinta | `#1B1E21` | `--ink` / `--fg` | Texto principal, bordes y contraste. |
| Tinta secundaria | `#26323D` | `--ink-soft` | Texto oscuro secundario cuando corresponda. |
| Línea | `rgba(27,30,33,.18)` | `--line` | Divisores y bordes discretos en tema claro. |
| Línea fuerte | `rgba(27,30,33,.40)` | `--line-strong` | Contornos de controles que requieren más presencia. |

### 3.2 Color de marca y verdes

| Nombre | Hex | Token | Uso |
|---|---|---|---|
| Eucalipto suave | `#9DB8A3` | `--orange` / `--fl-green` | Rellenos suaves y acentos de marca en tema claro. El nombre histórico del token `--orange` se conserva por compatibilidad con el CSS existente. |
| Verde eucalipto | `#4F6F5B` | `--accent` / `--ac-green` | Acento principal en el tema claro: enlaces, índices, detalles y elementos activos. |
| Verde profundo | `#44624D` | `--ac-green-2` | Variación oscura para estados y contraste. |
| Bosque | `#2F4A3E` | `--hero-bg` | Fondo principal del hero. |
| Bosque oscuro | `#1F3A2E` | `--hero-paper` | Contraste decorativo dentro del hero. |
| Verde claro del hero | `#B4CDB9` | `--hero-orange` / `--hero-accent` | Detalles y estados destacados dentro del hero. |

### 3.3 Acentos secundarios

| Nombre | Hex | Token | Uso |
|---|---|---|---|
| Azul pizarra | `#456A82` | `--ac-blue` | Acento frío alternativo, por ejemplo en elementos del equipo. |
| Azul niebla | `#A9C1D0` | `--fl-blue` | Relleno suave asociado al acento azul. |
| Arcilla | `#7F5636` | `--ac-clay` | Acento cálido para manifiesto o secciones editoriales. |
| Arena arcilla | `#D9C3A0` | `--fl-clay` | Fondo suave asociado al acento arcilla. |
| Malva | `#6E5A79` | `--ac-mauve` | Acento secundario para tecnología y bloques especializados. |
| Malva suave | `#CBBDD2` | `--fl-mauve` | Relleno claro asociado al acento malva. |
| Advertencia | `#9C4A2B` | `--warn` | Advertencias en el tema claro, solo cuando sean necesarias. |

### 3.4 Tema oscuro

| Nombre | Hex / valor | Token | Uso |
|---|---|---|---|
| Tinta nocturna | `#1B1E21` | `--bg` | Fondo principal oscuro. |
| Texto claro | `#ECE8DE` | `--fg` | Texto principal en modo oscuro. |
| Tarjeta nocturna | `#25292D` | `--card` | Tarjetas y superficies elevadas. |
| Superficie profunda | `#15181B` | `--card-dark` | Contraste dentro de paneles oscuros. |
| Línea oscura | `rgba(236,232,222,.15)` | `--line` | Divisores discretos. |
| Línea oscura fuerte | `rgba(236,232,222,.35)` | `--line-strong` | Bordes que necesitan mayor visibilidad. |
| Verde nocturno | `#8DB39A` | `--accent` / `--orange` | Acento principal en modo oscuro. |
| Azul nocturno | `#86A9BF` | `--ac-blue` | Acento azul en modo oscuro. |
| Arcilla nocturna | `#D0A57C` | `--ac-clay` | Acento cálido en modo oscuro. |
| Malva nocturno | `#B39EBB` | `--ac-mauve` | Acento malva en modo oscuro. |
| Bosque del hero oscuro | `#487661` | `--hero-bg` | Fondo del hero cuando se activa el tema oscuro. |
| Verde claro del hero oscuro | `#CFE0D2` | `--hero-orange` / `--hero-accent` | Contraste y detalles en el hero oscuro. |

### 3.5 Identidad cromática del equipo

Los colores se usan como acentos para distinguir tarjetas o detalles; no reemplazan la paleta global.

| Integrante | Token | Valor |
|---|---|---|
| Bautista | `--c-bautista` | `#B9825B` |
| Juan | `--c-juan` | `#C9B06A` |
| Lautaro | `--c-lautaro` | `#8FB59A` |
| Ignacio | `--c-ignacio` | `#7B9DB3` |
| Micaías | `--c-micaias` | `#A08AA8` |

### 3.6 Reglas de color

1. El tema claro usa el papel cálido como fondo principal y tinta oscura para texto.
2. El tema oscuro usa tinta nocturna y texto claro; no usar negro puro como fondo general.
3. El verde eucalipto es el acento principal en el tema claro.
4. El hero tiene su propia combinación bosque/crema y debe conservar contraste alto.
5. Los acentos azul, arcilla y malva son variaciones por sección, no colores que deban competir todos juntos.
6. Las tarjetas del equipo pueden variar de color, pero deben conservar estructura, tipografía y espaciado comunes.
7. Los fondos claros deben usar texto oscuro; los fondos oscuros deben usar texto claro.
8. Verificar contraste de texto normal de al menos 4.5:1 y de texto grande de al menos 3:1.
9. No aplicar un color de acento a todos los elementos interactivos al mismo tiempo; priorizar el elemento activo o la acción principal.
10. Mantener los tokens actuales aunque algunos nombres heredados, como `--orange`, no coincidan exactamente con el color representado.

### 3.7 Tokens CSS canónicos

Estos tokens reflejan la implementación existente. Los valores de los temas se sobrescriben mediante `prefers-color-scheme` y `data-theme`.

```css
:root {
  --orange: #9DB8A3;
  --accent: #4F6F5B;
  --ink: #1B1E21;
  --ink-soft: #26323D;
  --paper: #F1EEE4;
  --paper-soft: #E7E3D4;
  --line: rgba(27, 30, 33, 0.18);
  --line-strong: rgba(27, 30, 33, 0.4);
  --card: #E7E3D4;
  --card-dark: #1C2226;
  --warn: #9C4A2B;
  --bg-sand: #EBE2CF;
  --bg-mist: #E2EAEC;

  --ac-green: #4F6F5B;
  --ac-green-2: #44624D;
  --ac-blue: #456A82;
  --ac-clay: #7F5636;
  --ac-mauve: #6E5A79;

  --fl-green: #9DB8A3;
  --fl-blue: #A9C1D0;
  --fl-clay: #D9C3A0;
  --fl-mauve: #CBBDD2;

  --bg: var(--paper);
  --fg: var(--ink);

  --hero-bg: #2F4A3E;
  --hero-ink: #F1EEE4;
  --hero-paper: #1F3A2E;
  --hero-orange: #B4CDB9;
  --hero-solid-hover: #43705A;
  --hero-accent: #B4CDB9;

  --font-display: "Gabarito", system-ui, sans-serif;
  --font-serif: "Fraunces", Georgia, serif;
  --font-body: "Source Sans 3", system-ui, -apple-system, sans-serif;
  --font-mono: "IBM Plex Mono", monospace;
}
```

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
- Los colores de identidad pueden variar por persona, dentro de los tokens aprobados.
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

El hero combina un fondo bosque profundo, tipografía de gran escala, una cuadrícula sutil y elementos decorativos flotantes.

- El fondo usa `--hero-bg`.
- El texto usa `--hero-ink`.
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
- Acentos eucalipto, azul, arcilla o malva usados con moderación.
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

- Usar `--bg`, `--fg`, `--paper`, `--ink`, `--accent`, `--line` y los tokens de sección.
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

- Usa la paleta de tema claro/oscuro existente.
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

La implementación actual es un HTML autocontenido con CSS y JavaScript incluidos. La estructura visual se organiza mediante secciones e identificadores dentro del documento.

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

> Fondo papel cálido o tinta nocturna; Gabarito para titulares; Source Sans 3 para lectura; IBM Plex Mono para metadatos técnicos; Fraunces como acento editorial; verde eucalipto como acento principal; azul, arcilla y malva como variaciones controladas; espacio negativo generoso; botones claros; tarjetas coherentes; navegación cómoda en desktop y mobile; accesibilidad y microinteracciones moderadas.

Este manual reemplaza la dirección visual anterior basada en una estética oscura violeta/cian. La referencia visual actual es el sistema implementado en `Quokka_portfolio_revisado.html`.

---

**Fin del Manual de Diseño y Estilo — v2.0**
