// Render real de React: verifica composición e IDs sin navegador ni mocks
// del árbol de componentes. Los gestos y GSAP se prueban por separado.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const root = path.resolve(__dirname, "..");
const cache = new Map();

function load(file) {
  const absolute = path.resolve(root, file);
  if (cache.has(absolute)) return cache.get(absolute).exports;
  const loaded = { exports: {} };
  cache.set(absolute, loaded);
  const source = ts.transpileModule(fs.readFileSync(absolute, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const resolve = name => {
    if (name.endsWith(".css")) return {};
    if (!name.startsWith("@/") && !name.startsWith(".")) return require(name);
    const base = name.startsWith("@/") ? path.join(root, name.slice(2)) : path.resolve(path.dirname(absolute), name);
    const candidate = [base, `${base}.js`, `${base}.jsx`].find(item => fs.existsSync(item) && fs.statSync(item).isFile());
    if (!candidate) throw new Error(`No se encontró ${name}`);
    return load(candidate);
  };
  new Function("require", "module", "exports", source)(resolve, loaded, loaded.exports);
  return loaded.exports;
}

const h = React.createElement;
test("FlipCard mantiene accesible solo la cara mostrada y refleja su estado controlado", () => {
  const FlipCard = load("components/ui/FlipCard.jsx").default;
  const front = renderToStaticMarkup(h(FlipCard, {
    front: h("h3", null, "Persona"), back: h("p", null, "Responsabilidades"),
    flipped: false, ariaLabel: "Girar tarjeta de Persona", draggable: false,
  }));
  assert.match(front, /role="button"[^>]*aria-pressed="false"/);
  assert.match(front, /flip-card__face--back" aria-hidden="true" inert=""/);
  const back = renderToStaticMarkup(h(FlipCard, {
    front: "Persona", back: "Responsabilidades", flipped: true,
  }));
  assert.match(back, /aria-pressed="true"/);
  assert.match(back, /flip-card__face--front" aria-hidden="true" inert=""/);
});

test("la galería del equipo conserva integrantes, imágenes locales y controles con IDs propios", () => {
  const Gallery = load("components/portfolio/team-gallery.jsx").default;
  const { TEAM } = load("lib/site-content.js");
  assert.equal(renderToStaticMarkup(h(Gallery, { members: [] })), "");
  const html = renderToStaticMarkup(h(React.Fragment, null,
    h(Gallery, { members: TEAM }), h(Gallery, { members: TEAM })));
  for (const member of TEAM) {
    assert.ok(html.includes(member.name));
    if (member.portrait) assert.ok(fs.existsSync(path.join(root, "public", member.portrait)));
  }
  assert.match(html, /Integrantes de Quokka/);
  assert.match(html, /aria-label="Personas: anterior"/);
  assert.match(html, /aria-label="Personas: siguiente"/);
  assert.match(html, /aria-live="polite"/);
  assert.doesNotMatch(html, /picsum.photos|fonts.googleapis.com/);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (const match of html.matchAll(/aria-(?:controls|describedby)="([^"]+)"/g)) {
    for (const id of match[1].split(" ")) assert.ok(ids.includes(id));
  }
});

test("CardSwap conserva las demos personalizadas y deja accesible solo la tarjeta frontal", () => {
  const Slider = load("components/ui/card-slider.jsx").default;
  assert.equal(renderToStaticMarkup(h(Slider, null)), "");
  const html = renderToStaticMarkup(h(Slider, { label: "Proyectos" },
    h("a", { key: "one", href: "/uno" }, "Primera demo"),
    h("a", { key: "two", href: "/dos" }, "Segunda demo")));
  assert.match(html, /class="card-swap"/);
  assert.match(html, /Primera demo/);
  assert.match(html, /Segunda demo/);
  assert.equal([...html.matchAll(/class="card-swap-slot"/g)].length, 2);
  assert.equal([...html.matchAll(/\binert=""/g)].length, 1);
  assert.equal([...html.matchAll(/<button\b/g)].length, 2);
  assert.doesNotMatch(html, /images.unsplash.com|Golden hour/);
});

test("el portfolio usa el equipo real, destinos existentes y propuestas sin enlaces inventados", () => {
  const { TEAM, SITE_LINKS, PROJECTS } = load("lib/site-content.js");
  const Page = load("components/portfolio/portfolio-page.jsx").default;
  const html = renderToStaticMarkup(h(load("hooks/use-appearance.jsx").AppearanceProvider, null, h(Page)));
  for (const member of TEAM) assert.ok(html.includes(member.name));
  assert.equal(TEAM.length, 5);
  assert.doesNotMatch(html, /Yuji|Megumi|Nobara|Satoru|Maki|hola@dominio|LinkedIn/);
  for (const item of SITE_LINKS) assert.ok(html.includes(`id="${item.href.slice(1)}"`), item.href);
  assert.ok(PROJECTS.every(project => !project.demoHref));
  assert.match(html, /Mensaje detallado/);
  assert.match(html, /envío de consultas estará disponible/);
  assert.equal([...html.matchAll(/class="section-fold-heading/g)].length, 7);
  assert.doesNotMatch(html, /<h3[^>]*section-fold-heading/);
  assert.match(html, /class="halftone-reveal"/);
  assert.match(html, /alt="Quokka, mascota del equipo"/);
});

test("la marca del login regresa a la portada y no a una sección inexistente", () => {
  const Login = load("components/navigation/login-page.jsx").default;
  const html = renderToStaticMarkup(h(load("hooks/use-appearance.jsx").AppearanceProvider, null, h(Login)));
  assert.match(html, /href="\/" aria-label="Quokka Studio, ir al inicio"/);
  assert.doesNotMatch(html, /href="#inicio"/);
});

test("los presets de movimiento se consumen sin filtrarse al DOM", () => {
  const Button = load("components/ui/button.jsx").default;
  const Card = load("components/ui/card.jsx").default;
  const html = renderToStaticMarkup(h("div", null,
    h(Button, { motion: "expressive", magnetic: false }, "Explorar"),
    h(Card, { motion: "subtle", tilt: true }, "Contenido legible")));
  assert.match(html, /Explorar/);
  assert.match(html, /Contenido legible/);
  assert.doesNotMatch(html, /\bmotion=|\bmagnetic=|opacity:\s*0|visibility:\s*hidden/);
});

test("DemoCard bloqueada no monta contenido ni enlaces de la demo real", () => {
  const Demo = load("components/cards/demo-card.jsx").default;
  function PrivatePreview() { throw new Error("No debe montarse la preview privada"); }
  const html = renderToStaticMarkup(h(Demo, { locked: true, title: "Título reservado",
    description: "Descripción reservada", demoHref: "/demo-privada", preview: h(PrivatePreview) }));
  assert.doesNotMatch(html, /Título reservado|Descripción reservada|demo-privada|href=/);
  assert.match(html, /Solo para miembros/);
  assert.match(html, /previews\/locked.svg/);
  assert.doesNotMatch(html, /<canvas/);
});

test("marquee se compone sin la página, oculta sus copias a lectores y omite listas vacías", () => {
  const Marquee = load("components/ui/marquee.jsx").default;
  assert.equal(renderToStaticMarkup(h(Marquee, { items: ["", " "] })), "");
  const html = renderToStaticMarkup(h(Marquee, { items: ["Diseño", "Código"], label: "Nuestro proceso", speed: 55 }));
  assert.match(html, /role="region" aria-label="Nuestro proceso"/);
  assert.match(html, /<p class="quokka-marquee-summary">Diseño · Código<\/p>/);
  assert.match(html, /class="quokka-marquee-viewport" aria-hidden="true"/);
  assert.equal([...html.matchAll(/<button\b/g)].length, 0);
  assert.match(html, /tabindex="0"/);
  assert.match(html, /Espacio para pausar o reanudar/);
  assert.doesNotMatch(html, /quokka-marquee-controls/);
});

test("select y opciones conservan contratos nativos, grupos independientes y descripciones válidas", () => {
  const Select = load("components/ui/select.jsx").default;
  const Checkbox = load("components/ui/checkbox.jsx").default;
  const RadioGroup = load("components/ui/radio-group.jsx").default;
  const options = [{ value: "a", label: "Primera" }, { value: "b", label: "Segunda", disabled: true }];
  const html = renderToStaticMarkup(h(React.Fragment, null,
    h(Select, { label: "Proyecto", name: "project", defaultValue: "web", required: true, error: "Revisá la opción" },
      h("option", { value: "web" }, "Web")),
    h(Checkbox, { label: "Novedades", name: "updates", value: "yes", defaultChecked: true, description: "Opcional" }),
    h(RadioGroup, { label: "Etapa", options, defaultValue: "a", error: "Elegí una" }),
    h(RadioGroup, { label: "Otro grupo", options, value: "b", onValueChange() {} })));
  assert.match(html, /<select[^>]*name="project"/);
  // Radix registra las opciones al hidratar; SSR conserva el control para
  // FormData y el trigger accesible. La selección se verifica en navegador.
  assert.match(html, /role="combobox"[^>]*aria-expanded="false"[^>]*aria-required="true"/);
  assert.match(html, /type="checkbox"[^>]*checked=""/);
  const groups = [...html.matchAll(/type="radio"[^>]*name="([^"]+)"/g)].map(match => match[1]);
  assert.equal(groups.length, 4);
  assert.equal(groups[0], groups[1]);
  assert.equal(groups[2], groups[3]);
  assert.notEqual(groups[0], groups[2]);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (const match of html.matchAll(/(?:for|aria-describedby)="([^"]+)"/g)) {
    for (const id of match[1].split(" ")) assert.ok(ids.includes(id));
  }
});

test("la ayuda reutiliza un botón y se puede controlar externamente sin crear formularios ni enlaces", () => {
  const Tooltip = load("components/ui/tooltip.jsx").default;
  const html = renderToStaticMarkup(h(Tooltip, { label: "Ayuda del campo", content: "Mensaje", open: false }, "Ayuda"));
  assert.match(html, /<button[^>]*type="button"/);
  assert.match(html, /aria-haspopup="dialog"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /aria-label="Ayuda del campo"/);
  assert.doesNotMatch(html, /<a\b|<form\b/);
});

test("dos navbars no duplican IDs y todos sus controles y títulos apuntan al panel propio", () => {
  const Navbar = load("components/navigation/navbar.jsx").default;
  const props = { items: [{ href: "#destino", label: "Destino" }], theme: "eucalipto", mode: "light", onThemeChange() {}, onModeChange() {} };
  const html = renderToStaticMarkup(h(React.Fragment, null, h(Navbar, props), h(Navbar, props)));
  assert.doesNotMatch(html, /Navegación principal|site-navbar-login|>Ingresar</);
  assert.match(html, /href="\/iniciar-sesion"/);
  assert.doesNotMatch(html, /site-menu-close/);
  assert.equal([...html.matchAll(/site-navbar-icon-control/g)].length, 4);
  assert.equal([...html.matchAll(/class="site-reading-progress"/g)].length, 2);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (const match of html.matchAll(/\saria-(?:controls|labelledby)="([^"]+)"/g)) {
    for (const id of match[1].split(" ")) assert.ok(ids.includes(id), `Referencia sin destino: ${id}`);
  }
});

test("los encabezados conservan nivel, nombre accesible y énfasis sin depender de JavaScript", () => {
  const Heading = load("components/ui/animated-heading.jsx").default;
  const html = renderToStaticMarkup(h(Heading, { as: "h1", id: "title" },
    "Código con", h("br"), h("mark", { className: "word-marker" }, "instinto."),
    h("span", { "aria-hidden": true }, "✳")));
  assert.match(html, /<h1[^>]*id="title"/);
  assert.match(html, /aria-label="Código con instinto\."/);
  assert.match(html, /<mark class="word-marker">/);
  assert.match(html, /<span aria-hidden="true">/);
  assert.doesNotMatch(html, /opacity:0|data-heading-visible="false"/);
});

test("la página evita texto por letra, clones del equipo y bloqueos de demos repetidos", () => {
  const Page = load("components/portfolio/portfolio-page.jsx").default;
  const { PROJECTS } = load("lib/site-content.js");
  const html = renderToStaticMarkup(h(load("hooks/use-appearance.jsx").AppearanceProvider, null, h(Page)));
  assert.doesNotMatch(html, /variable-proximity|Las demos te esperan|Explorar vista de prueba/);
  assert.equal([...html.matchAll(/class="circular-gallery-card-slot"/g)].length, 5);
  assert.equal([...html.matchAll(/class="halftone-reveal-canvas"/g)].length, 1);
  assert.doesNotMatch(html, /demo-preview-shader/);
  for (const project of PROJECTS) assert.ok(html.includes(project.title.replaceAll("&", "&amp;")));
});

test("campos repetidos conservan label, ayuda y error propios; el consumidor conserva atributos nativos", () => {
  const Input = load("components/ui/input.jsx").default;
  const html = renderToStaticMarkup(h(React.Fragment, null,
    h(Input, { label: "Nombre", name: "nombre", description: "Ayuda", error: "Requerido", required: true }),
    h(Input, { label: "Nombre", name: "otro", description: "Otra ayuda" })));
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (const match of html.matchAll(/(?:for|aria-describedby)="([^"]+)"/g)) {
    for (const id of match[1].split(" ")) assert.ok(ids.includes(id));
  }
  assert.match(html, /name="nombre"/);
  assert.match(html, /aria-invalid="true"/);
});

test("las variantes de card se componen sin la página de pruebas y sin URLs ficticias", () => {
  const Project = load("components/cards/project-card.jsx").default;
  const Team = load("components/cards/team-card.jsx").default;
  const Skill = load("components/cards/skill-card.jsx").default;
  const Demo = load("components/cards/demo-card.jsx").default;
  const html = renderToStaticMarkup(h(React.Fragment, null,
    h(Project, { title: "Demo", description: "Proyecto" }),
    h(Team, { name: "Bautista", role: "Frontend", description: "Equipo" }),
    h(Skill, { title: "React", description: "Interfaces" }),
    h(Demo, { title: "Demo visual", description: "Vista previa", preview: h("svg", { "aria-hidden": true }) })));
  assert.equal([...html.matchAll(/<article\b/g)].length, 4);
  assert.doesNotMatch(html, /href=/);
});

test("Button admite un resultado JSX sin convertirlo a texto y bloquea enlaces durante la carga", () => {
  const Button = load("components/ui/button.jsx").default;
  const result = renderToStaticMarkup(h(Button, { status: "success", successLabel: h("strong", null, "Listo") }, "Enviar"));
  assert.match(result, /<strong>Listo<\/strong>/);
  const loading = renderToStaticMarkup(h(Button, { href: "/demo", loading: true }, "Abrir"));
  assert.doesNotMatch(loading, /href=/);
  assert.match(loading, /aria-disabled="true"/);
});

test("el footer compacto conserva navegación y el login ofrece campos conectables", () => {
  const Footer = load("components/layout/footer.jsx").default;
  const html = renderToStaticMarkup(h(Footer));
  assert.doesNotMatch(html, /Tenés un proyecto|Escribinos|quokka-footer-cta/);
  assert.match(html, /quokka-footer-nav-grid/);
  const Login = load("components/forms/login-form.jsx").default;
  const form = renderToStaticMarkup(h(Login));
  assert.match(form, /name="email"/);
  assert.match(form, /type="password"/);
  assert.match(form, /autoComplete="current-password"/);
  assert.match(form, /Iniciar sesión/);
  assert.match(form, /inicio de sesión estará disponible/);
});

test("SwipeToast conserva anuncio y controles; Sling separa mascota del enlace de marca", () => {
  const Toast = load("components/ui/SwipeToast.jsx").default;
  const toast = renderToStaticMarkup(h(Toast, { title:"Listo", description:"Notificación de prueba", closeButton:true, actionLabel:"Deshacer" }));
  assert.match(toast, /role="status"/);
  assert.match(toast, /aria-live="polite"/);
  assert.match(toast, /Cerrar notificación/);
  assert.match(toast, /Deshacer/);
  const closed = renderToStaticMarkup(h(Toast, { open:false }));
  assert.match(closed, /data-phase="gone"/);
  assert.match(closed, /inert=""/);
  const Navbar = load("components/navigation/navbar.jsx").default;
  const nav = renderToStaticMarkup(h(Navbar));
  assert.match(nav, /aria-label="Quokka, volver al inicio"/);
  assert.match(nav, /Estirá y soltá para hacer llover Quokkas/);
  assert.doesNotMatch(nav, /<a[^>]*>\s*<[^>]*sling-button/);
});
