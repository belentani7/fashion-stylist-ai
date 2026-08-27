import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/** Perfil de estilo que guía las recomendaciones personalizadas del usuario. */
export const styleProfiles = mysqlTable("styleProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  archetype: varchar("archetype", { length: 80 }),
  energy: varchar("energy", { length: 80 }),
  palette: varchar("palette", { length: 80 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Catálogo personal de prendas. Los archivos viven en almacenamiento de objetos; aquí solo se guarda su referencia. */
export const wardrobeItems = mysqlTable("wardrobeItems", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  clientId: int("clientId"),
  imageKey: varchar("imageKey", { length: 512 }),
  imageUrl: varchar("imageUrl", { length: 1024 }),
  name: varchar("name", { length: 160 }).notNull(),
  itemType: varchar("itemType", { length: 80 }).notNull(),
  subcategory: varchar("subcategory", { length: 80 }),
  primaryColor: varchar("primaryColor", { length: 80 }),
  material: varchar("material", { length: 80 }),
  pattern: varchar("pattern", { length: 80 }),
  silhouette: varchar("silhouette", { length: 80 }),
  season: varchar("season", { length: 80 }),
  formality: varchar("formality", { length: 80 }),
  condition: varchar("condition", { length: 80 }),
  brand: varchar("brand", { length: 120 }),
  size: varchar("size", { length: 80 }),
  garmentNotes: text("garmentNotes"),
  tags: text("tags"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Preferencia explícita que controla el uso de datos de estilo para personalización. */
export const privacyPreferences = mysqlTable("privacyPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  consentedAt: timestamp("consentedAt"),
  revokedAt: timestamp("revokedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Persona para la que Natalia está trabajando; no se mezcla con la cuenta de la estilista. */
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  displayName: varchar("displayName", { length: 160 }).notNull(),
  status: mysqlEnum("status", ["active", "archived"]).default("active").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Acceso de lectura para una clienta: la estilista lo aprueba y la clienta lo consiente tras iniciar sesión con el correo invitado. */
export const clientPortalAccesses = mysqlTable("clientPortalAccesses", {
  id: int("id").autoincrement().primaryKey(),
  stylistUserId: int("stylistUserId").notNull(),
  clientId: int("clientId").notNull().unique(),
  clientEmail: varchar("clientEmail", { length: 320 }).notNull(),
  clientUserId: int("clientUserId"),
  status: mysqlEnum("status", ["active", "revoked"]).default("active").notNull(),
  consentedAt: timestamp("consentedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Preferencias confirmadas y siempre editables de una clienta. */
export const clientStyleProfiles = mysqlTable("clientStyleProfiles", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull().unique(),
  dominantStyle: varchar("dominantStyle", { length: 100 }),
  secondaryStyles: text("secondaryStyles"),
  preferredColors: text("preferredColors"),
  avoidedColors: text("avoidedColors"),
  silhouettes: text("silhouettes"),
  proportions: text("proportions"),
  materials: text("materials"),
  patterns: text("patterns"),
  formality: varchar("formality", { length: 80 }),
  frequentOccasions: text("frequentOccasions"),
  favoriteItems: text("favoriteItems"),
  neverWears: text("neverWears"),
  brands: text("brands"),
  budgetRange: varchar("budgetRange", { length: 120 }),
  experimentLevel: varchar("experimentLevel", { length: 80 }),
  imageGoals: text("imageGoals"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Encargo concreto: ocasión, estación y restricciones que cambian de un look a otro. */
export const stylingContexts = mysqlTable("stylingContexts", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  occasion: varchar("occasion", { length: 160 }),
  season: varchar("season", { length: 80 }),
  climate: varchar("climate", { length: 120 }),
  formality: varchar("formality", { length: 80 }),
  objective: text("objective"),
  constraints: text("constraints"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Looks editables: pueden existir sin IA y se asocian a persona y encargo de forma explícita. */
export const outfits = mysqlTable("outfits", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  clientId: int("clientId"),
  contextId: int("contextId"),
  name: varchar("name", { length: 160 }).notNull(),
  occasion: varchar("occasion", { length: 160 }),
  formality: varchar("formality", { length: 80 }),
  explanation: text("explanation"),
  adjustment: text("adjustment"),
  status: mysqlEnum("status", ["draft", "ready", "archived"]).default("draft").notNull(),
  origin: mysqlEnum("origin", ["manual", "assistant"]).default("manual").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Relación ordenada entre un look y las prendas que lo componen. */
export const outfitItems = mysqlTable("outfitItems", {
  id: int("id").autoincrement().primaryKey(),
  outfitId: int("outfitId").notNull(),
  garmentId: int("garmentId").notNull(),
  role: varchar("role", { length: 80 }),
  position: int("position").notNull().default(0),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/** Correcciones y reglas de trabajo confirmadas por Natalia; no se convierten en hechos no revisables. */
export const stylingDecisions = mysqlTable("stylingDecisions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  clientId: int("clientId"),
  contextId: int("contextId"),
  outfitId: int("outfitId"),
  category: varchar("category", { length: 80 }).notNull(),
  statement: text("statement").notNull(),
  source: mysqlEnum("source", ["natalia", "assistant"]).default("natalia").notNull(),
  status: mysqlEnum("status", ["active", "archived"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Referencias visuales separadas explícitamente de las prendas de un armario. */
export const visualReferences = mysqlTable("visualReferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  clientId: int("clientId"),
  referenceType: mysqlEnum("referenceType", ["inspiration", "aesthetic", "silhouette", "palette", "campaign", "look"]).notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  imageKey: varchar("imageKey", { length: 512 }),
  imageUrl: varchar("imageUrl", { length: 1024 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StyleProfile = typeof styleProfiles.$inferSelect;
export type WardrobeItem = typeof wardrobeItems.$inferSelect;
export type PrivacyPreference = typeof privacyPreferences.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type ClientPortalAccess = typeof clientPortalAccesses.$inferSelect;
export type ClientStyleProfile = typeof clientStyleProfiles.$inferSelect;
export type StylingContext = typeof stylingContexts.$inferSelect;
export type Outfit = typeof outfits.$inferSelect;
export type OutfitItem = typeof outfitItems.$inferSelect;
export type StylingDecision = typeof stylingDecisions.$inferSelect;
export type VisualReference = typeof visualReferences.$inferSelect;
