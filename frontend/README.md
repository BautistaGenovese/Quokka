# Frontend de Quokka Studio

La aplicación pública vive en / y el acceso en /iniciar-sesion. La página principal ya no es un laboratorio ni una experiencia aparte. Se retiraron las rutas /componentes y /experiencia y el HTML anterior.

[DESIGN.md](../DESIGN.md) registra las decisiones visuales actuales. [BACKEND-INTEGRATION.md](./BACKEND-INTEGRATION.md) distingue las interfaces preparadas de las funciones de servidor pendientes.

## Desarrollo y validación

Desde la raíz del monorepositorio, con Node.js 20.9 o superior:

~~~sh
npm ci
npm run dev -w frontend
npm run lint -w frontend
npm test -w frontend
npm run build -w frontend
npm run start -w frontend
~~~

El servidor de desarrollo usa localhost:3000. Next descarga las fuentes de Google durante la compilación; una instalación o compilación inicial necesita acceso a los proveedores de dependencias y fuentes. No se necesitan secretos para renderizar el frontend local.

Los tests usan node:test, React SSR y el motor GSAP real donde corresponde. Verifican contratos, IDs, teclado, gestos, captura expirada, navegación, limpieza del footer y límites de la lluvia. La revisión visual de móvil, contraste y movimiento debe completarse en un navegador real; un build exitoso no la reemplaza.

## Estructura

- app/: rutas y layout del App Router. page.js compone el portfolio; iniciar-sesion/page.jsx expone el login.
- components/portfolio/: hero, títulos de sección, equipo, proyectos y composición pública.
- components/navigation/: navbar, menú, paleta, transiciones y Sling del símbolo.
- components/layout/: Section, footer, detalles de marca, seguidor y efectos de Quokka.
- components/forms/: ContactForm y LoginForm, con adaptadores opcionales para servidor.
- components/cards/: ProjectCard, DemoCard, TeamCard, SkillCard y DemoPreview.
- components/ui/: primitivas, campos y componentes de movimiento reutilizables.
- hooks/: controladores de apariencia, movimiento, scroll y ciclo de vida.
- lib/: contenido local, paletas, parámetros de movimiento, navegación, captura segura y física.
- styles/: estilos compartidos y del portfolio. El CSS específico de piezas vendorizadas permanece junto a su JSX.
- public/: ilustración principal y previews locales utilizadas.
- tests/: regresiones ejecutables con npm test.

app/componentes era una URL de catálogo, no otra biblioteca. Fue eliminada; components es el único directorio de código de componentes. Las primitivas de biblioteca como Checkbox, RadioGroup y las variantes de cards se mantienen porque tienen contratos reutilizables y tests, aunque no todas se rendericen en la portada.

## Apariencia y superficies

AppearanceProvider se monta una sola vez en app/layout.js, envolviendo páginas y efectos globales. useAppearance devuelve theme, mode, setTheme y setMode. Conserva la selección durante navegación interna; no usa almacenamiento persistente. El estado inicial es Sonrisa/claro.

Paletas: sonrisa, lagorosa, ultramar, pitaya y verbena. Sus IDs exactos y muestras están en lib/palettes.js; los selectores CSS y tokens están en app/globals.css. Modo: light, dark o system. system retira data-theme para seguir el sistema operativo.

Section, desde @/components/layout/section, admite surface, as, className, children y atributos/ref nativos. Superficies: page, card, muted, deep, primary, secondary, accent. Una superficie inválida vuelve a page. Cada Section reinicia los roles --s-*; no recibe colores por props ni guarda el tema.

~~~jsx
<Section surface="deep" className="p-8">
  <Button>Acción sobre profundo</Button>
  <Section as="article" surface="card" className="mt-6 p-8">
    <Button variant="secondary" magnetic={false}>Acción local</Button>
  </Section>
</Section>
~~~

## Navegación y layout

Navbar recibe items, homeHref, theme, mode, onThemeChange y onModeChange. items contiene href, label y description opcional. Coordina el cierre entre SiteMenu y PalettePanel. Las acciones tienen iconos animados, nombres accesibles y relleno radial sin magnetismo.

SiteMenu expone close() mediante ref. Su altura depende del contenido con un mínimo adaptable; el acceso de login es el último bloque y se mantiene al pie del panel. Los enlaces no bloquean combinaciones nativas como Ctrl+clic. No usar showModal: el panel es no modal y permite interactuar con el fondo.

NavigationTransition está una sola vez en el layout. Captura enlaces internos válidos, cierra menú, cubre, navega y revela cuando cambia la ruta. Omite enlaces externos, descargas, atajos y anclas inexistentes. SectionTransition es su motor SVG; no montar otra instancia en cada footer o menú.

Footer, desde @/components/layout/footer, recibe links, homeHref y teamHref. Tiene navegación en dos columnas, equipo, GitHub, marca y créditos; no incluye una CTA de contacto repetida. useFooterMotion controla curva y entrada del wordmark, con observadores y animaciones locales que limpian al desmontarse.

## Button y CursorFollower

Import: @/components/ui/button. Props principales: variant (primary, secondary, accent, ghost), size (sm, md, lg), href, children, iconLeft, iconRight, fullWidth, magnetic, strength, maxRotation y motion (subtle o expressive). Admite atributos nativos y ref. Sin href usa button type=button; indicar type=submit para enviar formularios.

status puede ser idle, loading, success o error. loading es un alias de compatibilidad. loadingLabel, successLabel y errorLabel personalizan resultados. disabled, loading y aria-disabled impiden ejecutar botones y enlaces. La aplicación decide cuándo el resultado es real; Button no consulta endpoints.

magnetic=false conserva relleno, foco y presión. Para contenido solo gráfico, proporcionar aria-label y ocultar el icono decorativo con aria-hidden. iconOnlyOnMobile oculta texto visualmente cuando existe un icono, manteniendo el nombre accesible.

Montar un único CursorFollower en el layout. Button y useButtonMotion administran data-cursor-button, data-cursor-fill y data-cursor-ink; los consumidores no deben escribirlos. En táctil y movimiento reducido se usan fallbacks de foco/presión. Los listeners de movimiento son locales al botón, no uno global por control.

## Campos y formularios

Input y Textarea, desde components/ui, comparten FormField. Admiten label, description, error, required, icon, labelAccessory, atributos nativos y ref. Cada instancia genera sus IDs propios; error, ayuda y etiqueta apuntan a su control. El consumidor mantiene los valores y la validación.

Select admite children option/optgroup, value/defaultValue, onValueChange, name, required, disabled y las props de campo. Radix conserva teclado, foco y FormData. ref apunta al trigger, no a un select visible. Las opciones con value vacío actúan como placeholder.

Checkbox comparte ChoiceField. RadioGroup recibe label, name, options, value/defaultValue, onValueChange, description y error. Las opciones admiten value, label, disabled y description. Los grupos sin name usan uno propio. Tooltip recibe label, content, open/onOpenChange o defaultOpen; no crear un segundo botón dentro de su contenido.

ContactForm, desde @/components/forms/contact-form, valida nombre de al menos tres caracteres, email válido, categoría y mensaje de al menos quince caracteres. onSubmitMessage({ name, email, type, message }) debe devolver una promesa. Sin callback solo valida y comunica que el envío aún no está disponible. No muestra éxito de envío ficticio.

LoginForm, desde @/components/forms/login-form, valida email y contraseña no vacía. onSignIn({ email, password }) debe devolver una promesa y resolver la sesión real en la capa de integración. Sin callback no crea sesiones, no guarda credenciales ni hace peticiones. Mantiene autoComplete apropiado y estados de carga/error.

## Cards

Card, desde @/components/ui/card, recibe surface, tilt (true por defecto), motion, children, className, atributos y ref al article interior. className afecta al marco exterior. El marco mide el mouse; el panel interior inclina. No animar desde otro componente el mismo transform del panel.

- ProjectCard: title, description, technologies, preview, demoHref, codeHref; proyecto editorial.
- TeamCard: name obligatorio, role, description, portrait y profileHref; sin portrait usa iniciales.
- SkillCard: title, description, icon, tags, eyebrow; tilt false por defecto para priorizar lectura.
- DemoCard: title, description, preview, demoHref, locked y props de Card. locked muestra una textura genérica sin montar nombre, descripción, preview o enlace privados. No sustituye autorización del backend.
- DemoPreview: src, alt y sizes; usa next/image, sin shader de distorsión.

Omitir URLs elimina acciones. Los slots gráficos informativos requieren texto alternativo. Las variantes no conocen las páginas ni consultan APIs.

## Carruseles y FlipCard

CardSlider, desde @/components/ui/card-slider, recibe children, label y className. Cada hijo necesita una key estable. Una colección vacía no monta slider; cambiar keys reinicia el recorrido. Adapta CardSwap vendorizado a las propuestas, captura rueda dentro de su zona y muestra CarouselMobileControls bajo 768px cuando hay más de una tarjeta.

CardSwap ofrece children o items, dimensiones, cardDistance, verticalDistance, depth, skewAmount, visibleCards, delay, autoplay, pauseOnHover, draggable, speed, bounce, parallax, hoverSpread, dim, cardRadius, intro, theme, label, onCardClick y onChange. Card es el wrapper exportado por ese archivo. next()/prev() están disponibles mediante ref. Los items no suministrados no generan tarjetas de ejemplo. La página usa children propios. El temporizador pausa con foco, hover, pestaña oculta, fuera de pantalla y movimiento reducido.

CircularGalleryCards recibe items y renderItem, bend, scrollEase, gap, onActiveChange y atributos del contenedor. Ref expone next, prev y goTo. TeamGallery, desde components/portfolio/team-gallery, adapta los integrantes y restablece el frente al cambiar de persona. Solo el slot central es accesible. El motor no duplica miembros.

FlipCard recibe front, back, flipped/defaultFlipped, onFlipChange, axis, flipOnClick, disabled, ariaLabel, dimensiones, radius, background, color, perspective y tilt. Usa rotación CSS y solo la cara activa es accesible. Clic, Enter y Espacio giran; los enlaces internos conservan su propia acción.

useScrollCarousel normaliza unidades y amortigua trackpads. Captura la rueda solo dentro del componente; deja zoom y campos nativos. capturePointer/releasePointer centralizan la tolerancia a punteros expirados. No llamar directamente a releasePointerCapture en consumidores.

## Texto, ilustración y marquee

AnimatedHeading, desde components/ui/animated-heading, admite as, children, className y atributos de encabezado. Usarlo solo en títulos importantes. Conserva los nodos de énfasis y un nombre accesible sin depender del pliegue. El texto largo sigue siendo un párrafo normal.

HalftoneReveal conserva una imagen accesible y una mejora WebGL. El hero usa fit=contain, mode=color, shape=dot, reverse y la interacción del mouse; no activa wander. Su bucle duerme fuera de pantalla y limita los dibujos a 30 fps. Movimiento reducido o ausencia de WebGL conserva la imagen.

Marquee recibe items, size (sm/md/lg), speed, direction, followScroll, pauseOnHover, label y className. Lista vacía no monta nada. Una sola copia accesible describe el contenido; las otras son decorativas. Espacio, foco y toque controlan la pausa. No agregar botones superpuestos a su track.

## SwipeToast, Sling y lluvia

SwipeToast, desde components/ui/SwipeToast, recibe title, description, icon, open, onClose(reason), actionLabel, onAction, colores, width, radius, slideMs, settleBounce, swipeDistance, duration, fuse, pauseOnHover, closeButton, inline, dismissible y className. Razones de cierre: timeout, swipe, action, close, escape o programmatic. duration=0 desactiva el vencimiento. fuse=none oculta la línea, no el temporizador. Se anuncia con status y puede descartarse hacia abajo. Un gesto cancelado no descarta.

~~~jsx
<SwipeToast title="Cambios guardados" description="Podés seguir trabajando."
  duration={4000} closeButton onClose={() => setOpen(false)} />
~~~

SlingButton, desde components/ui/SlingButton, conserva el resorte de React Bits y añade onTap, separado de onSend. Clic/Enter usa onTap (o onSend como fallback); un arrastre cargado usa onSend. hint personaliza las instrucciones accesibles. Colores, size, strokeWidth, armAt, maxPull, launchSpeed, recoil, flight, particles, spread, axis, tapSends, disabled y ariaLabel configuran el gesto. Cancelar no envía. El elástico es una sola línea punteada.

QuokkaSling compone la mascota en el navbar: clic sube suavemente en la portada, vuelve al estudio bajo cobertura desde login, y el lanzamiento emite quokka:rain. QuokkaEffects escucha ese evento y administra la lluvia y su toast. No montar instancias adicionales en cada página.

La física de lib/quokka-rain.js usa un solo loop, con tope de 16 partículas (10 bajo 640px), actualizaciones limitadas a 60 fps y expiración de ocho segundos. No hay suelo ni colisiones. Se pueden agarrar/lanzar con captura segura; salen de pantalla sin acumularse. Repetir reinicia el pool. Escape, navegación, pestaña oculta y movimiento reducido detienen la lluvia.

## Dependencias y fuentes adaptadas

Dependencias de runtime: React/React DOM, Next.js, Tailwind/PostCSS, GSAP y @gsap/react, Motion, Radix y Lucide. Los componentes React Bits están vendorizados y adaptados en components/ui. No se requiere shadcn CLI ni paquetes Hugeicons: los iconos usan Lucide.

No hay VariableProximity, FoldText externo, GradualBlur de ocho capas, shader de previews, SVGs de plantilla Next ni configuración de registros Pro. El pliegue es CSS local y el navbar tiene una sola capa de blur. No reintroducir listeners globales por letra ni bucles inactivos.

## Integración pendiente

La portada y sus interacciones son públicas. Contacto y login tienen validación y contratos de callback, pero no integraciones de envío/autenticación. Los proyectos son propuestas locales, no demos desplegadas ni repositorios sincronizados automáticamente. Estas limitaciones son parte explícita de la entrega de frontend.

## CI del pull request

.github/workflows/frontend.yml ejecuta instalación reproducible del workspace, lint, todos los tests, auditoría de dependencias de producción y build en Node 24. Se activa en PRs a main y pushes a frontend/main; solo tiene permiso de lectura. Las acciones usadas siguen sus guías oficiales: [checkout](https://github.com/actions/checkout) y [setup-node](https://github.com/actions/setup-node). No publica ni mergea cambios.

La configuración de Tailwind usa únicamente postcss.config.mjs, según la guía local de Next; no existe una segunda cadena de loaders de Turbopack.
