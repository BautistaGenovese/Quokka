// Regresión del controlador con el motor GSAP real y superficies numéricas.
// No simula CSS/layout: esos casos se verifican además en el navegador.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

function load(relative, resolve = require) {
  const source = fs.readFileSync(path.join(__dirname, "..", relative), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const loaded = { exports: {} };
  new Function("require", "module", "exports", compiled)(resolve, loaded, loaded.exports);
  return loaded.exports;
}

class Surface {
  constructor() {
    this.listeners = {}; this.dataset = {};
    this.x = this.y = this.rotation = 0; this.scale = 1;
    this.offsetWidth = 120; this.offsetHeight = 56;
  }
  addEventListener(key, fn) { (this.listeners[key] ??= []).push(fn); }
  removeEventListener(key, fn) { this.listeners[key] = (this.listeners[key] ?? []).filter(f => f !== fn); }
  emit(type, event = {}) { (this.listeners[type] ?? []).forEach(fn => fn({ type, ...event })); }
  contains(node) { return node === this; }
  matches() { return !!this.focusVisible; }
  getBoundingClientRect() { return { left: 100 + this.x, top: 100 + this.y, width: 120, height: 56 }; }
}

test("magnetismo, interrupciones, foco, presión, movimiento reducido y limpieza", () => {
  const base = load("lib/gsap.js");
  const { gsap } = base;
  const win = new Surface(), el = new Surface(), content = new Surface(), outside = {};
  let hit = el, reduced = false, context;
  const media = [], warnings = [];
  const originalWarn = console.warn;
  const previous = { window: global.window, document: global.document, matchMedia: global.matchMedia };
  global.window = win;
  global.document = { elementFromPoint: () => hit };
  global.matchMedia = query => {
    const item = new Surface();
    Object.defineProperty(item, "matches", { get: () => query.includes("reduced") ? reduced : true });
    media.push(item);
    return item;
  };
  console.warn = (...args) => warnings.push(args.join(" "));
  const api = {
    ...base,
    useGSAP: callback => {
      context = gsap.context(() => {});
      context.add(() => callback(context, fn => context.add(null, fn)));
    },
  };
  let clock = gsap.globalTimeline.time();
  const advance = seconds => {
    gsap.ticker.sleep();
    gsap.globalTimeline.time(clock += seconds);
    gsap.ticker.sleep();
  };
  try {
    const useButtonMotion = load("hooks/use-button-motion.js", () => api).default;
    useButtonMotion({ current: el }, { current: content }, {
      inactive: false, magnetic: true, strength: 0.28, maxRotation: 7,
    });
    const event = { pointerType: "mouse", button: 0, clientX: 205, clientY: 145, target: el };
    el.emit("pointermove", event); advance(0.4);
    assert.ok(el.x > 5 && content.x > 1, "el cuerpo y el contenido se atraen");
    const before = el.x;
    el.emit("focus");
    assert.equal(el.x, before, "el foco por mouse no teletransporta");
    el.emit("pointerdown", event); advance(0.1);
    assert.ok(el.scale < 0.97, "presión del clic");
    hit = outside;
    el.emit("pointerleave");
    assert.equal(el.dataset.pressed, undefined, "salir cancela presión antes de pointerup");
    advance(0.2);
    assert.ok(el.x < 0, "el retorno elástico sobrepasa el centro");
    advance(0.6);
    assert.ok(Math.abs(el.x) < 0.01, "el retorno se asienta");
    hit = el;
    el.emit("pointermove", event); advance(0.4);
    assert.ok(el.x > 5, "reentrar retoma magnetismo");
    el.focusVisible = true; el.emit("focus");
    assert.equal(el.x, 0); assert.equal(content.x, 0);
    el.focusVisible = false;
    el.emit("pointermove", event); advance(0.4);
    assert.ok(el.x > 5, "quickTo retoma después del foco de teclado");
    reduced = true; media.forEach(item => item.emit("change"));
    assert.equal(el.x, 0);
    el.emit("pointerdown", event); advance(0.2);
    assert.equal(el.scale, 1, "movimiento reducido no escala");
    context.revert();
    assert.ok(Object.values(win.listeners).every(list => list.length === 0));
    assert.equal(el.dataset.pressed, undefined);
    // Simula entrar en carga mientras cuerpo y etiqueta siguen desplazados.
    reduced = false;
    gsap.set(el, { x: 18, y: 7, rotation: 4, scale: 0.96 });
    gsap.set(content, { x: 6, y: 3 });
    el.dataset.pressed = "true";
    useButtonMotion({ current: el }, { current: content }, { inactive: true });
    advance(0.8);
    assert.equal(el.x, 0, "la carga devuelve el cuerpo al origen");
    assert.equal(el.y, 0); assert.equal(el.rotation, 0); assert.equal(el.scale, 1);
    assert.equal(content.x, 0); assert.equal(content.y, 0);
    assert.equal(el.dataset.pressed, undefined);
    // React/useGSAP revierte el contexto de carga antes de reactivar el botón.
    // Ese revert restaura la postura previa al retorno: debe neutralizarse.
    context.revert();
    assert.equal(el.rotation, 4, "reproduce la postura antigua restaurada por revert");
    useButtonMotion({ current: el }, { current: content }, {
      inactive: false, magnetic: true, strength: 0.28, maxRotation: 7,
    });
    assert.equal(el.x, 0); assert.equal(el.y, 0); assert.equal(el.rotation, 0);
    assert.equal(el.scale, 1); assert.equal(content.x, 0); assert.equal(content.y, 0);
    hit = el;
    el.emit("pointermove", event); advance(0.4);
    assert.ok(el.x > 5, "el magnetismo sigue funcionando después del resultado");
    const expressiveX = el.x;
    context.revert();
    useButtonMotion({ current: el }, { current: content }, {
      inactive: false, magnetic: true, motion: "subtle", ...base.BUTTON_MOTION.subtle,
    });
    el.emit("pointermove", event); advance(0.4);
    assert.ok(el.x > 0 && el.x < expressiveX, "el preset discreto conserva atracción con menor amplitud");
    hit = outside;
    el.emit("pointerleave"); advance(0.6);
    assert.ok(Math.abs(el.x) < 0.01 && Math.abs(content.x) < 0.01, "el preset discreto también vuelve al origen");
    assert.deepEqual(warnings, [], "GSAP no advierte conflictos de propiedades");
  } finally {
    context?.revert();
    gsap.ticker.sleep();
    console.warn = originalWarn;
    Object.assign(global, previous);
  }
});

test("menú y paleta comparten una caída completa, interrumpible y con limpieza", () => {
  const api = load("lib/gsap.js");
  const { gsap } = api;
  const { preparePanelEntry, enterPanels, dropPanels } = load("lib/panel-motion.js", () => api);
  const previous = { width: global.innerWidth, height: global.innerHeight };
  global.innerWidth = 1200; global.innerHeight = 800;
  const panels = [new Surface(), new Surface(), new Surface()];
  let completed = 0, animation;
  const context = gsap.context(() => {});
  try {
    context.add(() => { preparePanelEntry(panels); animation = enterPanels(panels); });
    animation.progress(1);
    assert.ok(panels.every(panel => panel.x === 0), "todos los paneles entran");
    context.add(() => { animation = dropPanels(panels, () => completed++); });
    assert.equal(animation.delay(), api.MOTION.panel.fall.delay, "la pausa precede a la caída");
    animation.totalTime(0.2);
    animation.kill();
    context.add(() => { animation = enterPanels(panels); });
    animation.progress(1);
    assert.equal(completed, 0, "reabrir no ejecuta el cierre cancelado");
    context.add(() => { animation = dropPanels(panels, () => completed++); });
    animation.progress(1);
    assert.equal(completed, 1, "se cierra una sola vez, después del último panel");
    assert.ok(panels.every(panel => panel.getBoundingClientRect().top > innerHeight), "ninguna esquina queda dentro del viewport");
  } finally {
    context.revert(); gsap.ticker.sleep();
    global.innerWidth = previous.width; global.innerHeight = previous.height;
  }
});
