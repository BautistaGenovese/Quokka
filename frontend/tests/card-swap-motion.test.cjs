const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const React = require("react");

test("CardSwap pausa el autoplay al cambiar movimiento reducido y libera sus listeners al desmontarse", () => {
  const names = ["window", "document", "ResizeObserver", "IntersectionObserver", "requestAnimationFrame", "cancelAnimationFrame", "setTimeout", "clearTimeout"];
  const previous = Object.fromEntries(names.map(name => [name, global[name]]));
  const effects = [], refs = [], timers = new Map(), frames = new Map(), mediaListeners = new Map();
  let sequence = 0, cleanup;
  const media = { matches: false, addEventListener: (key, fn) => mediaListeners.set(key, fn), removeEventListener: key => mediaListeners.delete(key) };
  const node = () => ({ style: {}, clientWidth: 900, clientHeight: 600, matches: () => false,
    setAttribute() {}, removeAttribute() {}, addEventListener() {}, removeEventListener() {} });
  const root = node(), stage = node();
  const schedule = fn => { const id = ++sequence; timers.set(id, fn); return id; };
  global.window = { matchMedia: () => media, setTimeout: schedule };
  global.document = { hidden: false, visibilityState: "visible", addEventListener() {}, removeEventListener() {} };
  global.setTimeout = schedule;
  global.clearTimeout = id => timers.delete(id);
  global.requestAnimationFrame = fn => { const id = ++sequence; frames.set(id, fn); return id; };
  global.cancelAnimationFrame = id => frames.delete(id);
  global.ResizeObserver = global.IntersectionObserver = class { observe() {} disconnect() {} };
  const react = { ...React, forwardRef: fn => fn, useRef: value => { const ref = { current: value }; refs.push(ref); return ref; },
    useMemo: fn => fn(), useEffect: fn => effects.push(fn), useLayoutEffect: fn => effects.push(fn), useImperativeHandle() {} };
  const source = ts.transpileModule(fs.readFileSync(path.join(__dirname, "../components/ui/CardSwap.jsx"), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const loaded = { exports: {} };
  const resolve = name => name === "react" ? react : name === "next/image" ? () => null : name.endsWith(".css") ? {} : name.includes("captura-puntero") ? {} : require(name);
  try {
    new Function("require", "module", "exports", source)(resolve, loaded, loaded.exports);
    loaded.exports.default({ intro: false, children: [React.createElement("div", { key: "a" }), React.createElement("div", { key: "b" })] }, null);
    refs[0].current = root; refs[1].current = stage;
    refs[2].current = [node(), node()]; refs[3].current = [node(), node()];
    effects[0]();
    cleanup = effects[1]();
    assert.equal(timers.size, 1, "el autoplay empieza cuando no hay reducción de movimiento");
    media.matches = true; mediaListeners.get("change")();
    assert.equal(timers.size, 0, "la preferencia nueva cancela el próximo cambio automático");
    const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn(performance.now()));
    assert.equal(frames.size, 0, "las tarjetas se asientan sin un bucle de animación permanente");
    media.matches = false; mediaListeners.get("change")();
    assert.equal(timers.size, 1, "el autoplay puede volver al quitar la reducción de movimiento");
    cleanup(); cleanup = null;
    assert.equal(mediaListeners.size, 0); assert.equal(timers.size, 0); assert.equal(frames.size, 0);
  } finally {
    cleanup?.();
    Object.assign(global, previous);
  }
});
