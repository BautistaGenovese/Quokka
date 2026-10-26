const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

test("la cubierta unifica anclas y rutas, espera el cambio de página y conserva enlaces nativos", async () => {
  const effects = [], refs = [], listeners = new Map(), calls = [];
  let covered, busy = false;
  const previous = { document: global.document, window: global.window, location: global.location };
  global.location = { href: "http://localhost:3000/", origin: "http://localhost:3000", pathname: "/", search: "" };
  global.document = {
    addEventListener(key, fn, capture) { assert.equal(capture, true); listeners.set(key, fn); },
    removeEventListener(key) { listeners.delete(key); },
  };
  const windowListeners = new Map();
  global.window = { dispatchEvent: event => calls.push(event.type), addEventListener:(key,fn) => windowListeners.set(key,fn), removeEventListener:key => windowListeners.delete(key) };
  const router = { push: href => calls.push(href) };
  const compiled = ts.transpileModule(fs.readFileSync(path.join(__dirname, "../components/navigation/transicion-navegacion.jsx"), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const loaded = { exports: {} };
  const resolve = name => {
    if (name === "react") return { useEffect: fn => effects.push(fn), useRef: value => { const ref = { current: value }; refs.push(ref); return ref; }, useState: value => [value, () => {}] };
    if (name === "next/navigation") return { useRouter: () => router, usePathname: () => "/" };
    if (name === "./transicion-seccion") return { default: () => null };
    if (name === "./indicador-carga-navegacion") return { default: () => null };
    if (name.includes("section-navigation")) return { getSectionTarget: hash => hash === "#equipo", navigateToSection: hash => calls.push(hash) };
    return require(name);
  };
  let cleanup;
  try {
    new Function("require", "module", "exports", compiled)(resolve, loaded, loaded.exports);
    loaded.exports.default();
    refs[0].current = { play: fn => { covered = fn; }, isActive: () => busy };
    effects[0](); cleanup = effects[1]();
    const click = (href, extra = {}) => {
      const result = { prevented: false, stopped: false };
      listeners.get("click")({ button: 0, target: { closest: () => ({ href, target: "", hasAttribute: () => false }) },
        preventDefault: () => { result.prevented = true; }, stopPropagation: () => { result.stopped = true; }, ...extra });
      return result;
    };
    assert.equal(click("https://example.com/").prevented, false);
    assert.equal(click("http://localhost:3000/#equipo", { ctrlKey: true }).prevented, false);
    assert.equal(click("http://localhost:3000/#inexistente").prevented, false);
    assert.equal(click("http://localhost:3000/#equipo").prevented, true);
    assert.ok(!calls.includes("#equipo"), "navega solo bajo cobertura");
    covered(); assert.ok(calls.includes("#equipo"));
    busy = true; const last = covered;
    click("http://localhost:3000/iniciar-sesion"); assert.equal(covered, last, "ignora dobles clics durante la salida");
    busy = false;
    assert.equal(click("http://localhost:3000/iniciar-sesion").stopped, true);
    const ready = covered(); let finished = false;
    ready.then(() => { finished = true; });
    await Promise.resolve(); assert.equal(finished, false);
    assert.ok(calls.includes("/iniciar-sesion"));
    effects[0](); await ready; assert.equal(finished, true);
    global.location.pathname = "/iniciar-sesion"; global.location.href = "http://localhost:3000/iniciar-sesion";
    windowListeners.get("quokka:navigate")({detail:"/"});
    const returned = covered(); effects[0](); await returned;
    assert.ok(calls.includes("/"), "el Quokka vuelve al estudio desde el login bajo cobertura");
    global.location.pathname = "/panel";
    global.location.href = "http://localhost:3000/panel";
    const previousCalls = calls.filter(call => call === "#equipo").length;
    assert.equal(click("http://localhost:3000/panel#equipo").prevented, true, "el panel también usa la navegación compartida por anclas");
    covered();
    assert.equal(calls.filter(call => call === "#equipo").length, previousCalls + 1);
  } finally {
    cleanup?.();
    Object.assign(global, previous);
  }
  assert.equal(listeners.size, 0); assert.equal(windowListeners.size, 0);
});
