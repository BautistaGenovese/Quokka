const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const postcss = require("postcss");
const root = path.resolve(__dirname, "..");
const walk = folder => fs.readdirSync(folder, { withFileTypes: true }).flatMap(entry => {
  const file = path.join(folder, entry.name);
  return entry.isDirectory() ? walk(file) : [file];
});

test("los imports locales y assets de la aplicación apuntan a archivos existentes", () => {
  const files = ["app", "components", "hooks", "lib"].flatMap(dir => walk(path.join(root, dir))).filter(file => /\.[cm]?[jt]sx?$/.test(file));
  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    for (const [, name] of source.matchAll(/(?:from\s*|import\s*)["']([^"']+)["']/g)) {
      if (!name.startsWith(".") && !name.startsWith("@/")) continue;
      const base = name.startsWith("@/") ? path.join(root, name.slice(2)) : path.resolve(path.dirname(file), name);
      assert.ok([base, ...[".js", ".jsx", ".css", "/index.js", "/index.jsx"].map(ext => base + ext)].some(candidate => fs.existsSync(candidate)), `${file}: ${name}`);
    }
    for (const [, asset] of source.matchAll(/["'](\/[^"'\s]+\.(?:svg|webp|png|jpe?g))["']/g)) {
      assert.ok(fs.existsSync(path.join(root, "public", asset)), `${file}: asset ${asset}`);
    }
  }
});

test("DESIGN, las muestras y CSS comparten las cinco paletas actuales", () => {
  const source = fs.readFileSync(path.join(root, "lib/palettes.js"), "utf8");
  const palettes = JSON.parse(source.slice(source.indexOf("["), source.lastIndexOf("]") + 1));
  const css = postcss.parse(fs.readFileSync(path.join(root, "app/globals.css"), "utf8"));
  const design = fs.readFileSync(path.join(root, "../DESIGN.md"), "utf8");
  const tokens = ["bg-1", "bg-2", "bg-3", "deep", "color-1", "color-2", "color-3", "text"];
  assert.equal(palettes.length, 5);
  for (const palette of palettes) {
    let rule;
    css.walkRules(item => { if (item.selector.includes(`[data-pal="${palette.id}"]`)) rule = item; });
    assert.ok(rule, palette.id);
    assert.ok(design.includes(`### ${palette.name} (${palette.id})`));
    tokens.forEach((token, index) => {
      const declaration = rule.nodes.find(item => item.prop === `--palette-${token}`);
      const values = declaration.value.match(/#[0-9a-f]{6}/gi);
      const expected = index === 7 ? palette.text : [palette.c[0][index], palette.c[1][index]];
      assert.deepEqual(values.map(value => value.toUpperCase()), expected.map(value => value.toUpperCase()), `${palette.id}: ${token}`);
      expected.forEach(value => assert.ok(design.includes(value), `${palette.id}: documentación ${value}`));
    });
  }
});

test("la portada es pública y no quedan rutas ni dependencias del catálogo antiguo", () => {
  const routes = walk(path.join(root, "app")).filter(file => /[\\/]page\.[jt]sx?$/.test(file)).map(file => path.relative(path.join(root, "app"), file).replaceAll("\\", "/")).sort();
  assert.deepEqual(routes, [
    "admin/page.jsx",
    "admin/usuarios/page.jsx",
    "iniciar-sesion/page.jsx",
    "login/page.js",
    "page.js",
    "register/page.js",
  ]);
  const home = fs.readFileSync(path.join(root, "components/portfolio/portfolio-page.jsx"), "utf8");
  assert.match(home, /function PortfolioPage/);
  assert.doesNotMatch(home, /PortfolioPreview|\/componentes|\/experiencia/);
  const menu = fs.readFileSync(path.join(root, "components/navigation/site-menu.jsx"), "utf8");
  assert.ok(menu.indexOf('className="site-menu-help"') < menu.indexOf('href="/iniciar-sesion"'));
});
