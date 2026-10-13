# Componentes de Quokka

Guía del contrato actual de React. `../DESIGN.md` describe las decisiones visuales;
`app/page.js` muestra el portfolio de pruebas; `/componentes` conserva el laboratorio.
Ninguna de estas páginas es una dependencia de los componentes.

Para conectar datos reales, consultar [BACKEND-INTEGRATION.md](./BACKEND-INTEGRATION.md):
registra el formato propuesto y las piezas pendientes de GitHub y sesión.

## Preparación y comprobaciones

Desde la raíz del repositorio (la carpeta que contiene los workspaces):

```sh
npm ci
npm run dev -w frontend
npm run lint -w frontend
npm run test:motion -w frontend
npm run test:components -w frontend
npm run build -w frontend
```

Requieren `app/globals.css`, las fuentes de `app/layout.js`, el alias `@/` y las
dependencias del workspace. Son reutilizables entre páginas de Quokka; copiar
solo un JSX a otra aplicación no incluye automáticamente esas dependencias.

## Responsabilidades

- `components/ui/`: piezas reutilizables, sin datos de personas ni peticiones de red.
- `components/cards/`: composiciones de Card para proyectos, equipo y habilidades.
- `components/section.jsx`: contexto de colores, sin estado ni animación.
- `hooks/use-button-motion.js`: movimiento de Button separado de su presentación.
- `lib/gsap.js`: registro de plugins y parámetros comunes; no modificar defaults globales.
- `navbar`, `site-menu`, `palette-panel`: navegación e identidad específicas de Quokka.
- `contact-form-demo` y `/componentes`: ejemplos; la validación local no es un backend.
- `portfolio-preview` y `lib/site-content.js`: composición y contenido del portfolio de pruebas.

Una pieza con hooks, eventos o estado usa `"use client"`. Puede importarse desde una
página Server Component, pero los callbacks deben crearse en un componente cliente.
Section y las composiciones de cards pueden formar parte de un árbol servidor;
tilt y botones se resuelven en sus respectivas piezas cliente.

## Colores y superficies

Una sola capa de aplicación controla `data-pal` y `data-theme` de `<html>`.
Paletas y nombres están en `lib/palettes.js`; los valores efectivos están en CSS.
Modo: `light`, `dark` o `system` (para system, retirar `data-theme`). Navbar recibe
`theme`, `mode`, `onThemeChange` y `onModeChange`; no guarda otra copia ni aplica
esos atributos por su cuenta. Ejemplo:

```jsx
<Section surface="deep" className="p-8">
  <Button>Acción sobre fondo profundo</Button>
  <Section surface="card" className="mt-6 rounded-card p-8">
    <Button variant="secondary" magnetic={false}>Acción local</Button>
  </Section>
</Section>
```

Superficies: `page`, `card`, `muted`, `deep`, `primary`, `secondary`, `accent`.
Cada Section reinicia los roles locales. Usar className para distribución y
espaciado; evitar colores fijos. Los portales heredan del DOM donde se montan:
deben tener su propio contexto. El rojo de error es independiente de la paleta.

## Footer

Importar `@/components/footer` y montarlo después de `main`. Conserva la marca y
los créditos de `Quokka.html`, sobre superficie `deep`. Recibe `links` (lista de
`{ href, label }`) y `homeHref` (`#inicio` por defecto). Los enlaces predeterminados
corresponden al portfolio; el laboratorio pasa sus propios destinos.

El borde SVG se superpone al espacio inferior de la sección anterior y rebota al
entrar en pantalla según la velocidad del scroll, inspirado en
[Footer bounce de GSAP](https://demos.gsap.com/demo/footer-bounce/). No requiere
MorphSVG: GSAP anima la curvatura numérica. En reposo el borde queda plano;
con movimiento reducido no anima. Limpia triggers y animaciones al desmontarse.

## Button

Importar `@/components/ui/button`. Variantes `primary`, `secondary`, `accent`,
`ghost`; tamaños `sm`, `md`, `lg`. Admite atributos nativos, eventos y ref al
elemento. Con href es enlace; sin href es botón type="button". Usar type="submit"
explícitamente en formularios.

La aplicación controla status: `idle`, `loading`, `success`, `error`. loading es
un alias compatible. No hay petición ni reinicio de estado internos.
loadingLabel/successLabel/errorLabel personalizan el mensaje: textos simples se
animan y JSX conserva su contenido sin reemplazo animado. disabled, loading y
aria-disabled bloquean la acción también en enlaces.

```jsx
<Button type="submit" status={status} magnetic={false}
  loadingLabel="Cargando..." successLabel="Guardado" errorLabel="Reintentar">
  Guardar
</Button>
```

magnetic={false} conserva los demás efectos. strength y maxRotation ajustan el
movimiento. iconLeft/iconRight aceptan JSX; iconOnlyOnMobile oculta visualmente
el texto si hay icono. Si solo hay contenido gráfico, dar aria-label al botón
y aria-hidden al icono decorativo.

Montar **un solo CursorFollower en el layout**, nunca uno por botón o página.
Su contrato compartido usa data-cursor-button, data-cursor-fill, data-cursor-ink
y clases de Button: los consumidores no deben escribir esos atributos.
Sin seguidor el botón conserva acciones y fallbacks CSS; el relleno radial del
mouse requiere el seguidor. Táctil y movimiento reducido tienen alternativas.

## Card y composiciones

Card (`@/components/ui/card`) admite surface, tilt (false por defecto), children,
atributos HTML y ref al article. className afecta al **marco exterior**: usarlo
para ancho, grid y separación. El panel interior gestiona su transform; no animar
ese mismo transform desde otro componente.

Contenido propio con relieve: agrupar con card-content y marcar textos con
data-card-depth. No poner overflow-hidden en el panel 3D; recortar imágenes o
previews en sus contenedores. Todos los textos tienen la misma profundidad.

- ProjectCard: title, description, technologies, preview, demoHref, codeHref.
- TeamCard: name (texto obligatorio), role, description, portrait, profileHref.
- SkillCard: title, description, icon, tags.

Importar desde `@/components/cards/project-card`, `team-card`, `skill-card`.
Todas reciben las props de Card. Proyecto/equipo activan tilt por defecto;
habilidad no. Los slots preview/portrait/icon aceptan JSX. Imágenes informativas
necesitan texto alternativo. Omitir URLs elimina la acción correspondiente.
El consumidor decide grid y anchos; no hay un tamaño universal fijo.

## CardSlider

Importar `@/components/ui/card-slider`. Recibe children, label y className.
Dar una key estable y única a cada card basada en su ID de datos.

```jsx
<CardSlider label="Proyectos del equipo">
  {projects.map(project => <ProjectCard key={project.id} {...project} />)}
</CardSlider>
```

No duplica cards. Lista vacía no muestra carrusel; una card desactiva controles.
Agregar, quitar o reordenar keys reinicia posición y animaciones; actualizar
contenido manteniendo keys conserva la posición. El slider mueve el wrapper y
Card el panel interior. Solo la card activa permite foco. Admite flechas de
teclado, arrastre, inercia y movimiento reducido.
Las cards mantienen opacidad; las laterales reducen su escala hasta 0,9 con
curva suave, la central conserva escala 1. Separación base de 48 px.
El viewport recorta su salida lateral. Movimiento reducido mantiene escala 1.
El paso asegura que el salto circular ocurra fuera de pantalla. En el laboratorio
el slider está fuera del contenedor del encabezado para ocupar todo el ancho.

## Marquee

Importar `@/components/ui/marquee` y colocarlo dentro de Section para definir
la superficie. No conoce la página, los enlaces del menú ni la paleta activa.

```jsx
<Section as="div" surface="primary">
  <Marquee items={["Diseño", "Código", "Movimiento"]} speed={70}
    direction="left" label="Nuestro proceso" />
</Section>
```

`items` es una lista de strings; una lista vacía no renderiza nada. `speed`
se expresa en píxeles por segundo (70 por defecto). `direction` es left/right
y define el sentido inicial y al bajar el scroll. `followScroll` (true) invierte
ese sentido al subir, pasando suavemente por velocidad cero. `pauseOnHover`
(true) pausa al pasar un mouse por el texto; el tacto no queda bloqueado.
`label` nombra la región y `className` permite ajustar layout.

`size="sm"` es compacto, `size="md"` es el tamaño habitual (por defecto) y
`size="lg"` conserva el tamaño grande original para separadores protagonistas.
Los tres ajustan texto, padding y separación de forma responsive. El tamaño
no cambia la velocidad ni la animación; no hace falta agregar CSS por instancia.

El botón Pausar/Reanudar es independiente por instancia y mantiene la posición.
`showControls` es false por defecto: no muestra el panel superior. Usar
`showControls={true}` para mostrar título y pausa. Sin panel, la pausa sigue
disponible para lectores de pantalla y se revela al recibir foco con teclado.
Velocidad 0 deja el texto quieto y deshabilita ese control. ResizeObserver y
document.fonts.ready recalculan el ancho sin reiniciar el progreso; se repite
el grupo de frases tantas veces como requiera la ventana, sin estirar grupos
ni dejar huecos. Solo existe una lectura accesible del contenido.
El hook `use-marquee-motion` pausa su ticker fuera de pantalla o con la pestaña
oculta y limpia GSAP, ScrollTrigger, observers y listeners al desmontar.
Movimiento reducido elimina la tira animada y muestra el texto completo,
estático y con salto de línea. Estilos en `app/marquee.css`.

## Input, Textarea y Tooltip

Input y Textarea implementan Aire: etiqueta a la izquierda sobre el borde superior,
foco indicado por el borde e iconos con MorphSVG (reposo → lápiz; error → X, con
prioridad sobre foco). Campo y label heredan el fondo --s-bg y texto --s-fg de Section.
El foco usa una onda senoidal suave de 2 px; el error, dientes de 3,5 px.
Ambos recorren todo el perímetro. El borde SVG cambia de estado en 420 ms
y regresa al corregirlo. Los dientes son decorativos: no modifican el área nativa
de escritura. ResizeObserver conserva su tamaño en píxeles al redimensionar.
Los textarea permiten resize vertical hasta 15rem y scroll interno. Movimiento
reducido elimina la interpolación y el movimiento continuo; alto contraste conserva borde y foco nativos. El ticker se pausa fuera de pantalla o con la pestaña oculta.
Los estilos viven en `app/fields.css`, importado por globals.css. No quedan las
otras propuestas de inputs. ContactFormDemo usa estos componentes definitivos.

Importar `@/components/ui/input`, `textarea`, `tooltip`. Input y Textarea comparten
FormField; no validar ni manejar peticiones dentro de esa estructura.
Props: label, description, error, icon, labelAccessory, wrapperClassName, className
(del control), atributos nativos y ref al input/textarea. IDs automáticos únicos;
si se pasa id, el consumidor debe garantizar su unicidad.

icon admite `person`, `mail`, `message`, `text` o false para ocultarlo. Por defecto
se elige mail para email, message para textarea y text para los demás. labelAccessory
se muestra debajo del campo sin interferir con el label flotante. Los handlers de
foco y blur del consumidor se conservan. error o aria-invalid=true activan el borde;
pasar error añade además el mensaje asociado. El consumidor decide cuándo retirarlo.

```jsx
<Input label="Correo" name="email" type="email" required error={errors.email}
  labelAccessory={<Tooltip label="Ayuda sobre el correo" content="Usaremos este correo para responderte." />} />
<Textarea label="Consulta" name="message" rows={5} />
```

Admiten value + onChange o defaultValue + FormData. No mezclar ambos modos.
Input está diseñado para text/email/password/search/tel/url/number; checkbox,
radio, file y select necesitan componentes específicos. El formulario decide
validación, foco del primer error y anuncio del resultado.

Select (`ui/select`) comparte FormField y el borde Aire; la etiqueta siempre
flota. Radix Select gestiona teclado, búsqueda por letras, foco, FormData y reset.
Aporta children con option/optgroup, value/onValueChange o defaultValue, name,
required, disabled, error y ref al botón trigger. onValueChange recibe el valor,
no un evento. El menú hereda Section sin portal; evitar ancestros con clipping.
GSAP anima panel elástico (1 s) y opciones escalonadas desde x=-20; al cerrar
revierte a 2.5x con easeReverse durante 400 ms. Presence conserva el DOM hasta
terminar; movimiento reducido salta directamente al estado final.
El aspecto de edición del selector depende de la lista abierta, no del foco
que Radix devuelve al trigger al cerrar. Conserva :focus-visible para teclado.

Checkbox (`ui/checkbox`) acepta label, description, error y atributos/ref nativos
(checked/onChange o defaultChecked, name/value). RadioGroup (`ui/radio-group`)
recibe label, name, options [{ value, label, description?, disabled? }], required,
disabled, error, description y value/onValueChange o defaultValue. Su ref apunta
al fieldset. Los valores de options deben ser únicos. Sin name genera un grupo
independiente; pasar name para recuperarlo fácilmente desde FormData.
Las flechas cambian de radio; Espacio marca la casilla. El reset nativo restaura
valores no controlados; si están controlados, el consumidor reinicia su estado.

Tooltip conserva el nombre del componente, pero usa Popover de Radix porque la
ayuda se abre por clic/Enter/Espacio/tacto, sin depender del hover. Recibe content,
label accesible, side, variant, magnetic (true), children como texto/icono del
activador y open/onOpenChange o defaultOpen. Reutiliza Button: no pasar otro botón
como children. El mensaje queda anclado a un wrapper quieto. Cierra con el mismo
botón, la X, Escape o clic fuera; devuelve foco al activador al cerrar con teclado.
Contenido breve, sin instrucciones esenciales ni controles aportados por el
consumidor. Sin Portal para heredar colores; evitar ancestros con clipping.
Activador ? compacto de 32 px mediante CSS local, símbolo de 1.6rem/700 y burbuja sin triángulo. Reutiliza Button sin copiar lógica ni agregar variantes globales. Entrada de 300 ms, salida de 120 ms y animaciones desactivadas con movimiento reducido.

## Navegación del sitio

Navbar coordina exclusión entre menú y paleta. items es una lista de
`{ href, label, description? }` con href únicos. Anclas locales disparan morphing;
otras rutas/URLs conservan navegación nativa. Destinos locales deben existir y
tener tabIndex={-1} para recibir foco.

SiteMenu y PalettePanel pueden abrirse individualmente sin Navbar. Su ref expone
close(): Promise<void>, que termina al concluir la salida. onRequestOpen(open)
es opcional y permite que un coordinador cierre el otro panel antes de abrir.
PalettePanel sigue necesitando valores controlados y sus callbacks.

SectionTransition recibe navbarRef explícito: no busca cabeceras globalmente.
Sin él cubre desde arriba. Su ref expone play(onCovered) y cancel(). El menú y
la paleta contienen identidad Quokka y una plantilla de autenticación sin rutas:
son piezas del sitio, no un sistema genérico de login.

## Normas de extensión y límites

- Mantener datos, red, autenticación y validación en consumidores.
- Cada animación limpia listeners, observers y tweens al desmontar.
- Respetar movimiento reducido y alternativas por teclado/táctil.
- No modificar transforms de otra pieza.
- Títulos: Source Sans 3 800; texto: Source Sans 3 400; pills: Geist Mono 500–700;
  acentos editoriales y nombres de demos: Fraunces.
- Las pruebas de render comprueban composición y estructura accesible; no
  sustituyen pruebas de interacción y revisión visual en navegador.

## DemoCard

Importar `@/components/cards/demo-card`. Variante visual compuesta sobre Card,
independiente de CardSlider: recibe `title`, `preview` (slot React),
`description` (se revela con hover/foco), `demoHref` opcional, `surface` (muted),
`tilt` (true), `className` y atributos del article. Sin URL no muestra acción.
La vista previa ocupa una proporción 16:10 y el nombre usa Source Sans 3 600.
Imagen cover sin bandas; título y acceso sobre un panel deep oscuro y con blur.
La capa de fondo se extiende 3rem hacia arriba y usa degradado/máscara para
introducir oscuridad y desenfoque progresivamente, sin un borde superior duro.
El panel crece hacia arriba para revelar la descripción; en táctil se muestra
completa. El marco conserva el tilt. No usar enlaces envolviendo toda la imagen:
el gesto sobre ella pertenece al slider, la acción pertenece a su botón.
El ancho lo define el layout; demo-showcase amplía únicamente este escaparate.
Las imágenes de public/previews son capturas reales del laboratorio, estáticas;
reemplazarlas por capturas de cada sitio cuando estén listas las demos finales.
`DemoPreview` recibe `src`, `alt`, `sizes` y `shader` (true). Mantiene un img
accesible, sin arrastre nativo, y un canvas decorativo que aplica ondas y
separación RGB según la velocidad horizontal. Usa WebGL nativo, sin Three.js.
El canal PreviewMotionContext vive en cada CardSlider y no renderiza React por
frame. Fuera del slider o con shader=false, movimiento reducido, o WebGL no
disponible se conserva la imagen cover. El efecto vuelve a cero en 650 ms,
no mantiene un ticker en reposo y se cancela fuera de pantalla/pestaña oculta.
El hook limpia sus observers, suscripción, tween y recursos GL al desmontar.
No cargamos iframes. Referencia: https://codepen.io/GreenSock/pen/EaVbXeM.

`DemoCard locked={true}` omite por completo el slot preview, título,
descripción y enlace del proyecto. Muestra contenido genérico y la textura
`public/previews/locked.svg` mediante DemoPreview, con el mismo shader.
`locked` lo decide el consumidor; la card no conoce usuarios ni sesiones.
La página arranca bloqueada y su botón Registrarse (prueba) alterna estilos
mediante estado local, sin registro real ni persistencia. Al integrar cuentas,
el servidor deberá validar el acceso y entregar solo los datos autorizados.


Tipografía de Button: Source Sans 3, peso 600, letter-spacing 0 y line-height 1.1. Referencia md: 1.5rem; sm: 1.333333rem; lg: 1.666667rem. Los tres tamaños conservan sus paddings y la proporción tipográfica previa entre tamaños. Las previews de DemoCard usan un clip-path redondeado además de overflow para recortar también el shader durante la inclinación 3D.

Button se limita al ancho disponible y permite etiquetas en varias líneas (también durante carga y resultado). Los iconos no se comprimen. En móvil, el padding horizontal se limita a 1rem para priorizar el texto; no reducir la fuente ni truncar la etiqueta para resolver desbordamientos.
El radio de Button se limita a 2rem: conserva la píldora en una línea y evita recortar texto cuando el contenido crece en alto.

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
