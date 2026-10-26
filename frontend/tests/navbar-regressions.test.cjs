const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const React = require("react");

function load(file, resolve = require) {
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const loaded = { exports: {} };
  new Function("require", "module", "exports", code)(resolve, loaded, loaded.exports);
  return loaded.exports;
}
function preserve(names) {
  const values = names.map(name => [name, global[name]]);
  return () => values.forEach(([name, value]) => { if (value === undefined) delete global[name]; else global[name] = value; });
}

for (const palette of [false, true]) test(`${palette ? "paleta" : "menú"}: la salida desactiva el contenido antes de terminar la animación y reabrir lo habilita`, () => {
  const restore = preserve(["document", "window", "matchMedia"]);
  const refs = [], effects = [], listeners = new Map();
  const item = {}, panel = { inert: false };
  const modal = { open: false, dataset: {}, contains: value => value === item,
    show() { this.open = true; }, close() { this.open = false; },
    querySelectorAll: selector => selector === "[data-menu-panel]" ? [panel] : [] };
  const trigger = { focus() { document.activeElement = trigger; }, contains(value) { return value === trigger; } };
  global.document = { activeElement: item, addEventListener: (key, fn) => listeners.set(key, fn), removeEventListener: key => listeners.delete(key) };
  global.window = { addEventListener() {}, removeEventListener() {} };
  global.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  const tween = () => ({ kill() {}, to() { return this; } });
  let finish, cleanup;
  const react = { ...React, useId: () => "test", useState: value => [value, () => {}], useEffect() {}, useSyncExternalStore: (_, client) => client(),
    useRef: value => { const ref = { current: value }; refs.push(ref); return ref; }, useImperativeHandle() {} };
  try {
    const Component = load(`components/navigation/${palette ? "panel-paletas" : "menu-sitio"}.jsx`, name => {
      if (name === "react") return react;
      if (name.includes("use-active-section")) return () => "#inicio";
      if (name.includes("/gsap")) return { gsap: { set() {} }, MOTION: { panel: { labels: {} } }, useGSAP: fn => effects.push(fn) };
      if (name.includes("movimiento-panel")) return { preparePanelEntry() {}, enterPanels: tween, dropPanels: (_, done) => { finish = done; return tween(); } };
      if (name.includes("paletas")) return load("lib/paletas.js");
      if (name.includes("use-apariencia")) return { __esModule: true, default: () => ({ cursorFollowerEnabled: true, setCursorFollowerEnabled() {} }) };
      if (name.startsWith("@/")) return { default: () => null };
      return require(name);
    }).default;
    Component({ theme: "sonrisa", mode: "light", items: [] });
    refs[1].current = modal;
    if (palette) { refs[2].current = panel; refs[3].current = trigger; }
    else refs[2].current = trigger;
    cleanup = effects[0]({}, fn => fn);
    const actions = refs[palette ? 4 : 3].current;
    actions.open();
    document.activeElement = item;
    actions.close();
    assert.equal(modal.open, true, "la salida sigue animándose");
    assert.equal(panel.inert, true, "Tab y puntero ya no pueden entrar al panel saliente");
    assert.equal(document.activeElement, trigger);
    finish();
    assert.equal(modal.open, false);
    panel.scrollTop = 200;
    actions.open();
    assert.equal(panel.inert, false);
    if (!palette) assert.equal(panel.scrollTop, 0);
    listeners.get("pointerdown")({ target: {} });
    listeners.get("focusin")({ target: {} });
    assert.equal(modal.open, true, "el foco externo no acorta la caída iniciada por el clic exterior");
    assert.equal(panel.inert, true);
    finish();
    assert.equal(modal.open, false);
    cleanup(); cleanup = null;
    assert.equal(listeners.size, 0);
  } finally { cleanup?.(); restore(); }
});

test("la cubierta no bloquea entradas en reposo y compone dos trazados por actualización compartida", () => {
  const restore = preserve(["document", "matchMedia"]);
  const refs = [], effects = [], listeners = new Map();
  let writes = 0, timeline, cleanup;
  const root = { dataset: {}, querySelectorAll: () => [{ setAttribute() { writes++; } }, { setAttribute() { writes++; } }] };
  const mediaListeners = new Map();
  const media = { matches: false, addEventListener: (key, fn) => mediaListeners.set(key, fn), removeEventListener: key => mediaListeners.delete(key) };
  global.document = { body: {}, addEventListener: (key, fn) => listeners.set(key, fn), removeEventListener: key => listeners.delete(key) };
  global.matchMedia = () => media;
  const react = { ...React, forwardRef: fn => fn, useSyncExternalStore: (_, client) => client(), useRef: value => { const ref = { current: value }; refs.push(ref); return ref; }, useImperativeHandle() {} };
  try {
    const Component = load("components/navigation/transicion-seccion.jsx", name => {
      if (name === "react") return react;
      if (name === "react-dom") return { createPortal: element => element };
      if (name.includes("/gsap")) return { MOTION: { section: { duration: .9 } }, useGSAP: fn => effects.push(fn), gsap: {
        set() {}, timeline: options => (timeline = { options, tweens: [], to(_, props) { this.tweens.push(props); return this; }, call() { return this; }, duration(value) { return value === undefined ? 1 : this; }, isActive: () => false, kill() {} }),
      } };
      if (name.startsWith("@/")) return { default: () => null };
      return require(name);
    }).default;
    Component({}, null); refs[0].current = root;
    cleanup = effects[0]({}, fn => fn);
    const actions = refs[1].current;
    assert.equal(listeners.size, 0);
    actions.play(() => {});
    assert.deepEqual([...listeners.keys()].sort(), ["keydown", "touchmove", "wheel"]);
    assert.ok(timeline.tweens.length > 2);
    assert.ok(timeline.tweens.every(tween => !tween.onUpdate));
    writes = 0; timeline.options.onUpdate();
    assert.equal(writes, 2);
    timeline.options.onComplete();
    assert.equal(listeners.size, 0);
    actions.play(() => {}); actions.cancel();
    assert.equal(listeners.size, 0);
    let navigations = 0;
    actions.play(() => { navigations++; });
    media.matches = true; mediaListeners.get("change")();
    assert.equal(listeners.size, 0); assert.equal(navigations, 1);
    actions.play(() => { navigations++; });
    assert.equal(listeners.size, 0); assert.equal(navigations, 2);
  } finally { cleanup?.(); restore(); }
});

test("seguir la sección activa no lee geometrías durante scroll y las invalida al cambiar el layout", () => {
  const restore = preserve(["document", "window", "ResizeObserver", "scrollY", "innerHeight", "requestAnimationFrame", "cancelAnimationFrame"]);
  const effects = [], listeners = new Map(), frames = new Map(), states = [];
  let reads = 0, observer, id = 0;
  const tops = [0, 700, 1400];
  const targets = tops.map((_, index) => ({ getBoundingClientRect() { reads++; return { top: tops[index] - scrollY }; } }));
  global.scrollY = 0; global.innerHeight = 720;
  global.document = { body: {}, querySelector: () => null, documentElement: { scrollHeight: 3000 }, getElementById: id => targets[Number(id.slice(1))] };
  global.window = { addEventListener: (key, fn) => listeners.set(key, fn), removeEventListener: key => listeners.delete(key) };
  global.ResizeObserver = class { constructor(fn) { observer = fn; } observe() {} disconnect() {} };
  global.requestAnimationFrame = fn => { frames.set(++id, fn); return id; };
  global.cancelAnimationFrame = id => frames.delete(id);
  const flush = () => { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(fn => fn()); };
  let cleanup;
  try {
    const hook = load("hooks/use-active-section.js", () => ({ useEffect: fn => effects.push(fn), useState: value => [value(), next => states.push(next)] })).default;
    hook(tops.map((_, i) => ({ href: `#s${i}` })));
    cleanup = effects[0](); flush(); reads = 0;
    global.scrollY = 1000;
    for (let i = 0; i < 100; i++) listeners.get("scroll")();
    assert.equal(frames.size, 1); flush();
    assert.equal(reads, 0); assert.equal(states.at(-1), "#s1");
    tops[1] = 1200; observer(); flush();
    assert.ok(reads > 0); assert.equal(states.at(-1), "#s0");
    global.scrollY = 2280; listeners.get("scroll")(); flush();
    assert.equal(states.at(-1), "#s2");
    cleanup(); cleanup = null;
    assert.equal(frames.size, 0); assert.equal(listeners.size, 0);
  } finally { cleanup?.(); restore(); }
});

test("la verificación de sesión comparte peticiones y reutiliza el token renovado", async () => {
  const restore = preserve(["window", "fetch"]);
  const storage = new Map([["quokka_token", "original"]]);
  let calls = 0, respond;
  global.window = { localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) }, dispatchEvent() {} };
  global.fetch = () => { calls++; return new Promise(resolve => { respond = resolve; }); };
  try {
    const { verifySession } = load("lib/verificacion-sesion.js");
    const one = verifySession("original"), two = verifySession("original");
    assert.equal(one, two); assert.equal(calls, 1);
    respond({ ok: true, status: 200, json: async () => ({ token: "renovado", usuario: { id: 1, rol: "administrador" } }) });
    await one; await verifySession("renovado");
    assert.equal(calls, 1); assert.equal(storage.get("quokka_token"), "renovado");
  } finally { restore(); }
});

test("una respuesta de sesión vieja no restaura ni borra la sesión de otra cuenta", async () => {
  const restore = preserve(["window", "fetch"]);
  const storage = new Map([["quokka_token", "anterior"]]);
  let respond;
  global.window = { localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) }, dispatchEvent() {} };
  global.fetch = () => new Promise(resolve => { respond = resolve; });
  try {
    const { verifySession, clearSessionVerification } = load("lib/verificacion-sesion.js");
    const pending = verifySession("anterior");
    clearSessionVerification(); storage.set("quokka_token", "otra-cuenta");
    respond({ ok: false, status: 401 }); await pending;
    assert.equal(storage.get("quokka_token"), "otra-cuenta");
  } finally { restore(); }
});

test("un fallo temporal permite reintentar y un 401 de la sesión actual la elimina", async () => {
  const restore = preserve(["window", "fetch"]);
  const storage = new Map([["quokka_token", "actual"], ["quokka_user", "usuario"]]);
  let calls = 0;
  global.window = { localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) }, dispatchEvent() {} };
  global.fetch = async () => ({ ok: false, status: ++calls === 1 ? 500 : 401 });
  try {
    const { verifySession } = load("lib/verificacion-sesion.js");
    await verifySession("actual"); assert.equal(storage.get("quokka_token"), "actual");
    await verifySession("actual"); assert.equal(calls, 2);
    assert.equal(storage.has("quokka_token"), false); assert.equal(storage.has("quokka_user"), false);
  } finally { restore(); }
});

test("la caché de sesión caduca y vuelve a consultar el rol al servidor", async () => {
  const restore = preserve(["window", "fetch"]), originalNow = Date.now;
  const storage = new Map([["quokka_token", "actual"]]);
  let calls = 0, now = 1_000;
  Date.now = () => now;
  global.window = { localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) }, dispatchEvent() {} };
  global.fetch = async () => ({ ok: true, status: 200, json: async () => ({ usuario: { id: 1, rol: ++calls === 1 ? "administrador" : "usuario" } }) });
  try {
    const { verifySession } = load("lib/verificacion-sesion.js");
    await verifySession("actual"); await verifySession("actual");
    assert.equal(calls, 1);
    now += 31_000; await verifySession("actual");
    assert.equal(calls, 2); assert.equal(JSON.parse(storage.get("quokka_user")).rol, "usuario");
  } finally { Date.now = originalNow; restore(); }
});
