const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

function loadApi(fetch) {
  const compiled = ts.transpileModule(fs.readFileSync(path.join(__dirname, "../lib/panel-api.js"), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const loaded = { exports: {} };
  new Function("exports", "process", "fetch", compiled)(loaded.exports, { env: { NEXT_PUBLIC_API_URL: "http://api.local/" } }, fetch);
  return loaded.exports;
}

test("el catálogo envía selección completa y conserva los errores de campo del backend", async () => {
  const calls = [];
  const api = loadApi(async (url, options) => {
    calls.push({ url, options });
    return { ok: false, status: 400, json: async () => ({ error: "Revisá los campos.", fields: { tecnologia_ids: "La tecnología ya no existe." } }) };
  });
  await assert.rejects(api.saveCatalogRecord("servicios", 7, { nombre_servicio: "Web", descripcion: "Una aplicación web", tecnologia_ids: [] }), error => error.status === 400 && error.fields.tecnologia_ids === "La tecnología ya no existe.");
  assert.equal(calls[0].url, "http://api.local/api/admin/servicios/7");
  assert.equal(calls[0].options.method, "PUT");
  assert.deepEqual(JSON.parse(calls[0].options.body).tecnologia_ids, []);
});

test("borrar admite respuesta 204 sin intentar leer JSON", async () => {
  const api = loadApi(async (url, options) => {
    assert.equal(url, "http://api.local/api/admin/tecnologias/3");
    assert.equal(options.method, "DELETE");
    assert.equal(options.body, undefined);
    return { ok: true, status: 204, json: () => { throw new Error("No hay cuerpo"); } };
  });
  assert.equal(await api.deleteCatalogRecord("tecnologias", 3), null);
});

test("una ruta todavía no implementada conserva su 404 aunque responda HTML", async () => {
  const api = loadApi(async () => ({ ok: false, status: 404, json: async () => { throw new Error("HTML de Express"); } }));
  await assert.rejects(api.panelList("/api/operador/contactos"), error => error.status === 404);
});

test("una respuesta inválida no se interpreta como un catálogo vacío", async () => {
  const api = loadApi(async () => ({ ok: true, status: 200, json: async () => ({ ok: true }) }));
  await assert.rejects(api.panelList("/api/servicios"), /interpretar el listado/);
});

test("consultas conserva el texto y el destinatario por id en el contrato de respuesta", async () => {
  const api = loadApi(async (url, options) => {
    if (options.method === "POST") {
      assert.equal(url, "http://api.local/api/operador/contactos/8/responder");
      assert.deepEqual(JSON.parse(options.body), { respuesta: "Gracias por escribirnos." });
      return { ok: true, status: 200, json: async () => ({ ok: true }) };
    }
    return { ok: true, status: 200, json: async () => ({ contactos: [{ id: 8, estado: "pendiente" }] }) };
  });
  assert.deepEqual(await api.panelList("/api/operador/contactos"), [{ id: 8, estado: "pendiente" }]);
  assert.deepEqual(await api.replyToContact(8, "Gracias por escribirnos."), { ok: true });
});
