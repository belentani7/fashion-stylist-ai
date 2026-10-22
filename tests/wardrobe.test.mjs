import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = resolve(".");
const source = readFileSync(resolve(root, "lib/wardrobe.ts"), "utf8");
const output = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  reportDiagnostics: true,
});
assert.equal((output.diagnostics || []).filter(d => d.category === ts.DiagnosticCategory.Error).length, 0);
const context = { exports: {} };
runInNewContext(output.outputText, context, { filename: "wardrobe.cjs", timeout: 1000 });
const model = context.exports;

const date = "2026-10-22T00:00:00.000Z";
const piece = (id, category = "top", extra = {}) => ({
  id, name: "Mi prenda " + id, category, color: "Negro", season: "all",
  price: 80, wears: 0, notes: "", addedAt: date, ...extra,
});
const blank = () => ({ version: 1, items: [], outfits: [] });

test("Natalia launches with an empty real wardrobe, not synthetic users", () => {
  assert.equal(model.STORAGE_KEY, "natalia:wardrobe:v1");
  assert.equal(model.EMPTY.items.length, 0);
  assert.equal(model.EMPTY.outfits.length, 0);
  const loaded = model.parseLocalWardrobe(null);
  assert.equal(loaded.items.length, 0);
});

test("create and delete wardrobe items without mutating originals", () => {
  const first = model.addItem(blank(), piece("jacket", "outerwear"));
  const second = model.addItem(first, piece("jeans", "bottom"));
  assert.equal(first.items.length, 1);
  assert.equal(second.items.length, 2);
  assert.equal(model.totalInvestment(second), 160);
  assert.equal(model.removeItem(second, "jacket").items.length, 1);
});

test("outfits reference only known items and cost-per-wear tracks real usage", () => {
  let state = model.addItem(blank(), piece("shirt"));
  state = model.addItem(state, piece("shoe", "shoes", { price: 120 }));
  state = model.addOutfit(state, {
    id: "look-1", name: "Mi estilo", occasion: "daily",
    itemIds: ["shirt", "shoe"], addedAt: date,
  });
  assert.equal(model.costPerWear(state.items[0]), null);
  state = model.wearOutfit(state, "look-1");
  assert.equal(model.costPerWear(state.items[0]), 80);
  assert.equal(model.costPerWear(state.items[1]), 120);
  const reduced = model.removeItem(state, "shoe");
  assert.equal(reduced.outfits[0].itemIds[0], "shirt");
  assert.equal(reduced.outfits[0].itemIds.length, 1);
  assert.throws(() => model.wearOutfit(reduced, "not-a-look"), /not found/);
});

test("local suggestions only use owned garments and never body classification", () => {
  let state = blank();
  for (const item of [
    piece("top", "top", { wears: 3 }),
    piece("bottom", "bottom"),
    piece("shoes", "shoes"),
    piece("coat", "outerwear", { season: "cold" }),
    piece("earring", "accessory"),
  ]) state = model.addItem(state, item);
  assert.equal(model.suggestOutfit(state, "daily", "warm").length, 3);
  assert.equal(model.suggestOutfit(state, "event", "cold").length, 5);
  assert.equal(model.suggestOutfit(blank(), "work", "all").length, 0);
});

test("malformed or hostile JSON backups fail safely before being imported", () => {
  const bad = [
    { version: 2, items: [], outfits: [] },
    { version: 1, items: [piece("../secret")], outfits: [] },
    { version: 1, items: [piece("same"), piece("same")], outfits: [] },
    { version: 1, items: [piece("x", "medical-diagnosis")], outfits: [] },
    { version: 1, items: [piece("x", "top", { price: -1 })], outfits: [] },
    { version: 1, items: [], outfits: [{ id: "look", name: "Bad", occasion: "daily", itemIds: ["lost"], addedAt: date }] },
  ];
  for (const value of bad) assert.throws(() => model.validateWardrobe(value));
  assert.equal(model.parseLocalWardrobe("not-json").items.length, 0);
  assert.equal(model.parseLocalWardrobe("x".repeat(1_000_001)).items.length, 0);
});

test("usable Next 15 entrypoints and an independent Natalia identity exist", () => {
  for (const file of ["app/page.tsx", "app/layout.tsx", "app/globals.css", "lib/wardrobe.ts", "ecosistema.html", "NATALIA_LEGACY.md"]) {
    assert.ok(existsSync(resolve(root, file)), file);
  }
  const app = readFileSync(resolve(root,"app/page.tsx"),"utf8");
  assert.match(app,/useSyncExternalStore/);
  assert.match(app,/validateWardrobe/);
  assert.match(app,/onSubmit=\{createItem\}/);
  assert.match(app,/onSubmit=\{createLook\}/);
  assert.match(app,/restore\(e\.target\.files/);
  assert.doesNotMatch(app,/next-auth|STRIPE_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY/);
  const css = readFileSync(resolve(root,"app/globals.css"),"utf8");
  assert.doesNotMatch(css, /fonts\.googleapis\.com/);
});


test("editing a garment updates attributes without losing wear history or outfit references", () => {
  let state = model.addItem(blank(), piece("my-unique-id", "top", { wears: 7, price: 50 }));
  state = model.addOutfit(state, { id: "saved-look", name: "Original outfit",
    occasion: "daily", itemIds: ["my-unique-id"], addedAt: date });
  const edited = model.updateItem(state, { ...state.items[0], name: "Chaqueta renovada",
    category: "outerwear", price: 100, wears: 0, addedAt: "2020-01-01T00:00:00.000Z" });
  assert.equal(edited.items[0].name, "Chaqueta renovada");
  assert.equal(edited.items[0].wears, 7);
  assert.equal(edited.items[0].addedAt, date);
  assert.equal(edited.outfits[0].itemIds[0], "my-unique-id");
  assert.equal(model.costPerWear(edited.items[0]), 14.29);
  assert.equal(state.items[0].name, "Mi prenda my-unique-id");
});

test("editing cannot create a missing garment or bypass validation", () => {
  assert.throws(() => model.updateItem(blank(), piece("unknown")), /not found/);
  const state = model.addItem(blank(), piece("jacket"));
  assert.throws(() => model.updateItem(state, { ...state.items[0], price: -5 }), /validation/);
  assert.equal(state.items[0].price, 80);
});

test("the wardrobe editor exposes real edit and cancel controls", () => {
  const app = readFileSync(resolve(root, "app/page.tsx"), "utf8");
  assert.match(app, /function editItem\(piece:/);
  assert.match(app, /updateItem\(wardrobe, drafted\)/);
  assert.match(app, /onClick=\{cancelEdit\}/);
  assert.match(app, /onClick=\{\(\)=>editItem\(piece\)\}/);
});
