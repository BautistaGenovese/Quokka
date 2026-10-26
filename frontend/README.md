# Frontend de Quokka Studio

La aplicación pública vive en / y el acceso en /iniciar-sesion. El login admite email/contraseña y Google Identity Services. La página principal ya no es un laboratorio ni una experiencia aparte. Se retiraron las rutas /componentes y /experiencia y el HTML anterior.

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

- app/: rutas y layout del App Router. page.js compone el portfolio; iniciar-sesion/page.jsx expone el login. panel/page.jsx expone una sola AdminPage con módulos y anclas.
- components/panel/: AdminPage, módulos de administración, proveedor del catálogo, CRUD de servicios y tecnologías y bandeja preparada para los endpoints de Ignacio.
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

El panel se abre en `/panel`. Servicios y tecnologías consumen la API en `NEXT_PUBLIC_API_URL` (por defecto `http://localhost:4000`), compartida con el formulario de contacto. La portada consume esos mismos catálogos públicos: ya no depende de las listas estáticas de servicios y herramientas. «Las herramientas» muestra hasta cuatro tecnologías sin numerar; si hay más, rota los nombres automáticamente cada tres segundos solo mientras la sección está visible. Cada fila enmascara el cambio vertical; movimiento reducido detiene la animación. En escritorio, la lista toma el alto del texto contiguo; en móvil se apila y conserva filas de al menos 5rem. Requiere backend y PostgreSQL disponibles; un catálogo vacío no se rellena con ejemplos. Después de administrar contenido, al volver al portafolio se vuelven a consultar los datos.

`/panel#consultas-admin` consume `GET /api/operador/contactos` y `POST /api/operador/contactos/:id/responder`. El backend controla el acceso por rol; la vista muestra estados de carga y error, distingue tipo y estado, y conserva el borrador si una respuesta falla.

AdminPage compone ServiciosAdmin, TecnologiasAdmin, ConsultasAdmin, UsuariosAdmin, ProyectosAdmin y MetricasAdmin. ProyectosAdmin monta ProjectsManager (CRUD para administradores, lista de solo lectura para operadores); MetricasAdmin monta MetricsManager (gráficos de Recharts con visitas por día y secciones alcanzadas, solo administrador); la portada monta RastreadorVisitas y el detalle de proyecto registra su visita (ver BACKEND-INTEGRATION.md, "Métricas de visitas"). El navbar, menú y paleta son los existentes; los módulos se recorren con anclas dentro de `/panel`, sin subpáginas. El navbar público incluye el icono de acceso al panel. El selector de tecnologías reutiliza Select y permite agregar varias opciones y quitar sus etiquetas. Los estilos de composición están en `styles/panel.css`.

AppearanceProvider se monta una sola vez en app/layout.js, envolviendo páginas y efectos globales. useAppearance devuelve theme, mode, setTheme y setMode. Conserva la selección durante navegación interna; no usa almacenamiento persistente. El estado inicial es Sonrisa/claro.

Google Identity Services usa `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, un OAuth Client ID de tipo Aplicación web que el navegador necesita para iniciar el flujo. Es un identificador público, no un secreto: no configurar el Client Secret en variables `NEXT_PUBLIC_*` ni incluirlo en el frontend. El backend verifica la credencial con su variable privada `GOOGLE_CLIENT_ID`, que debe corresponder al mismo cliente OAuth; configurar los orígenes autorizados de JavaScript para cada host (por ejemplo, localhost y el dominio de producción). El botón de Google usa el estilo oscuro de GIS cuando el tema activo es oscuro, incluida la preferencia del sistema.

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

Navbar recibe items, homeHref, theme, mode, onThemeChange y onModeChange. homeHref usa #inicio en la portada y / en páginas internas como el login. items contiene href, label y description opcional. Coordina el cierre entre SiteMenu y PalettePanel. Las acciones tienen iconos animados, nombres accesibles y relleno radial sin magnetismo.

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

ContactForm, desde @/components/forms/contact-form, valida nombre de al menos tres caracteres, email válido, categoría y mensaje de al menos quince caracteres. onSubmitMessage({ name, email, type, message }) debe devolver una promesa; en la portada se conecta con `submitContactRequest` (`@/lib/contact-api`) hacia `POST /api/contact`. Sin callback solo valida y comunica que el envío aún no está disponible. No muestra éxito de envío ficticio.

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

CardSlider, desde @/components/ui/card-slider, recibe children, label, className y details opcional (un nodo de información por tarjeta, en el mismo orden). Cada hijo necesita una key estable. Una colección vacía no monta slider; cambiar keys reinicia el recorrido. Con details muestra la ficha activa al costado desde 768px y debajo en móvil, fuera de las capas 3D. La portada conserva parallax y arrastre sin tilt individual, vidrio difuminado ni despliegue de texto al hover. Las fichas inactivas conservan su espacio y quedan fuera del foco y los lectores de pantalla. Los controles anterior/siguiente y Pausar/Reanudar aparecen en todos los tamaños; leer con el mouse pausa temporalmente y enfocar una acción de la ficha pausa hasta reanudar explícitamente. Las imágenes, títulos y presentación de los proyectos son públicos y mantienen la misma composición con y sin sesión. La sesión añade tecnologías y acceso al detalle protegido; el enlace de ingreso conserva el regreso al proyecto. La galería aparece inmediatamente después de la portada.

CardSwap ofrece children o items, dimensiones, cardDistance, verticalDistance, depth, skewAmount, visibleCards, delay, autoplay, pauseOnHover, draggable, speed, bounce, parallax, hoverSpread, dim, cardRadius, intro, theme, label, onCardClick y onChange. Card es el wrapper exportado por ese archivo. next()/prev() están disponibles mediante ref. Los items no suministrados no generan tarjetas de ejemplo. La página usa children propios. El temporizador pausa con foco, hover, pestaña oculta, fuera de pantalla y movimiento reducido. Los cambios de prefers-reduced-motion se aplican durante la sesión, cancelando el autoplay y asentando la pila.

CircularGalleryCards recibe items y renderItem, bend, scrollEase, gap, onActiveChange y atributos del contenedor. Ref expone next, prev y goTo. TeamGallery, desde components/portfolio/team-gallery, adapta los integrantes y restablece el frente al cambiar de persona. Solo el slot central es accesible. El motor no duplica miembros.

FlipCard recibe front, back, flipped/defaultFlipped, onFlipChange, axis, flipOnClick, disabled, ariaLabel, dimensiones, radius, background, color, perspective y tilt. Usa rotación CSS y solo la cara activa es accesible. Clic, Enter y Espacio giran; los enlaces internos conservan su propia acción.

useScrollCarousel normaliza unidades y amortigua trackpads. Captura únicamente gestos horizontales o Shift + rueda dentro del componente; la rueda vertical, el zoom y los campos conservan su comportamiento nativo. capturePointer/releasePointer centralizan la tolerancia a punteros expirados. No llamar directamente a releasePointerCapture en consumidores.

Equipo y demos ajustan su escenario al alto de la ventana, sin ocultar contenido con alturas fijas de sección. El equipo recorre todo el ancho, mantiene las fotos de GitHub y agrupa sus controles con el enlace de perfil. Los catálogos y proyectos reservan espacio durante la carga con placeholders estáticos. Menú y paleta se cierran sin animación al mover el foco fuera del panel, para no cubrir el siguiente control de teclado. Google Identity se carga solo en el formulario de login, si hay un client ID configurado; onReady inicializa el botón sin sondeo periódico.

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

ArrowLink, desde components/ui/arrow-link, reemplaza los enlaces subrayados studio-text-link. Recibe href, direction (left o right), children y atributos nativos de enlace. La flecha circular se desplaza y reaparece al hover o foco; respeta movimiento reducido. Toda el área es un único enlace, sin botones anidados. Login lo usa para volver al estudio.

La foto de perfil y el enlace de cada integrante vienen de `GET /api/github/miembros` (hook `useEquipoGithub`, `lib/github-api.js`); `TEAM` ya no trae `profileHref`. Se emparejan por nombre y, si la API falla, la tarjeta muestra las iniciales y no se dibuja el botón. El footer reutiliza los mismos perfiles de GitHub y conserva iniciales si falla la imagen. En móvil, TeamGallery deja visibles las tarjetas vecinas, ofrece indicadores seleccionables y muestra la posición actual. TeamGallery muestra el GitHub de la tarjeta activa debajo del carrusel, en una pestaña nueva con noopener noreferrer. `next.config.mjs` permite `avatars.githubusercontent.com` en `next/image`.

La portada y sus interacciones son públicas; enviar el formulario de contacto requiere sesión y usa `POST /api/contacto` mediante `submitContactRequest`. El registro, el inicio con email y Google usan la API de autenticación. En un entorno local, el backend requiere `JWT_SECRET` y `GOOGLE_CLIENT_ID` para emitir sesiones locales y validar credenciales de Google. La galería de proyectos lee `GET /api/proyectos`; las propuestas locales de `site-content.js` son solo un respaldo cuando la API falla o no tiene proyectos, y nunca se mezclan con los reales. El detalle `/proyectos/[id]` exige sesión (el 401 del backend es la protección real; la redirección es solo UX) y vuelve al detalle tras iniciar sesión mediante `?next=`, que solo acepta rutas internas.

El avatar de la cuenta autenticada se obtiene de `usuario.foto_perfil_url`, que devuelve el backend en login, Google y `GET /api/auth/me`. `AvatarUsuario` solo muestra imágenes HTTPS de Google; las cuentas locales o las fotos fallidas conservan las iniciales como fallback. `next.config.mjs` permite `googleusercontent.com` en `next/image`.

## CI del pull request

La auditoría de navbar y menú está en `docs/auditoria-navbar-menu.md`. El menú desplaza su tarjeta completa en ventanas bajas; el contenido saliente es inerte y las acciones de cuenta son compactas. La sección activa tiene un marcador visible. El seguimiento de secciones cachea geometrías y las invalida con ResizeObserver. La cubierta global renderiza sus trazados desde el timeline y solo bloquea entradas mientras está activa. `lib/verificacion-sesion.js` comparte `/api/auth/me` entre consumidores con caché de 30 segundos, timeout y protección contra respuestas de cuentas anteriores. Login y detalle ofrecen el mismo salto al contenido que portada y panel. Las regresiones se ejecutan con `npm test`.

.github/workflows/frontend.yml ejecuta instalación reproducible del workspace, lint, todos los tests, auditoría de dependencias de producción y build en Node 24. Se activa en PRs a main y pushes a frontend/main; solo tiene permiso de lectura. Las acciones usadas siguen sus guías oficiales: [checkout](https://github.com/actions/checkout) y [setup-node](https://github.com/actions/setup-node). No publica ni mergea cambios.

La configuración de Tailwind usa únicamente postcss.config.mjs, según la guía local de Next; no existe una segunda cadena de loaders de Turbopack.
