const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

// Load the exact production domain module, not a parallel test implementation.
const input = fs.readFileSync(path.resolve(__dirname, "../lib/styling.ts"), "utf8");
const compiled = ts.transpileModule(input, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
    esModuleInterop: true,
  },
  reportDiagnostics: true,
});
const errors = (compiled.diagnostics || []).filter(item => item.category === ts.DiagnosticCategory.Error);
assert.equal(errors.length, 0, ts.formatDiagnosticsWithColorAndContext(errors, {
  getCanonicalFileName: value => value,
  getCurrentDirectory: () => process.cwd(),
  getNewLine: () => "\n",
}));
const sandbox = { exports: {}, require };
vm.runInNewContext(compiled.outputText, sandbox, { timeout: 1000 });
const { WardrobeSchema, LookRequestSchema, parseWardrobe, costPerWear, buildLooks, formatColor } = sandbox.exports;

const item = (id, category, color = "black", season = "all", more = {}) => ({
  id, name: "Prenda " + id, category, color, season, wears: 5, cost: 50, ...more,
});
const top = item("top1", "top", "cream");
const bottom = item("bottom1", "bottom", "navy");
const shoe = item("shoe1", "footwear", "black");
const dress = item("dress1", "dress", "red");
const coat = item("coat1", "outerwear", "brown", "cool");

const request = (items, extra = {}) => ({
  items, occasion: "everyday", climate: "mild", expression: "calm", ...extra,
});

test("validates user-owned garments and explicit non-identifying data only", () => {
  assert.equal(WardrobeSchema.safeParse([top, bottom, shoe]).success, true);
  assert.equal(WardrobeSchema.safeParse([item("a", "top", "black", "all", { bodyShape: "other" })]).success, false);
  assert.equal(WardrobeSchema.safeParse([item("bad/id", "top")]).success, false);
  assert.equal(WardrobeSchema.safeParse([item("a", "top", "black", "all", { wears: -1 })]).success, false);
  assert.equal(WardrobeSchema.safeParse(Array.from({ length: 81 }, (_, i) => item("t" + i, "top"))).success, false);
  assert.equal(LookRequestSchema.safeParse(request([top, bottom, shoe], { personId: "not-allowed" })).success, false);
});

test("reading local wardrobe is safe, bounded and rejects tampered duplicate IDs", () => {
  const items = [top, bottom, shoe];
  assert.equal(parseWardrobe(JSON.stringify(items)).length, 3);
  assert.equal(parseWardrobe(JSON.stringify([top, top])).length, 0);
  assert.equal(parseWardrobe("{bad").length, 0);
  assert.equal(parseWardrobe(JSON.stringify({ clothes: items })).length, 0);
  assert.equal(parseWardrobe("x".repeat(45001)).length, 0);
  assert.equal(parseWardrobe("[]").length, 0);
});

test("suggests real clothes only, with no fabricated catalog or body assumptions", () => {
  const response = buildLooks(request([top, bottom, shoe, dress]));
  assert.ok(response.looks.length >= 1);
  assert.ok(response.looks.length <= 3);
  assert.equal(response.missing.length, 0);
  for (const look of response.looks) {
    assert.ok(look.title);
    assert.match(look.reason, /combinación orientativa/i);
    assert.ok(look.itemIds.length >= 2);
    assert.ok(look.itemIds.every(id => ["top1", "bottom1", "shoe1", "dress1"].includes(id)));
    assert.ok(look.notes.join(" ").includes("comodidad"));
  }
});

test("never makes an outfit if no matching clothes exist", () => {
  const result = buildLooks(request([top, bottom]));
  assert.equal(result.looks.length, 0);
  assert.ok(result.missing.includes("calzado"));
  assert.deepEqual(Array.from(buildLooks(request([])).looks), []);
});

test("cool-weather looks can include only real, eligible outerwear", () => {
  const result = buildLooks(request([top, bottom, shoe, coat], { climate: "cool" }));
  assert.ok(result.looks.length >= 1);
  for (const look of result.looks) assert.ok(look.itemIds.includes("coat1"));
  const withoutCoat = buildLooks(request([top, bottom, shoe], { climate: "cool" }));
  assert.ok(withoutCoat.looks.length >= 1);
  assert.ok(withoutCoat.looks[0].notes.some(note => note.includes("abrigo")));
});

test("cost-per-wear never divides by zero or implies unknown purchase costs", () => {
  assert.equal(costPerWear(top), 10);
  assert.equal(costPerWear(item("unworn", "top", "black", "all", { wears: 0 })), null);
  assert.equal(costPerWear(item("unknown", "top", "black", "all", { cost: null })), null);
  assert.equal(costPerWear(item("one", "top", "black", "all", { cost: 100, wears: 3 })), 33.33);
  assert.equal(formatColor("purple"), "morado");
});

test("all brand source entrypoints and stateless API exist", () => {
  const expected = [
    "app/page.tsx", "app/layout.tsx", "app/globals.css",
    "app/api/looks/route.ts", "tsconfig.json", "next-env.d.ts",
  ];
  for (const file of expected) {
    assert.ok(fs.statSync(path.resolve(__dirname, "..", file)).size > 100, file);
  }
  const endpoint = fs.readFileSync(path.resolve(__dirname, "../app/api/looks/route.ts"), "utf8");
  assert.match(endpoint, /LookRequestSchema\.safeParse/);
  assert.match(endpoint, /Cache-Control/);
  assert.match(endpoint, /wardrobeStoredOnServer: false/);
  assert.doesNotMatch(endpoint, /SUPABASE_SERVICE_ROLE_KEY|STRIPE_SECRET_KEY/);
});
