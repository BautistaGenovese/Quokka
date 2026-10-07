# Manual de Diseño y Estilo
## Sistema visual para el portfolio basado en tamalsen.dev

**Versión:** 1.0  
**Referencia visual:** https://tamalsen.dev/  
**Implementación:** Next.js App Router + React + Tailwind CSS + shadcn/ui  
**Idioma del contenido:** español para documentación; inglés para copy del portfolio  
**Tema:** dark-only, editorial, técnico y orientado a portfolio de ingeniería de software

---

## 1. Propósito

Este documento define el sistema visual, las reglas de composición y los patrones de componentes para construir o extender el portfolio. Debe usarse como fuente de verdad antes de crear una nueva pantalla, sección o componente.

El objetivo es mantener una interfaz:

- Oscura, elegante y con alto contraste.
- Editorial: grandes titulares, mucho espacio negativo y ritmo vertical.
- Técnica: tipografía monoespaciada, etiquetas de código y navegación con `//`.
- Personal: acentos violeta, cian y una ilustración abstracta en el hero.
- Accesible: HTML semántico, foco visible, texto legible y respeto por `prefers-reduced-motion`.
- Responsive: mobile-first, sin depender de posiciones absolutas para la estructura.

---

## 2. Dirección visual

### 2.1 Personalidad de marca

Las palabras guía son:

- **Preciso:** cada elemento tiene una función.
- **Experimental:** se permiten formas abstractas y color, pero sin ruido decorativo.
- **Confiable:** estructura clara, jerarquía tipográfica fuerte y CTA evidentes.
- **Humano:** testimonios, experiencia y copy directo.
- **Técnico:** monoespaciada, tags, referencias de código y nomenclatura de ingeniería.

### 2.2 Qué evitar

- Fondos claros o gradientes genéricos tipo SaaS.
- Más de un acento dominante en la misma vista.
- Sombras pesadas o neumorfismo.
- Cards con exceso de bordes y decoración.
- Iconos emoji.
- Texto centrado cuando el contenido requiere lectura larga.
- Componentes que dependan de `localStorage` para funcionar.
- Imágenes externas como placeholders sin `alt`.
- SVG complejos dibujados manualmente para mapas o visualizaciones.

---

## 3. Paleta de colores

Usar tokens CSS, nunca repetir hexadecimales directamente en los componentes salvo para una ilustración o asset aislado.

### 3.1 Neutros de base

| Nombre | Hex / valor | Token | Uso |
|---|---|---|---|
| Grafito Nocturno | `#1A191D` | `--background` | Fondo principal del body y secciones. No usar negro puro como fondo general. |
| Superficie | `#17161A` | `--card` | Header, tarjetas y superficies elevadas. |
| Carbón | `#0F0F0F` | `--surface-deep` | Testimonios, footer y bloques de contraste máximo. |
| Blanco Puro | `#FFFFFF` | `--foreground` | Titulares, navegación y texto destacado. |
| Blanco 75% | `rgba(255,255,255,.75)` | `--muted-foreground` | Párrafos, descripciones y texto secundario. |
| Muted | `#232227` | `--muted` | Fondos sutiles, estados inactivos y controles. |
| Borde | `rgba(255,255,255,.10)` | `--border` | Divisores y bordes discretos. |
| Input | `rgba(255,255,255,.15)` | `--input` | Campos de formulario y controles. |

### 3.2 Violetas de marca

| Nombre | Hex | Token | Uso |
|---|---|---|---|
| Violeta Eléctrico | `#9B37FF` | `--primary` | CTA primario, botones “View Project” y estados activos. |
| Lavanda | `#BB77FF` | `--highlight` | Hover, enlaces, cursor del logo y detalles interactivos. |
| Orquídea | `#BC60FB` | `--testimonial-1` | Testimonio principal; usar preferentemente con texto grande o oscuro. |
| Amatista | `#923FE6` | `--testimonial-3` | Testimonio secundario y variación de panel. |
| Púrpura Profundo | `#490C86` | `--deep` | Barras de experiencia y acentos densos. |
| Índigo Noche | `#241D41` | `--secondary` | Panels expandidos, overlays y superficies violetas oscuras. |

### 3.3 Acentos

| Nombre | Hex | Token | Uso |
|---|---|---|---|
| Cian Terminal | `#66D9ED` | `--accent` | Logo `TamalSen.`, referencias de código y acento frío. |
| Azul Cobalto | `#0067DC` | `--testimonial-2` | Variación de card/testimonio. |
| Índigo Etiqueta | `#2C3599` | `--tag` | Chips de tecnologías. |
| Ámbar Orbe | `#F4A261` | `--glow` | Luz cálida de la ilustración 3D del hero. |
| Destructive | `#FF5C7A` | `--destructive` | Errores y acciones destructivas, solo cuando corresponda. |

### 3.4 Reglas de color

1. El fondo base siempre es `#1A191D`.
2. Usar `--primary` para una acción principal por bloque.
3. Usar como máximo un acento adicional dominante por vista.
4. El cian comunica identidad técnica; el violeta comunica acción.
5. Las tarjetas no deben competir con el CTA principal.
6. Verificar contraste: texto normal mínimo 4.5:1; texto grande mínimo 3:1.
7. Para texto sobre `--primary`, usar `--primary-foreground: #FFFFFF`.
8. Para texto sobre `--highlight` o `--glow`, preferir texto oscuro `#1A191D`.

### 3.5 Tokens CSS canónicos

```css
:root {
  color-scheme: dark;
  --background: #1a191d;
  --foreground: #ffffff;
  --card: #17161a;
  --card-foreground: #ffffff;
  --popover: #17161a;
  --popover-foreground: #ffffff;
  --primary: #9b37ff;
  --primary-foreground: #ffffff;
  --secondary: #241d41;
  --secondary-foreground: #ffffff;
  --muted: #232227;
  --muted-foreground: rgb(255 255 255 / 0.75);
  --accent: #66d9ed;
  --accent-foreground: #1a191d;
  --highlight: #bb77ff;
  --deep: #490c86;
  --destructive: #ff5c7a;
  --border: rgb(255 255 255 / 0.1);
  --input: rgb(255 255 255 / 0.15);
  --ring: #bb77ff;
  --radius: 0.375rem;
}
```

---

## 4. Tipografía

### 4.1 Familias

- **Poppins:** titulares, cuerpo, botones, nombres de proyectos y contenido editorial.
- **Roboto Mono:** navegación, subtítulos técnicos, índices, tags, labels y referencias de código.

En Next.js, cargar las familias con `next/font/google` y exponerlas como variables `--font-poppins` y `--font-roboto-mono`. El theme de Tailwind debe mapearlas a `font-sans` y `font-mono`.

### 4.2 Escala tipográfica

| Rol | Familia | Especificación | Tailwind aproximado |
|---|---|---|---|
| Display / H1 | Poppins | 600, 144px, line-height 1.0, tracking +2.2px, uppercase | `text-5xl md:text-7xl lg:text-8xl font-semibold uppercase tracking-wide leading-none` |
| H2 | Poppins | 600, 75px, line-height 1.4, tracking -1.5px | `text-4xl md:text-6xl font-semibold tracking-tight` |
| H3 / proyecto | Poppins | 700, 21px, line-height 1.1, tracking -0.2px | `text-xl font-bold tracking-tight` |
| H4 / etiqueta | Poppins | 500, 22px, line-height 1.0 | `text-xl font-medium tracking-tight` |
| Subtítulo hero | Roboto Mono | 500, 22px, tracking +3px, uppercase | `text-base md:text-xl font-medium uppercase tracking-widest` |
| Navegación | Roboto Mono | 500, 17.6px, tracking -1px | `text-lg font-medium tracking-tight` |
| Cuerpo | Poppins | 400, 16px, line-height 1.65, blanco 75% | `text-base leading-relaxed text-muted-foreground` |
| Micro / índice | Roboto Mono | 600, 10px | `text-xs font-semibold` |

### 4.3 Reglas de lectura

- No usar más de dos familias tipográficas.
- H1 puede romper una línea en desktop, pero debe poder comprimirse en mobile.
- Los párrafos deben tener un ancho máximo aproximado de `65ch`.
- Usar `leading-relaxed` en cuerpo de texto.
- Usar uppercase solamente para labels, subtítulos y el H1.
- Usar `tracking-tight` en titulares grandes y `tracking-widest` en subtítulos técnicos.
- No usar texto gris de bajo contraste sobre el fondo oscuro.

---

## 5. Layout, grid y espaciado

### 5.1 Contenedor

Usar un contenedor central:

```tsx
<div className="mx-auto w-full max-w-6xl px-6 md:px-8">
  {/* contenido */}
</div>
```

- Mobile: padding horizontal `24px`.
- Desktop: padding horizontal `32px`.
- Ancho máximo recomendado: `1152px` / `max-w-6xl`.
- No fijar anchos absolutos para contenido editorial.

### 5.2 Ritmo vertical

- Micro separación: `8px`.
- Separación de elementos relacionados: `16px`.
- Separación de bloques: `24px` a `32px`.
- Separación de secciones: `96px` a `160px`.
- Hero: entre `160px` y `240px` de altura útil en desktop.

### 5.3 Layout method priority

1. Flexbox para navegación, filas, botones y alineación de contenido.
2. CSS Grid para proyectos, paletas, comparaciones y estructuras de dos dimensiones.
3. Posicionamiento absoluto únicamente para decoración, cursor del logo, orbes o overlays que no definan el layout.
4. Evitar alturas fijas salvo para controles, thumbnails e ilustraciones.

### 5.4 Responsive

Breakpoints sugeridos:

- `sm`: 640px.
- `md`: 768px.
- `lg`: 1024px.
- `xl`: 1280px.

Comportamiento mobile:

- La navegación debe poder colapsarse o apilarse.
- Las grids de proyectos pasan de 2 columnas a 1.
- El hero pasa de composición lado a lado a columna.
- Los botones pueden ocupar el ancho natural, no necesariamente 100%.
- Los H1 se reducen con clases responsivas.
- No ocultar información esencial solo para conservar la composición.

---

## 6. Arquitectura de la página

La página del manual implementada tiene esta secuencia:

1. `SiteHeader`: navegación persistente y marca.
2. `Cover`: portada del manual, contexto, hero visual y metadatos.
3. `Principles`: principios visuales y decisiones de diseño.
4. `ColorPalette`: colores, tokens, usos y contraste.
5. `Typography`: familias, escala y ejemplos.
6. `ComponentsShowcase`: botones, tags, cards, navegación y estados.
7. `GridSpacing`: contenedores, spacing y reglas responsive.
8. `Prototype`: prototipo visual de baja y alta fidelidad.
9. Footer con versión del manual.

Cada sección debe ser un componente independiente dentro de `components/manual/`. `app/page.tsx` debe encargarse solamente de la composición de la página, no de contener toda la UI.

---

## 7. Componentes

### 7.1 SectionHeading

Responsabilidad: renderizar el índice numérico, eyebrow, título y descripción de una sección.

API sugerida:

```ts
type SectionHeadingProps = {
  index: string
  eyebrow?: string
  title: string
  description?: string
}
```

Patrón visual:

- Índice en Roboto Mono, pequeño y cian/violeta.
- Título en Poppins semibold.
- Descripción en `text-muted-foreground`.
- Espaciado inferior consistente antes del contenido.

### 7.2 Logo

El logo es textual y técnico:

```tsx
<span className="font-mono">
  TamalSen<span className="text-accent">.</span>
</span>
```

Reglas:

- Mantener el punto final como detalle de marca.
- Usar cian para el punto.
- Añadir cursor lavanda solo si la animación respeta reduced motion.
- El logo debe ser un enlace a inicio cuando exista navegación.

### 7.3 SiteHeader

Responsabilidad: navegación principal y acceso rápido a secciones.

Reglas:

- Usar `<header>` y `<nav aria-label="Navegación principal">`.
- Links con labels técnicos: `// expertise`, `// work`, `// experience`, `// contact`.
- Estado hover/focus en `--highlight`.
- Fondo de superficie `--card`, opcionalmente con transparencia y `backdrop-blur`.
- No usar navegación horizontal que desborde en mobile.

### 7.4 Botones

CTA primario:

```tsx
<Button className="bg-primary text-primary-foreground hover:bg-highlight">
  View Project
</Button>
```

CTA secundario:

```tsx
<Button variant="outline" className="border-border text-foreground hover:border-highlight hover:text-highlight">
  Learn More
</Button>
```

Estados obligatorios:

- Default.
- Hover.
- Focus-visible con `ring`.
- Disabled.
- Loading si la acción es asíncrona.

No crear botones como `<div>` ni quitar el outline de foco sin reemplazarlo.

### 7.5 Tags / chips

Usar para tecnologías y metadatos, no para párrafos.

```tsx
<span className="rounded-sm bg-[var(--tag)] px-2 py-1 font-mono text-xs text-white">
  React
</span>
```

- Roboto Mono.
- Texto blanco.
- Fondo Índigo Etiqueta.
- Radio pequeño, cercano a `6px`.
- Separación horizontal de `8px`.

### 7.6 ProjectCard

Estructura recomendada:

```tsx
<article className="group overflow-hidden rounded-md border border-border bg-card">
  <div className="aspect-[16/10] overflow-hidden bg-muted">
    <Image src={image} alt={description} className="object-cover transition-transform group-hover:scale-[1.02]" />
  </div>
  <div className="space-y-4 p-6">
    <p className="font-mono text-xs uppercase text-accent">Featured Project</p>
    <h3 className="text-xl font-bold tracking-tight">Flight Local B2B</h3>
    <p className="text-muted-foreground">Descripción breve y concreta.</p>
    <div className="flex flex-wrap gap-2">{/* tags */}</div>
    <Button>View Project</Button>
  </div>
</article>
```

Reglas:

- La imagen debe tener `alt` útil.
- La tarjeta debe ser navegable con teclado si representa un enlace.
- No usar más de una acción primaria por card.
- Mantener el contenido visible sin hover.

### 7.7 ExperienceAccordion

- Trigger semántico `<button>`.
- `aria-expanded` y `aria-controls`.
- Barra de experiencia en `--deep` con opacidad aproximada 87%.
- Panel abierto en `--secondary`.
- Periodo en Roboto Mono.
- Tags debajo del detalle.

### 7.8 TestimonialCard

- Usar superficies de la familia violeta/cobalto.
- Mantener texto grande y corto.
- Añadir nombre, rol y empresa con jerarquía menor.
- Comprobar contraste individual para cada variante de fondo.

### 7.9 Hero visual

El hero combina texto editorial con una ilustración abstracta de cubos geométricos.

- La ilustración es decorativa, por lo que puede usar `alt=""` si no transmite información.
- El fondo sigue siendo `--background`.
- La luz cálida usa `--glow` de forma contenida.
- Los cubos pueden mezclar violeta eléctrico, azul y cian.
- No desplazar el texto para acomodar la imagen en mobile.
- El asset generado se encuentra en `public/images/hero-cubes.png`.

---

## 8. Prototipado visual

El prototipo debe mostrar dos niveles complementarios.

### 8.1 Wireframe

Objetivo: validar estructura antes de validar estilo.

Debe mostrar:

- Header y navegación.
- Bloque hero dividido en texto e imagen.
- Secciones de expertise, work, experience y contact.
- Rectángulos neutros para imágenes.
- Jerarquía de tamaños, no detalles decorativos.

El wireframe no debe usar color para resolver problemas de estructura.

### 8.2 Hi-fi

Objetivo: validar la experiencia final.

Debe mostrar:

- Fondo grafito.
- H1 grande.
- Tipografías finales.
- Cards reales con color y bordes.
- Tags tecnológicos.
- CTA violeta.
- Acentos cian y lavanda.
- Ilustración del hero.

### 8.3 Toggle de prototipos

El componente `Prototype` debe permitir alternar entre wireframe y alta fidelidad. Los controles deben ser botones accesibles y reflejar el estado activo visualmente.

También puede incluir un estado `Móvil` para enseñar cómo se refluye el layout.

Reglas de interacción:

- No depender de navegación de página para alternar vistas.
- Mantener el foco en el control activado.
- Usar `aria-pressed` en toggles.
- Respetar `prefers-reduced-motion`.

---

## 9. Accesibilidad

Checklist obligatorio para cada componente:

- HTML semántico: `header`, `nav`, `main`, `section`, `article`, `footer`.
- Un solo H1 por página.
- Jerarquía de headings sin saltos arbitrarios.
- `alt` para imágenes informativas; `alt=""` para decorativas.
- Focus-visible visible en links, botones, tabs y controles.
- No comunicar estado solo mediante color.
- Labels visibles o accesibles en formularios.
- Contraste mínimo WCAG AA.
- `aria-expanded`, `aria-controls` y `aria-pressed` donde corresponda.
- Animaciones desactivadas o reducidas con `prefers-reduced-motion`.
- No usar caracteres decorativos como sustitutos de iconos funcionales.

---

## 10. Reglas de implementación para el LLM

Antes de escribir código:

1. Inspeccionar archivos existentes y reutilizar componentes.
2. Confirmar si el proyecto usa App Router y Tailwind actual.
3. Revisar `components.json` antes de regenerar componentes shadcn.
4. Usar tokens semánticos en lugar de hexadecimales repetidos.
5. Separar la página en componentes pequeños y nombrados.
6. Instalar dependencias antes de importarlas.
7. No usar `localStorage` como persistencia por defecto.
8. No hacer fetch dentro de `useEffect`; usar Server Components o SWR cuando corresponda.
9. No crear archivos de documentación adicionales salvo que se soliciten.
10. No modificar archivos no relacionados.

Después de escribir código:

1. Verificar la compilación y los errores del navegador.
2. Revisar la página en desktop y mobile.
3. Confirmar que los toggles, links y accordions reaccionen.
4. Revisar contraste y foco de teclado.
5. Tomar una captura si el cambio afecta el layout.
6. Eliminar cualquier `console.log('[v0] ...')` temporal.

---

## 11. Convenciones de código

### Imports

Usar alias `@/`:

```tsx
import { SectionHeading } from '@/components/manual/section-heading'
```

### Componentes

- Preferir componentes funcionales.
- Tipar props explícitamente.
- Mantener los datos repetibles en arrays fuera del JSX.
- Evitar páginas monolíticas.
- Usar nombres descriptivos en inglés para código y copy del portfolio; documentación en español.

### Client Components

Añadir `'use client'` solo cuando el componente necesita estado, eventos de usuario o APIs del navegador. El resto debe permanecer como Server Component.

### Imágenes

- Preferir assets locales o generados.
- Usar `next/image`.
- Definir `alt`.
- Mantener ratio de aspecto explícito.
- No usar una URL externa como placeholder permanente.

### Datos

Los datos del manual viven en `lib/manual-data.ts`, incluyendo:

- `colorGroups` para paleta.
- `typeScale` para tipografía.
- `navItems` para navegación.
- `experience` para trayectoria profesional.

Añadir nuevas colecciones de datos allí antes de llenar un componente con arrays inline.

---

## 12. Copy y tono

### Voz

- Directa, segura y técnica.
- Frases cortas.
- Verbos de acción.
- Sin claims inflados.
- Explicar impacto y tecnología.

### Ejemplos de labels

- `// expertise`
- `// work`
- `// experience`
- `// contact`
- `Featured Project`
- `View Project`
- `Learn More`
- `Software Engineer, Front End & App Developer.`

### Regla para proyectos

Cada proyecto debe comunicar en este orden:

1. Qué es.
2. Qué problema resuelve.
3. Qué hizo la persona.
4. Qué tecnologías se usaron.
5. Qué acción puede realizar el visitante.

---

## 13. Checklist de aceptación

Una nueva sección cumple el sistema cuando:

- Usa el fondo y los tokens correctos.
- Respeta Poppins + Roboto Mono.
- Tiene un heading y una jerarquía clara.
- Usa `max-w-6xl` y padding consistente.
- Funciona en mobile sin overflow horizontal.
- Tiene estados hover y focus.
- Tiene HTML semántico y ARIA apropiado.
- No introduce colores fuera de la paleta sin justificación.
- No crea una segunda estética incompatible.
- Mantiene la densidad visual editorial del portfolio.

---

## 14. Estructura actual de archivos

```text
app/
  globals.css
  layout.tsx
  page.tsx
components/
  manual/
    color-palette.tsx
    components-showcase.tsx
    cover.tsx
    grid-spacing.tsx
    logo.tsx
    principles.tsx
    prototype-hifi.tsx
    prototype-wireframe.tsx
    prototype.tsx
    section-heading.tsx
    site-header.tsx
lib/
  manual-data.ts
public/
  images/
    hero-cubes.png
```

---

## 15. Resumen operativo

Cuando el LLM deba crear un componente nuevo, debe pensar así:

> Fondo grafito, una jerarquía editorial fuerte, Poppins para contenido humano, Roboto Mono para señales técnicas, violeta para acciones, cian para identidad, espacio negativo generoso, composición con flex/grid, estados accesibles y responsive desde mobile.

Este manual es la referencia principal para extender el portfolio sin perder coherencia visual ni técnica.

---

**Fin del Manual de Diseño y Estilo — v1.0**
