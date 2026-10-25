const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

function load(file, resolve = require) {
  const compiled = ts.transpileModule(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const loaded = { exports: {} };
  new Function("require", "module", "exports", compiled)(resolve, loaded, loaded.exports);
  return loaded.exports;
}

test("la captura tolera punteros expirados incluso después de hasPointerCapture", () => {
  const { capturePointer, releasePointer } = load("lib/captura-puntero.js");
  const node = { hasPointerCapture: () => true,
    releasePointerCapture() { throw new DOMException("Invalid pointer id", "NotFoundError"); },
    setPointerCapture() { throw new DOMException("Invalid pointer id", "NotFoundError"); },
  };
  assert.equal(releasePointer(node, 4), false);
  assert.equal(capturePointer(node, 4), false);
  assert.equal(releasePointer(null, 4), false);
  assert.equal(releasePointer(node, undefined), false);
  node.hasPointerCapture = () => false;
  node.releasePointerCapture = () => { throw new Error("no debería invocarse"); };
  assert.equal(releasePointer(node, 4), false);
  node.hasPointerCapture = () => true;
  assert.throws(() => releasePointer(node, 4), /no debería invocarse/, "no oculta otros errores");
  let released;
  node.releasePointerCapture = id => { released = id; };
  assert.equal(releasePointer(node, 4), true); assert.equal(released, 4);
});

test("footer soporta entradas, movimiento reducido y remontajes sin recursión ni frames pendientes", () => {
  const previous = { matchMedia:global.matchMedia, IntersectionObserver:global.IntersectionObserver,
    requestAnimationFrame:global.requestAnimationFrame, cancelAnimationFrame:global.cancelAnimationFrame, document:global.document };
  let cleanup, callback, id = 0, pathValue, reduced = false;
  const frames = new Map(), mediaListeners = new Map(), documentListeners = new Map(), animations = [];
  const animate = () => { const animation = { cancelled:false, cancel() { this.cancelled = true; } }; animations.push(animation); return animation; };
  const mark = {}, peek = { animate }, letters = Array.from({ length:7 }, () => ({ animate }));
  const root = { querySelector: selector => selector.includes("wordmark") ? mark : peek, querySelectorAll: () => letters };
  const edge = { setAttribute: (_, value) => { pathValue = value; } };
  global.matchMedia = () => ({ get matches() { return reduced; }, addEventListener:(key,fn) => mediaListeners.set(key,fn), removeEventListener:key => mediaListeners.delete(key) });
  global.document = { hidden:false, addEventListener:(key,fn) => documentListeners.set(key,fn), removeEventListener:key => documentListeners.delete(key) };
  global.IntersectionObserver = class { constructor(fn) { callback = fn; } observe() {} unobserve() {} disconnect() {} };
  global.requestAnimationFrame = fn => { frames.set(++id, fn); return id; };
  global.cancelAnimationFrame = key => frames.delete(key);
  try {
    const hook = load("hooks/use-movimiento-footer.js", () => ({ useEffect: fn => { cleanup = fn(); } }));
    for (let cycle = 0; cycle < 20; cycle++) {
      reduced = false;
      hook.default({current:root}, {current:edge});
      callback([{target:root,isIntersecting:true},{target:mark,isIntersecting:true}]);
      for (let frame = 0; frame < 120; frame++) {
        const work = [...frames.values()]; frames.clear(); work.forEach(fn => fn(frame * 17));
      }
      assert.equal(frames.size, 0); assert.equal(pathValue, hook.FOOTER_REST_EDGE);
      callback([{target:root,isIntersecting:false},{target:root,isIntersecting:true}]);
      reduced = true; mediaListeners.get("change")();
      assert.equal(frames.size, 0);
      cleanup();
      assert.equal(mediaListeners.size, 0); assert.equal(documentListeners.size, 0);
    }
    assert.ok(animations.every(animation => animation.cancelled));
  } finally { cleanup?.(); Object.assign(global, previous); }
});
