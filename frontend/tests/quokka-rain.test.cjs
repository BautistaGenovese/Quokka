const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const source = ts.transpileModule(fs.readFileSync(path.join(__dirname, "../lib/quokka-rain.js"), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const loaded = { exports: {} };
new Function("module", "exports", source)(loaded, loaded.exports);
const { createQuokkaRain } = loaded.exports;

function scene(width = 1200) {
  let time = 0, next = 0;
  const frames = new Map();
  const nodes = Array.from({ length: 24 }, () => ({ style: { visibility: "hidden" } }));
  const engine = createQuokkaRain({ nodes, getViewport: () => ({ width, height: 800 }),
    now: () => time, random: () => .5,
    requestFrame: fn => { frames.set(++next, fn); return next; },
    cancelFrame: id => frames.delete(id),
  });
  const step = () => {
    time += 1000 / 60;
    const callbacks = [...frames.values()]; frames.clear();
    callbacks.forEach(fn => fn(time));
    assert.ok(frames.size <= 1, "un único loop para toda la lluvia");
  };
  return { engine, nodes, frames, step };
}

test("la lluvia limita cantidad, reemplaza lanzamientos y deja de dibujar al salir de pantalla", () => {
  const { engine, nodes, frames, step } = scene();
  assert.equal(engine.launch(), 16);
  for (let i = 0; i < 30; i++) step();
  assert.equal(engine.launch(), 16);
  assert.equal(frames.size, 1, "repetir no acumula loops ni partículas");
  for (let i = 0; i < 600; i++) step();
  assert.equal(frames.size, 0);
  assert.ok(nodes.every(node => node.style.visibility === "hidden"));
  const mobile = scene(390);
  assert.equal(mobile.engine.launch(), 10);
  mobile.engine.clear(); assert.equal(mobile.frames.size, 0);
});

test("las mascotas se pueden agarrar y lanzar; incluso sosteniéndolas su vida es finita", () => {
  const { engine, nodes, frames, step } = scene();
  engine.launch(); step();
  assert.equal(engine.grab(0, 600, 20), true);
  const before = nodes[0].style.transform;
  engine.move(0, 800, 80); step();
  assert.notEqual(nodes[0].style.transform, before);
  engine.release(0); step();
  assert.equal(engine.grab(0, 800, 80), true);
  for (let i = 0; i < 600; i++) step();
  assert.equal(frames.size, 0);
  assert.equal(nodes[0].style.visibility, "hidden");
  assert.equal(engine.grab(0, 0, 0), false);
});

test("Sling distingue clic, teclado, lanzamiento y cancelación sin ejecutar dos acciones", () => {
  const effects = [], actions = [];
  const previousFrame = global.requestAnimationFrame, previousCancel = global.cancelAnimationFrame;
  global.requestAnimationFrame = () => 1; global.cancelAnimationFrame = () => {};
  const mv = initial => ({ value:initial, get() { return this.value; }, set(v) { this.value=v; }, jump(v) { this.value=v; } });
  const api = { useRef:value => ({current:value}), useState:value => [value, () => {}], useId:() => "sling-test", useEffect:fn => effects.push(fn) };
  const motion = { animate:(value, to) => { value.set(to); return {stop() {}}; }, motion:{span:"span"}, useMotionValue:mv, useMotionTemplate:() => "", useMotionValueEvent:() => {}, useReducedMotion:() => false };
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, "../components/ui/SlingButton.jsx"), "utf8"), { compilerOptions:{module:ts.ModuleKind.CommonJS, jsx:ts.JsxEmit.ReactJSX, target:ts.ScriptTarget.ES2022, esModuleInterop:true} }).outputText;
  const component = { exports:{} };
  const resolve = name => name === "@/lib/pointer-capture" ? {capturePointer:() => true,releasePointer:() => true} : name === "react" ? api : name === "motion/react" ? motion : name.endsWith(".css") ? {} : require(name);
  let cleanups = [];
  try {
    new Function("require","module","exports",code)(resolve,component,component.exports);
    const tree = component.exports.default({onTap:() => actions.push("tap"),onSend:() => actions.push("rain"),particles:0,armAt:22});
    const find = element => { if (!element || typeof element !== "object") return; if (element.type === "button") return element; for (const child of [element.props?.children].flat(Infinity)) { const match = find(child); if (match) return match; } };
    const pad = find(tree);
    const surface = {offsetWidth:40,getBoundingClientRect:() => ({width:40}),setPointerCapture() {},releasePointerCapture() {}};
    tree.props.ref.current = surface; pad.props.ref.current = surface;
    cleanups = effects.map(fn => fn()).filter(fn => typeof fn === "function");
    const event = {button:0,pointerId:1,pointerType:"mouse",clientX:100,clientY:100,currentTarget:surface};
    pad.props.onPointerDown(event); pad.props.onPointerUp(event); pad.props.onClick();
    assert.deepEqual(actions,["tap"]);
    pad.props.onClick(); assert.deepEqual(actions,["tap","tap"],"Enter/clic sintetizado también vuelve al inicio");
    pad.props.onPointerDown(event); pad.props.onPointerMove({...event,clientY:220}); pad.props.onPointerUp(event); pad.props.onClick();
    assert.deepEqual(actions,["tap","tap","rain"]);
    pad.props.onPointerDown(event); pad.props.onPointerMove({...event,clientY:220}); pad.props.onPointerCancel(event);
    assert.equal(actions.length,3,"cancelar no dispara ni lluvia ni navegación");
    pad.props.onClick(); assert.equal(actions.at(-1),"tap","cancelar no consume el siguiente clic de teclado");
  } finally { cleanups.forEach(fn => fn()); global.requestAnimationFrame=previousFrame;global.cancelAnimationFrame=previousCancel; }
});
