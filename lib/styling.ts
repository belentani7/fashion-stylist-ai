import { z } from "zod";

/**
 * NATALIA wardrobe domain — transparent local curation, no invented AI calls.
 * All fields are non-sensitive wardrobe labels. No photos, body measurements,
 * biometrics, health data or intimate profile attributes enter the engine.
 */
export const Category = z.enum(["top", "bottom", "dress", "outerwear", "footwear", "accessory"]);
export const Color = z.enum(["black", "white", "cream", "grey", "navy", "denim", "brown", "red", "pink", "blue", "green", "yellow", "purple"]);
export const Season = z.enum(["all", "warm", "cool"]);
export const Occasion = z.enum(["everyday", "work", "evening", "celebration"]);
export const Expression = z.enum(["calm", "bold", "minimal"]);
export const Climate = z.enum(["warm", "mild", "cool"]);

export const WardrobeItemSchema = z.object({
  id: z.string().regex(/^[a-z0-9_-]{1,60}$/),
  name: z.string().trim().min(2).max(60),
  category: Category,
  color: Color,
  season: Season,
  wears: z.number().int().min(0).max(100000),
  cost: z.number().finite().min(0).max(50000).nullable(),
}).strict();

export const WardrobeSchema = z.array(WardrobeItemSchema).max(80);
export const LookRequestSchema = z.object({
  items: WardrobeSchema,
  occasion: Occasion,
  expression: Expression,
  climate: Climate,
}).strict();

export type WardrobeItem = z.infer<typeof WardrobeItemSchema>;
export type LookRequest = z.infer<typeof LookRequestSchema>;
export type Look = {
  id: string;
  title: string;
  itemIds: string[];
  reason: string;
  notes: string[];
};

const neutral = new Set(["black", "white", "cream", "grey", "navy", "denim", "brown"]);
const COLOR_NAMES: Record<z.infer<typeof Color>, string> = {
  black: "negro", white: "blanco", cream: "crema", grey: "gris", navy: "azul marino",
  denim: "denim", brown: "marrón", red: "rojo", pink: "rosa", blue: "azul",
  green: "verde", yellow: "amarillo", purple: "morado",
};

export function formatColor(color: z.infer<typeof Color>): string {
  return COLOR_NAMES[color];
}

export function costPerWear(item: WardrobeItem): number | null {
  return item.cost != null && item.wears > 0
    ? Math.round((item.cost / item.wears) * 100) / 100
    : null;
}

export function parseWardrobe(raw: string | null): WardrobeItem[] {
  if (!raw || raw.length > 45000) return [];
  try {
    const value: unknown = JSON.parse(raw);
    const result = WardrobeSchema.safeParse(value);
    if (!result.success) return [];
    if (new Set(result.data.map(item => item.id)).size !== result.data.length) return [];
    return result.data;
  } catch {
    return [];
  }
}

function suitable(item: WardrobeItem, climate: LookRequest["climate"]): boolean {
  return climate === "mild" || item.season === "all" || item.season === climate;
}

function pairScore(a: WardrobeItem, b: WardrobeItem, expression: LookRequest["expression"]): number {
  const same = a.color === b.color;
  const neutralPair = neutral.has(a.color) || neutral.has(b.color);
  const contrast = !same && !neutralPair;
  return (same ? 3 : 0) + (neutralPair ? 4 : 0) +
    (expression === "bold" && contrast ? 5 : 0) +
    (expression === "minimal" && same ? 5 : 0) +
    (expression === "calm" && neutralPair ? 3 : 0);
}

export function buildLooks(input: LookRequest): { looks: Look[]; missing: string[] } {
  const { items, occasion, expression, climate } = LookRequestSchema.parse(input);
  const eligible = items.filter(item => suitable(item, climate));
  const by = (category: WardrobeItem["category"]) => eligible.filter(item => item.category === category);
  const shoes = by("footwear");
  const tops = by("top");
  const bottoms = by("bottom");
  const dresses = by("dress");
  const candidates: Array<{ ids: string[]; score: number; caption: string; colors: string[] }> = [];
  const wornBonus = (parts: WardrobeItem[]) =>
    parts.filter(item => item.wears === 0).length;
  for (const top of tops) {
    for (const bottom of bottoms) {
      for (const shoe of shoes) {
        const parts = [top, bottom, shoe];
        candidates.push({
          ids: parts.map(x => x.id),
          score: pairScore(top, bottom, expression) + pairScore(bottom, shoe, expression) + wornBonus(parts),
          caption: top.name + " + " + bottom.name,
          colors: parts.map(x => COLOR_NAMES[x.color]),
        });
      }
    }
  }
  for (const dress of dresses) {
    for (const shoe of shoes) {
      const parts = [dress, shoe];
      candidates.push({
        ids: parts.map(x => x.id),
        score: pairScore(dress, shoe, expression) + wornBonus(parts),
        caption: dress.name,
        colors: parts.map(x => COLOR_NAMES[x.color]),
      });
    }
  }

  candidates.sort((a, b) => b.score - a.score || a.ids.join(":").localeCompare(b.ids.join(":")));
  const looks: Look[] = [];
  const used = new Set<string>();
  for (const option of candidates) {
    if (looks.length >= 3) break;
    const key = option.ids.join("|");
    if (used.has(key)) continue;
    used.add(key);
    const resultIds = [...option.ids];
    const notes: string[] = [];
    if (climate === "cool") {
      const outer = by("outerwear").sort((a, b) =>
        pairScore(a, eligible.find(item => item.id === resultIds[0])!, expression) -
        pairScore(b, eligible.find(item => item.id === resultIds[0])!, expression)).at(-1);
      if (outer) resultIds.push(outer.id);
      else notes.push("Añade una capa de abrigo si las condiciones lo requieren.");
    }
    const accessory = by("accessory").find(x => !resultIds.includes(x.id));
    if (accessory && expression === "bold") resultIds.push(accessory.id);
    const colors = [...new Set(option.colors)];
    looks.push({
      id: "look-" + (looks.length + 1),
      title: option.caption,
      itemIds: resultIds,
      reason: "Combinación orientativa de piezas de tu armario para " +
        ({ everyday: "el día a día", work: "trabajar", evening: "una salida de noche", celebration: "una celebración" } as const)[occasion] +
        ". Paleta: " + colors.join(", ") + ".",
      notes: [
        "Puedes cambiar cualquier pieza: tu comodidad y criterio tienen prioridad.",
        ...notes,
      ],
    });
  }

  const missing: string[] = [];
  if (!shoes.length) missing.push("calzado");
  if (!dresses.length && !tops.length) missing.push("parte superior o vestido");
  if (!dresses.length && !bottoms.length) missing.push("parte inferior o vestido");
  return { looks, missing };
}
