import { and, asc, desc, eq, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { clientPortalAccesses, clientStyleProfiles, clients, InsertUser, outfitItems, outfits, privacyPreferences, styleProfiles, stylingContexts, stylingDecisions, users, visualReferences, wardrobeItems } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getStyleProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(styleProfiles).where(eq(styleProfiles.userId, userId)).limit(1);
  return rows[0];
}

export async function saveStyleProfile(input: {
  userId: number;
  archetype: string;
  energy: string;
  palette: string;
  notes?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("La base de datos no está disponible todavía.");
  await db.insert(styleProfiles).values(input).onDuplicateKeyUpdate({
    set: {
      archetype: input.archetype,
      energy: input.energy,
      palette: input.palette,
      notes: input.notes ?? null,
    },
  });
  return getStyleProfile(input.userId);
}

export async function listWardrobeItems(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(wardrobeItems).where(eq(wardrobeItems.userId, userId)).orderBy(desc(wardrobeItems.createdAt));
}

export async function createWardrobeItem(input: {
  userId: number;
  clientId?: number | null;
  imageKey?: string | null;
  imageUrl?: string | null;
  name: string;
  itemType: string;
  subcategory?: string | null;
  primaryColor?: string | null;
  material?: string | null;
  pattern?: string | null;
  silhouette?: string | null;
  season?: string | null;
  formality?: string | null;
  condition?: string | null;
  brand?: string | null;
  size?: string | null;
  garmentNotes?: string | null;
  tags?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("La base de datos no está disponible todavía.");
  const result = await db.insert(wardrobeItems).values(input);
  const itemId = Number(result[0].insertId);
  const rows = await db.select().from(wardrobeItems).where(eq(wardrobeItems.id, itemId)).limit(1);
  return rows[0];
}

export async function getPrivacyPreference(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(privacyPreferences).where(eq(privacyPreferences.userId, userId)).limit(1);
  return rows[0];
}

export async function grantDataProcessingConsent(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("La base de datos no está disponible todavía.");
  const consentedAt = new Date();
  await db.insert(privacyPreferences).values({ userId, consentedAt, revokedAt: null }).onDuplicateKeyUpdate({
    set: { consentedAt, revokedAt: null },
  });
  return getPrivacyPreference(userId);
}

export async function revokeDataProcessingConsent(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("La base de datos no está disponible todavía.");
  const revokedAt = new Date();
  await db.insert(privacyPreferences).values({ userId, revokedAt, consentedAt: null }).onDuplicateKeyUpdate({
    set: { revokedAt },
  });
  return getPrivacyPreference(userId);
}

export async function listClients(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clients).where(eq(clients.userId, userId)).orderBy(desc(clients.updatedAt));
}

export async function getOwnedClient(userId: number, clientId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(clients).where(and(eq(clients.id, clientId), eq(clients.userId, userId))).limit(1);
  return rows[0];
}

export async function createClient(input: { userId: number; displayName: string; notes?: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("La base de datos no está disponible todavía.");
  const result = await db.insert(clients).values(input);
  const id = Number(result[0].insertId);
  const rows = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return rows[0];
}

export async function getClientPortalAccessForOwner(stylistUserId: number, clientId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(clientPortalAccesses).where(and(eq(clientPortalAccesses.stylistUserId, stylistUserId), eq(clientPortalAccesses.clientId, clientId))).limit(1);
  return rows[0];
}

export async function grantClientPortalAccess(input: { stylistUserId: number; clientId: number; clientEmail: string }) {
  const db = await getDb();
  if (!db) throw new Error("La base de datos no está disponible todavía.");
  await db.insert(clientPortalAccesses).values({ stylistUserId: input.stylistUserId, clientId: input.clientId, clientEmail: input.clientEmail, status: "active", clientUserId: null, consentedAt: null }).onDuplicateKeyUpdate({
    set: { clientEmail: input.clientEmail, status: "active", clientUserId: null, consentedAt: null },
  });
  return getClientPortalAccessForOwner(input.stylistUserId, input.clientId);
}

export async function revokeClientPortalAccess(stylistUserId: number, clientId: number) {
  const db = await getDb();
  if (!db) throw new Error("La base de datos no está disponible todavía.");
  await db.update(clientPortalAccesses).set({ status: "revoked", consentedAt: null }).where(and(eq(clientPortalAccesses.stylistUserId, stylistUserId), eq(clientPortalAccesses.clientId, clientId)));
  return getClientPortalAccessForOwner(stylistUserId, clientId);
}

export async function getClientPortalAccessForViewer(input: { userId: number; email?: string | null }) {
  const db = await getDb();
  if (!db) return undefined;
  const email = input.email?.trim().toLowerCase();
  const conditions = email ? or(eq(clientPortalAccesses.clientUserId, input.userId), eq(clientPortalAccesses.clientEmail, email)) : eq(clientPortalAccesses.clientUserId, input.userId);
  const rows = await db.select().from(clientPortalAccesses).where(and(eq(clientPortalAccesses.status, "active"), conditions)).limit(1);
  const access = rows[0];
  if (!access || (access.clientUserId && access.clientUserId !== input.userId)) return undefined;
  if (!access.clientUserId) {
    await db.update(clientPortalAccesses).set({ clientUserId: input.userId }).where(eq(clientPortalAccesses.id, access.id));
    return { ...access, clientUserId: input.userId };
  }
  return access;
}

export async function consentToClientPortal(userId: number, email?: string | null) {
  const access = await getClientPortalAccessForViewer({ userId, email });
  if (!access) return undefined;
  const db = await getDb();
  if (!db) throw new Error("La base de datos no está disponible todavía.");
  const consentedAt = new Date();
  await db.update(clientPortalAccesses).set({ consentedAt }).where(eq(clientPortalAccesses.id, access.id));
  return { ...access, consentedAt };
}

export async function getApprovedClientProposal(userId: number, email?: string | null) {
  const access = await getClientPortalAccessForViewer({ userId, email });
  if (!access || !access.consentedAt) return { access, client: undefined, looks: [] };
  const db = await getDb();
  if (!db) return { access, client: undefined, looks: [] };
  const [client] = await db.select({ id: clients.id, displayName: clients.displayName }).from(clients).where(and(eq(clients.id, access.clientId), eq(clients.userId, access.stylistUserId))).limit(1);
  if (!client) return { access, client: undefined, looks: [] };
  const approvedLooks = await db.select().from(outfits).where(and(eq(outfits.clientId, client.id), eq(outfits.userId, access.stylistUserId), eq(outfits.status, "ready"))).orderBy(desc(outfits.updatedAt));
  const wardrobe = await db.select({ id: wardrobeItems.id, name: wardrobeItems.name, itemType: wardrobeItems.itemType, primaryColor: wardrobeItems.primaryColor }).from(wardrobeItems).where(and(eq(wardrobeItems.userId, access.stylistUserId), eq(wardrobeItems.clientId, client.id)));
  const wardrobeById = new Map(wardrobe.map((item) => [item.id, item]));
  const looks = await Promise.all(approvedLooks.map(async (look) => ({
    id: look.id,
    name: look.name,
    occasion: look.occasion,
    explanation: look.explanation,
    adjustment: look.adjustment,
    components: (await getOutfitItems(look.id)).map((item) => {
      const garment = wardrobeById.get(item.garmentId);
      return garment ? { id: item.id, name: garment.name, itemType: garment.itemType, color: garment.primaryColor } : null;
    }).filter((item): item is NonNullable<typeof item> => Boolean(item)),
  })));
  return { access, client, looks };
}

export async function getClientStyleProfile(clientId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(clientStyleProfiles).where(eq(clientStyleProfiles.clientId, clientId)).limit(1);
  return rows[0];
}

export async function saveClientStyleProfile(input: {
  clientId: number;
  dominantStyle?: string | null;
  secondaryStyles?: string | null;
  preferredColors?: string | null;
  avoidedColors?: string | null;
  silhouettes?: string | null;
  proportions?: string | null;
  materials?: string | null;
  patterns?: string | null;
  formality?: string | null;
  frequentOccasions?: string | null;
  favoriteItems?: string | null;
  neverWears?: string | null;
  brands?: string | null;
  budgetRange?: string | null;
  experimentLevel?: string | null;
  imageGoals?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("La base de datos no está disponible todavía.");
  await db.insert(clientStyleProfiles).values(input).onDuplicateKeyUpdate({ set: { ...input } });
  return getClientStyleProfile(input.clientId);
}

export async function listStylingContexts(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(stylingContexts).where(eq(stylingContexts.clientId, clientId)).orderBy(desc(stylingContexts.updatedAt));
}

export async function createStylingContext(input: {
  clientId: number;
  title: string;
  occasion?: string | null;
  season?: string | null;
  climate?: string | null;
  formality?: string | null;
  objective?: string | null;
  constraints?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("La base de datos no está disponible todavía.");
  const result = await db.insert(stylingContexts).values(input);
  const id = Number(result[0].insertId);
  const rows = await db.select().from(stylingContexts).where(eq(stylingContexts.id, id)).limit(1);
  return rows[0];
}

export async function listClientWardrobe(userId: number, clientId?: number) {
  const db = await getDb();
  if (!db) return [];
  const where = clientId === undefined ? eq(wardrobeItems.userId, userId) : and(eq(wardrobeItems.userId, userId), eq(wardrobeItems.clientId, clientId));
  return db.select().from(wardrobeItems).where(where).orderBy(desc(wardrobeItems.createdAt));
}

export async function listOutfits(userId: number, clientId?: number) {
  const db = await getDb();
  if (!db) return [];
  const where = clientId === undefined ? eq(outfits.userId, userId) : and(eq(outfits.userId, userId), eq(outfits.clientId, clientId));
  return db.select().from(outfits).where(where).orderBy(desc(outfits.updatedAt));
}

export async function getOutfitItems(outfitId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(outfitItems).where(eq(outfitItems.outfitId, outfitId)).orderBy(asc(outfitItems.position));
}

export async function createOutfit(input: {
  userId: number;
  clientId?: number | null;
  contextId?: number | null;
  name: string;
  occasion?: string | null;
  formality?: string | null;
  explanation?: string | null;
  adjustment?: string | null;
  origin?: "manual" | "assistant";
  items: Array<{ garmentId: number; role?: string | null; notes?: string | null }>;
}) {
  const db = await getDb();
  if (!db) throw new Error("La base de datos no está disponible todavía.");
  const { items, ...outfitInput } = input;
  const result = await db.insert(outfits).values(outfitInput);
  const outfitId = Number(result[0].insertId);
  if (items.length) {
    await db.insert(outfitItems).values(items.map((item, position) => ({ outfitId, garmentId: item.garmentId, role: item.role ?? null, notes: item.notes ?? null, position })));
  }
  const rows = await db.select().from(outfits).where(eq(outfits.id, outfitId)).limit(1);
  return { outfit: rows[0], items: await getOutfitItems(outfitId) };
}

export async function updateOutfitNarrative(input: { userId: number; outfitId: number; explanation: string; adjustment?: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("La base de datos no está disponible todavía.");
  const existing = await db.select().from(outfits).where(and(eq(outfits.id, input.outfitId), eq(outfits.userId, input.userId))).limit(1);
  if (!existing[0]) return undefined;
  await db.update(outfits).set({ explanation: input.explanation, adjustment: input.adjustment ?? null }).where(eq(outfits.id, input.outfitId));
  const rows = await db.select().from(outfits).where(eq(outfits.id, input.outfitId)).limit(1);
  return rows[0];
}

export async function setOutfitClientVisibility(input: { userId: number; outfitId: number; visibleToClient: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("La base de datos no está disponible todavía.");
  const existing = await db.select().from(outfits).where(and(eq(outfits.id, input.outfitId), eq(outfits.userId, input.userId))).limit(1);
  if (!existing[0]) return undefined;
  await db.update(outfits).set({ status: input.visibleToClient ? "ready" : "draft" }).where(eq(outfits.id, input.outfitId));
  const rows = await db.select().from(outfits).where(eq(outfits.id, input.outfitId)).limit(1);
  return rows[0];
}

export async function listStylingDecisions(userId: number, clientId?: number) {
  const db = await getDb();
  if (!db) return [];
  const where = clientId === undefined ? eq(stylingDecisions.userId, userId) : and(eq(stylingDecisions.userId, userId), eq(stylingDecisions.clientId, clientId), eq(stylingDecisions.status, "active"));
  return db.select().from(stylingDecisions).where(where).orderBy(desc(stylingDecisions.updatedAt));
}

export async function createStylingDecision(input: {
  userId: number;
  clientId?: number | null;
  contextId?: number | null;
  outfitId?: number | null;
  category: string;
  statement: string;
  source?: "natalia" | "assistant";
}) {
  const db = await getDb();
  if (!db) throw new Error("La base de datos no está disponible todavía.");
  const result = await db.insert(stylingDecisions).values(input);
  const id = Number(result[0].insertId);
  const rows = await db.select().from(stylingDecisions).where(eq(stylingDecisions.id, id)).limit(1);
  return rows[0];
}

export async function listVisualReferences(userId: number, clientId?: number) {
  const db = await getDb();
  if (!db) return [];
  const where = clientId === undefined ? eq(visualReferences.userId, userId) : and(eq(visualReferences.userId, userId), eq(visualReferences.clientId, clientId));
  return db.select().from(visualReferences).where(where).orderBy(desc(visualReferences.updatedAt));
}

export async function createVisualReference(input: {
  userId: number;
  clientId?: number | null;
  referenceType: "inspiration" | "aesthetic" | "silhouette" | "palette" | "campaign" | "look";
  title: string;
  imageKey?: string | null;
  imageUrl?: string | null;
  notes?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("La base de datos no está disponible todavía.");
  const result = await db.insert(visualReferences).values(input);
  const id = Number(result[0].insertId);
  const rows = await db.select().from(visualReferences).where(eq(visualReferences.id, id)).limit(1);
  return rows[0];
}
