const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const cache = new Map();

// Carga un módulo ES del proyecto transpilándolo a CommonJS (igual que los demás tests)
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

const { combinarEquipoConGithub, normalizarNombre } = load("lib/github-api.js");
const { TEAM } = load("lib/site-content.js");

test("normalizarNombre ignora tildes, mayúsculas y espacios repetidos", () => {
  assert.equal(normalizarNombre("  Micaías   VILLA "), "micaias villa");
});

test("el equipo local ya no trae enlaces de GitHub escritos a mano", () => {
  for (const integrante of TEAM) assert.equal(integrante.profileHref, undefined, integrante.name);
});

test("combinarEquipoConGithub agrega foto y enlace por nombre", () => {
  const perfiles = [{ nombre: "Juan Girón", avatar_url: "https://avatars.githubusercontent.com/u/1?s=600", perfil_url: "https://github.com/juangiron06" }];
  const equipo = combinarEquipoConGithub(TEAM, perfiles);
  const juan = equipo.find(integrante => integrante.name === "Juan Girón");
  assert.equal(juan.portrait, "https://avatars.githubusercontent.com/u/1?s=600");
  assert.equal(juan.profileHref, "https://github.com/juangiron06");
  // Quien no tiene perfil queda sin foto ni enlace
  const otro = equipo.find(integrante => integrante.name === "Lautaro Jándula");
  assert.equal(otro.portrait, undefined);
  assert.equal(otro.profileHref, undefined);
});

test("combinarEquipoConGithub descarta URLs que no sean https", () => {
  const perfiles = [{ nombre: "Juan Girón", avatar_url: "javascript:alert(1)", perfil_url: "http://github.com/x" }];
  const juan = combinarEquipoConGithub(TEAM, perfiles).find(integrante => integrante.name === "Juan Girón");
  assert.equal(juan.portrait, undefined);
  assert.equal(juan.profileHref, undefined);
});

test("combinarEquipoConGithub sin perfiles conserva el equipo tal cual", () => {
  assert.deepEqual(combinarEquipoConGithub(TEAM, []), TEAM);
});
