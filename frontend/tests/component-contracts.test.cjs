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
test("el portfolio usa el equipo real, destinos existentes y propuestas sin enlaces inventados", () => {
  const { TEAM, SITE_LINKS, PROJECTS } = load("lib/site-content.js");
  const Page = load("components/portfolio-preview.jsx").default;
  const html = renderToStaticMarkup(h(Page));
  for (const member of TEAM) assert.ok(html.includes(member.name));
  assert.equal(TEAM.length, 5);
  assert.doesNotMatch(html, /Yuji|Megumi|Nobara|Satoru|Maki|hola@dominio|LinkedIn/);
  for (const item of SITE_LINKS) assert.ok(html.includes(`id="${item.href.slice(1)}"`), item.href);
  assert.ok(PROJECTS.every(project => !project.demoHref));
  assert.match(html, /Mensaje detallado/);
  assert.match(html, /todavía no envía datos/);
});

test("los presets de movimiento se consumen sin filtrarse al DOM y Reveal conserva contenido en SSR", () => {
  const Button = load("components/ui/button.jsx").default;
  const Card = load("components/ui/card.jsx").default;
  const Reveal = load("components/ui/reveal.jsx").default;
  const html = renderToStaticMarkup(h(Reveal, null,
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
  assert.match(html, /<canvas[^>]*aria-hidden="true"/);
});

test("marquee se compone sin la página, oculta sus copias a lectores y omite listas vacías", () => {
  const Marquee = load("components/ui/marquee.jsx").default;
  assert.equal(renderToStaticMarkup(h(Marquee, { items: ["", " "] })), "");
  const html = renderToStaticMarkup(h(Marquee, { items: ["Diseño", "Código"], label: "Nuestro proceso", speed: 55 }));
  assert.match(html, /role="region" aria-label="Nuestro proceso"/);
  assert.match(html, /<p class="quokka-marquee-summary">Diseño · Código<\/p>/);
  assert.match(html, /class="quokka-marquee-viewport" aria-hidden="true"/);
  assert.equal([...html.matchAll(/<button\b/g)].length, 1);
  assert.match(html, /aria-pressed="false"/);
  assert.match(html, /quokka-marquee-controls-hidden/);
  const withControls = renderToStaticMarkup(h(Marquee, { items: ["Diseño"], showControls: true }));
  assert.doesNotMatch(withControls, /quokka-marquee-controls-hidden/);
  assert.match(withControls, /Ideas en movimiento<\/span>/);
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
  const Navbar = load("components/navbar.jsx").default;
  const props = { items: [{ href: "#destino", label: "Destino" }], theme: "eucalipto", mode: "light", onThemeChange() {}, onModeChange() {} };
  const html = renderToStaticMarkup(h(React.Fragment, null, h(Navbar, props), h(Navbar, props)));
  assert.doesNotMatch(html, /Navegación principal|site-navbar-login|>Ingresar</);
  assert.match(html, /Iniciar sesión/);
  assert.equal([...html.matchAll(/class="site-reading-progress"/g)].length, 2);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (const match of html.matchAll(/\saria-(?:controls|labelledby)="([^"]+)"/g)) {
    for (const id of match[1].split(" ")) assert.ok(ids.includes(id), `Referencia sin destino: ${id}`);
  }
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
