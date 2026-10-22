/** NATALIA — private, deterministic wardrobe domain. No body measurements, trackers or cloud. */
export const STORAGE_KEY = "natalia:wardrobe:v1";
export const STORAGE_EVENT = "natalia:wardrobe-changed";
export const CATEGORIES = ["top", "bottom", "dress", "outerwear", "shoes", "accessory"] as const;
export const SEASONS = ["all", "warm", "cold"] as const;
export const OCCASIONS = ["daily", "work", "event", "travel"] as const;

export type Category = typeof CATEGORIES[number];
export type Season = typeof SEASONS[number];
export type Occasion = typeof OCCASIONS[number];

export interface WardrobeItem {
  id: string;
  name: string;
  category: Category;
  color: string;
  season: Season;
  price: number;
  wears: number;
  notes: string;
  addedAt: string;
}
export interface Outfit {
  id: string;
  name: string;
  occasion: Occasion;
  itemIds: string[];
  addedAt: string;
}
export interface WardrobeState {
  version: 1;
  items: WardrobeItem[];
  outfits: Outfit[];
}
export const EMPTY: WardrobeState = { version: 1, items: [], outfits: [] };

const categorySet = new Set<string>(CATEGORIES);
const seasonSet = new Set<string>(SEASONS);
const occasionSet = new Set<string>(OCCASIONS);
const validId = (value: unknown): value is string =>
  typeof value === "string" && /^[A-Za-z0-9-]{1,64}$/.test(value);
const validDate = (value: unknown): value is string =>
  typeof value === "string" && Number.isFinite(Date.parse(value)) &&
  new Date(value).toISOString() === value;
const validMoney = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 1_000_000;
const validWears = (v: unknown): v is number =>
  typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= 1_000_000;
const hasText = (v: unknown, limit: number): v is string =>
  typeof v === "string" && v.trim().length > 0 && v.length <= limit;
const validOptional = (v: unknown, limit: number): v is string =>
  typeof v === "string" && v.length <= limit;

export function validateWardrobe(raw: unknown): WardrobeState {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Invalid JSON document");
  const data = raw as Partial<WardrobeState>;
  if (data.version !== 1 || !Array.isArray(data.items) || !Array.isArray(data.outfits) ||
      data.items.length > 600 || data.outfits.length > 300) {
    throw new Error("Unsupported backup version or list size");
  }
  const seen = new Set<string>();
  const items: WardrobeItem[] = [];
  for (const value of data.items) {
    if (!value || typeof value !== "object") throw new Error("Invalid wardrobe item");
    const item = value as WardrobeItem;
    if (!validId(item.id) || seen.has(item.id) || !hasText(item.name, 90) ||
        !categorySet.has(item.category) || !hasText(item.color, 36) ||
        !seasonSet.has(item.season) || !validMoney(item.price) ||
        !validWears(item.wears) || !validOptional(item.notes, 360) ||
        !validDate(item.addedAt)) throw new Error("Wardrobe item failed validation");
    seen.add(item.id);
    items.push({ id: item.id, name: item.name, category: item.category, color: item.color,
      season: item.season, price: item.price, wears: item.wears, notes: item.notes, addedAt: item.addedAt });
  }
  const outfits: Outfit[] = [];
  const seenOutfits = new Set<string>();
  for (const value of data.outfits) {
    if (!value || typeof value !== "object") throw new Error("Invalid outfit");
    const outfit = value as Outfit;
    if (!validId(outfit.id) || seenOutfits.has(outfit.id) ||
        !hasText(outfit.name, 90) || !occasionSet.has(outfit.occasion) ||
        !validDate(outfit.addedAt) || !Array.isArray(outfit.itemIds) ||
        outfit.itemIds.length < 1 || outfit.itemIds.length > 10 ||
        new Set(outfit.itemIds).size !== outfit.itemIds.length ||
        !outfit.itemIds.every(id => validId(id) && seen.has(id))) {
      throw new Error("Outfit references invalid or unknown wardrobe items");
    }
    seenOutfits.add(outfit.id);
    outfits.push({ id: outfit.id, name: outfit.name, occasion: outfit.occasion,
      itemIds: [...outfit.itemIds], addedAt: outfit.addedAt });
  }
  return { version: 1, items, outfits };
}

export function parseLocalWardrobe(raw: string | null): WardrobeState {
  if (!raw || raw.length > 1_000_000) return { version: 1, items: [], outfits: [] };
  try { return validateWardrobe(JSON.parse(raw) as unknown); }
  catch { return { version: 1, items: [], outfits: [] }; }
}

export function addItem(state: WardrobeState, item: WardrobeItem): WardrobeState {
  return validateWardrobe({ ...state, items: [...state.items, item] });
}

/** Edit descriptive properties while preserving identity and wear history. */
export function updateItem(state: WardrobeState, edited: WardrobeItem): WardrobeState {
  const current = state.items.find(item => item.id === edited.id);
  if (!current) throw new Error("Wardrobe item not found");
  return validateWardrobe({ ...state, items: state.items.map(item => item.id === edited.id
    ? { ...edited, id: current.id, wears: current.wears, addedAt: current.addedAt }
    : item) });
}

export function removeItem(state: WardrobeState, id: string): WardrobeState {
  return validateWardrobe({ ...state, items: state.items.filter(item => item.id !== id),
    outfits: state.outfits.map(outfit => ({ ...outfit,
      itemIds: outfit.itemIds.filter(itemId => itemId !== id) }))
      .filter(outfit => outfit.itemIds.length > 0) });
}

export function addOutfit(state: WardrobeState, outfit: Outfit): WardrobeState {
  return validateWardrobe({ ...state, outfits: [...state.outfits, outfit] });
}
export function removeOutfit(state: WardrobeState, id: string): WardrobeState {
  return validateWardrobe({ ...state, outfits: state.outfits.filter(outfit => outfit.id !== id) });
}
export function wearOutfit(state: WardrobeState, outfitId: string): WardrobeState {
  const outfit = state.outfits.find(item => item.id === outfitId);
  if (!outfit) throw new Error("Outfit not found");
  return validateWardrobe({ ...state, items: state.items.map(item => outfit.itemIds.includes(item.id)
    ? { ...item, wears: Math.min(1_000_000, item.wears + 1) } : item) });
}
export function costPerWear(item: WardrobeItem): number | null {
  return item.wears ? Math.round(item.price / item.wears * 100) / 100 : null;
}
export function totalInvestment(state: WardrobeState): number {
  return Math.round(state.items.reduce((sum, item) => sum + item.price, 0) * 100) / 100;
}

/** A non-LLM suggestion for an occasion & season; never guesses someone's body. */
export function suggestOutfit(state: WardrobeState, occasion: Occasion, season: Season): string[] {
  if (!occasionSet.has(occasion) || !seasonSet.has(season)) return [];
  const available = state.items.filter(item => item.season === "all" || season === "all" || item.season === season);
  const sorted = [...available].sort((a, b) => a.wears - b.wears || a.name.localeCompare(b.name));
  const first = (category: Category) => sorted.find(item => item.category === category)?.id;
  const dress = first("dress");
  const top = first("top");
  const bottom = first("bottom");
  const basic = dress ? [dress] : top && bottom ? [top, bottom] : [];
  if (!basic.length) return [];
  const shoes = first("shoes");
  const outerwear = season === "cold" ? first("outerwear") : undefined;
  const accessory = occasion === "event" ? first("accessory") : undefined;
  return [...new Set([...basic, shoes, outerwear, accessory].filter((id): id is string => Boolean(id)))];
}
