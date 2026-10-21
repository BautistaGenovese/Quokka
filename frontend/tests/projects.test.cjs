const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const cache = new Map();

function load(file) {
  const absolute = path.resolve(root, file);
  if (cache.has(absolute)) return cache.get(absolute).exports;
  const loaded = { exports: {} };
  cache.set(absolute, loaded);
  const source = ts.transpileModule(fs.readFileSync(absolute, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const resolve = name => load(path.resolve(path.dirname(absolute), name.endsWith(".js") ? name : `${name}.js`));
  new Function("require", "module", "exports", source)(resolve, loaded, loaded.exports);
  return loaded.exports;
}

const { safeNextPath } = load("lib/safe-redirect.js");
const { isHttpUrl, isCloudinaryUrl, toGalleryCards, validateProjectForm, PROJECT_IMAGE_FALLBACK } = load("lib/projects.js");

test("safeNextPath acepta rutas relativas y rechaza redirecciones externas", () => {
  assert.equal(safeNextPath("/proyectos/3"), "/proyectos/3");
  assert.equal(safeNextPath("/proyectos/3?a=1#x"), "/proyectos/3?a=1#x");
  for (const bad of ["//evil.com", "/\\evil.com", "https://evil.com", "javascript:alert(1)", "proyectos/3", "/a\r\nb", "/a\tb", null, undefined, 7, ""]) {
    assert.equal(safeNextPath(bad), "/", String(bad));
  }
  assert.equal(safeNextPath(null, "/panel"), "/panel");
});

test("isHttpUrl solo admite http/https sin credenciales", () => {
  assert.equal(isHttpUrl("https://demo.example.com/app"), true);
  assert.equal(isHttpUrl("http://demo.example.com"), true);
  for (const bad of ["javascript:alert(1)", "ftp://x.com", "https://user@host.com", "demo.example.com", "", null]) assert.equal(isHttpUrl(bad), false, String(bad));
});

test("isCloudinaryUrl exige https y el host exacto de Cloudinary", () => {
  assert.equal(isCloudinaryUrl("https://res.cloudinary.com/demo/image/upload/x.jpg"), true);
  for (const bad of ["http://res.cloudinary.com/demo/x.jpg", "https://res.cloudinary.com.evil.com/x.jpg", "https://evil.com/res.cloudinary.com/", "https://res.cloudinary.com:8443/x.jpg", "https://u@res.cloudinary.com/x.jpg", "", null]) {
    assert.equal(isCloudinaryUrl(bad), false, String(bad));
  }
});

test("toGalleryCards cubre carga, error, vacío, anónimo y sesión sin mezclar muestras", () => {
  const api = [{ id: 7, titulo: "Uno", descripcion: null, imagen_url: null }, { id: 8, titulo: "Dos", descripcion: "d", imagen_url: "https://res.cloudinary.com/a/b.jpg" }];
  assert.equal(toGalleryCards({ data: [], loading: true, error: null }, { loggedIn: false }), null);
  for (const state of [{ data: [], loading: false, error: new Error("x") }, { data: [], loading: false, error: null }]) {
    const cards = toGalleryCards(state, { loggedIn: true });
    assert.equal(cards.length, 4);
    assert.ok(cards.every(card => card.sample && !card.locked && !card.demoHref));
  }
  const anonymous = toGalleryCards({ data: api, loading: false, error: null }, { loggedIn: false });
  assert.equal(anonymous.length, 2);
  assert.ok(anonymous.every(card => !card.sample && card.locked && !card.demoHref));
  const member = toGalleryCards({ data: api, loading: false, error: null }, { loggedIn: true });
  assert.deepEqual(member.map(card => card.demoHref), ["/proyectos/7", "/proyectos/8"]);
  assert.ok(member.every(card => !card.locked));
  assert.equal(member[0].description, "");
  assert.equal(PROJECT_IMAGE_FALLBACK, "/previews/proyecto.svg");
});

test("validateProjectForm replica las reglas y los mensajes del servidor", () => {
  assert.equal(validateProjectForm({ titulo: "Mi proyecto" }).isValid, true);
  assert.equal(validateProjectForm({ titulo: "a😀" }).fields.titulo, "Ingresá al menos 3 caracteres.");
  assert.equal(validateProjectForm({ titulo: "x".repeat(151) }).fields.titulo, "El título no puede superar los 150 caracteres.");
  const { fields } = validateProjectForm({
    titulo: "Válido", descripcion: "d".repeat(5001), tecnologias: "t".repeat(256), url_demo: "javascript:alert(1)",
    imagen_url: "https://example.com/a.png", imagen_public_id: "id",
  });
  assert.deepEqual(Object.keys(fields).sort(), ["descripcion", "imagen_url", "tecnologias", "url_demo"]);
  assert.equal(validateProjectForm({ titulo: "Válido", imagen_public_id: "id" }).fields.imagen_public_id, "Cargá la URL de la imagen antes del identificador.");
  assert.equal(validateProjectForm({ titulo: "Válido", imagen_url: "https://res.cloudinary.com/d/x.jpg", imagen_public_id: "d/x" }).isValid, true);
});
