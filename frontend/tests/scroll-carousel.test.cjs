const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

test("la rueda se captura solo en el carrusel, normaliza unidades y conserva zoom y campos", () => {
  const source = ts.transpileModule(fs.readFileSync(path.join(__dirname, "../hooks/use-scroll-carousel.js"), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const local = new Map();
  let cleanup, next = 0, prev = 0, prevented = 0, stopped = 0;
  const root = { current: {
    clientHeight: 400,
    addEventListener: (key, fn, options) => {
      if (key === "wheel") { assert.equal(options.passive, false); assert.equal(options.capture, true); }
      local.set(key, fn);
    },
    removeEventListener: (key, fn, capture) => {
      if (key === "wheel") assert.equal(capture, true);
      local.delete(key);
    },
  } };
  const scope = {
    module: { exports: {} }, exports: {},
    require: () => ({ useEffect: fn => { cleanup = fn(); } }),
  };
  scope.exports = scope.module.exports;
  vm.runInNewContext(source, scope);
  scope.module.exports.default(root, { current: { next: () => next++, prev: () => prev++ } }, 5);
  const wheel = (deltaY, timeStamp, extra = {}) => local.get("wheel")({
    deltaY, deltaX: 0, deltaMode: 0, timeStamp, target: { closest: () => null },
    preventDefault: () => prevented++, stopPropagation: () => stopped++, ...extra,
  });
  wheel(30, 0); assert.equal(next, 0);
  wheel(30, 20); assert.equal(next, 1);
  wheel(200, 40); assert.equal(next, 1, "amortigua los eventos del trackpad");
  wheel(-70, 300); assert.equal(prev, 1);
  local.get("pointerleave")();
  wheel(2, 400, { deltaMode: 1 }); wheel(2, 410, { deltaMode: 1 }); assert.equal(next, 2);
  wheel(1, 700, { deltaMode: 2 }); assert.equal(next, 3);
  wheel(0, 1000, { deltaX: -80 }); assert.equal(prev, 2);
  assert.equal(prevented, 8); assert.equal(stopped, 8);
  wheel(300, 1300, { ctrlKey: true }); assert.equal(prevented, 8, "el zoom sigue siendo nativo");
  wheel(300, 1600, { target: { closest: () => ({}) } }); assert.equal(prevented, 8);
  cleanup(); assert.equal(local.size, 0);
});
