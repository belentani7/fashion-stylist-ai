import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { consentToClientPortal, createClient, createOutfit, createStylingContext, createStylingDecision, createVisualReference, createWardrobeItem, getApprovedClientProposal, getClientPortalAccessForOwner, getClientPortalAccessForViewer, getClientStyleProfile, getOutfitItems, getOwnedClient, getPrivacyPreference, getStyleProfile, grantClientPortalAccess, grantDataProcessingConsent, listClientWardrobe, listClients, listOutfits, listStylingContexts, listStylingDecisions, listVisualReferences, revokeClientPortalAccess, revokeDataProcessingConsent, saveClientStyleProfile, saveStyleProfile, setOutfitClientVisibility, updateOutfitNarrative } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { decodeImageData } from "./image-upload";
import { hasActiveConsent } from "./privacy";
import { storagePut } from "./storage";
import { buildProfessionalStylistPrompt, buildStylistSystemPrompt } from "./style-guide";
import { studioLanguageCodes } from "@shared/studio-languages";

const optionalText = (limit: number) => z.string().trim().max(limit).optional();
const optionalNullableText = (limit: number) => z.string().trim().max(limit).nullable().optional();
const clientIdInput = z.number().int().positive();

const styleMessage = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(2200),
});

const alternativeSchema = z.object({
  garmentIds: z.array(z.number().int().positive()).min(1).max(4),
  note: z.string().trim().max(220),
});
const proposedLookSchema = z.object({
  name: z.string().trim().min(2).max(160),
  garmentIds: z.array(z.number().int().positive()).max(12),
  whyWorks: z.string().trim().min(2).max(1200),
  adjustment: z.string().trim().max(1200),
  alternatives: z.array(alternativeSchema).max(3),
  question: z.string().trim().max(400),
});
const proposedResponseSchema = z.object({ proposals: z.array(proposedLookSchema).max(3) });

async function requireDataConsent(userId: number) {
  const preference = await getPrivacyPreference(userId);
  if (!hasActiveConsent(preference)) {
    throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Confirma el uso de tus datos de estilo antes de guardar información o pedir una recomendación." });
  }
}

async function requireOwnedClient(userId: number, clientId: number) {
  const client = await getOwnedClient(userId, clientId);
  if (!client) throw new TRPCError({ code: "NOT_FOUND", message: "La clienta seleccionada no está disponible en tu Studio." });
  return client;
}

const clientProfileInput = z.object({
  dominantStyle: optionalNullableText(100),
  secondaryStyles: optionalNullableText(800),
  preferredColors: optionalNullableText(800),
  avoidedColors: optionalNullableText(800),
  silhouettes: optionalNullableText(800),
  proportions: optionalNullableText(800),
  materials: optionalNullableText(800),
  patterns: optionalNullableText(800),
  formality: optionalNullableText(80),
  frequentOccasions: optionalNullableText(800),
  favoriteItems: optionalNullableText(800),
  neverWears: optionalNullableText(800),
  brands: optionalNullableText(800),
  budgetRange: optionalNullableText(120),
  experimentLevel: optionalNullableText(80),
  imageGoals: optionalNullableText(800),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  privacy: router({
    status: protectedProcedure.query(async ({ ctx }) => {
      const preference = await getPrivacyPreference(ctx.user.id);
      return { isActive: hasActiveConsent(preference), consentedAt: preference?.consentedAt ?? null, revokedAt: preference?.revokedAt ?? null };
    }),
    grant: protectedProcedure.mutation(async ({ ctx }) => ({ isActive: hasActiveConsent(await grantDataProcessingConsent(ctx.user.id)) })),
    revoke: protectedProcedure.mutation(async ({ ctx }) => ({ isActive: hasActiveConsent(await revokeDataProcessingConsent(ctx.user.id)) })),
  }),
  style: router({
    profile: protectedProcedure.query(({ ctx }) => getStyleProfile(ctx.user.id)),
    saveProfile: protectedProcedure.input(z.object({ archetype: z.string().trim().min(2).max(80), energy: z.string().trim().min(2).max(80), palette: z.string().trim().min(2).max(80), notes: optionalText(500) })).mutation(async ({ ctx, input }) => {
      await requireDataConsent(ctx.user.id);
      return saveStyleProfile({ userId: ctx.user.id, ...input });
    }),
  }),
  clients: router({
    list: adminProcedure.query(({ ctx }) => listClients(ctx.user.id)),
    create: adminProcedure.input(z.object({ displayName: z.string().trim().min(2).max(160), notes: optionalText(1000) })).mutation(async ({ ctx, input }) => {
      await requireDataConsent(ctx.user.id);
      return createClient({ userId: ctx.user.id, ...input });
    }),
    profile: adminProcedure.input(clientIdInput).query(async ({ ctx, input }) => {
      await requireOwnedClient(ctx.user.id, input);
      return getClientStyleProfile(input);
    }),
    saveProfile: adminProcedure.input(z.object({ clientId: clientIdInput, values: clientProfileInput })).mutation(async ({ ctx, input }) => {
      await requireDataConsent(ctx.user.id);
      await requireOwnedClient(ctx.user.id, input.clientId);
      return saveClientStyleProfile({ clientId: input.clientId, ...input.values });
    }),
  }),
  clientSharing: router({
    status: adminProcedure.input(clientIdInput).query(async ({ ctx, input }) => {
      await requireOwnedClient(ctx.user.id, input);
      return getClientPortalAccessForOwner(ctx.user.id, input);
    }),
    grant: adminProcedure.input(z.object({ clientId: clientIdInput, clientEmail: z.string().trim().email().max(320) })).mutation(async ({ ctx, input }) => {
      await requireDataConsent(ctx.user.id);
      await requireOwnedClient(ctx.user.id, input.clientId);
      return grantClientPortalAccess({ stylistUserId: ctx.user.id, clientId: input.clientId, clientEmail: input.clientEmail.trim().toLowerCase() });
    }),
    revoke: adminProcedure.input(clientIdInput).mutation(async ({ ctx, input }) => {
      await requireOwnedClient(ctx.user.id, input);
      return revokeClientPortalAccess(ctx.user.id, input);
    }),
  }),
  clientPortal: router({
    status: protectedProcedure.query(async ({ ctx }) => {
      const access = await getClientPortalAccessForViewer({ userId: ctx.user.id, email: ctx.user.email });
      return { hasAccess: Boolean(access), isConsented: Boolean(access?.consentedAt), status: access?.status ?? null };
    }),
    consent: protectedProcedure.mutation(async ({ ctx }) => {
      const access = await consentToClientPortal(ctx.user.id, ctx.user.email);
      if (!access) throw new TRPCError({ code: "FORBIDDEN", message: "Tu cuenta no tiene una invitación activa al portal de clienta." });
      return { isConsented: Boolean(access.consentedAt) };
    }),
    proposal: protectedProcedure.query(async ({ ctx }) => {
      const proposal = await getApprovedClientProposal(ctx.user.id, ctx.user.email);
      if (!proposal.access) throw new TRPCError({ code: "FORBIDDEN", message: "Tu cuenta no tiene acceso a una propuesta de clienta." });
      return { isConsented: Boolean(proposal.access.consentedAt), client: proposal.client ?? null, looks: proposal.looks };
    }),
  }),
  contexts: router({
    list: adminProcedure.input(clientIdInput).query(async ({ ctx, input }) => {
      await requireOwnedClient(ctx.user.id, input);
      return listStylingContexts(input);
    }),
    create: adminProcedure.input(z.object({ clientId: clientIdInput, title: z.string().trim().min(2).max(160), occasion: optionalText(160), season: optionalText(80), climate: optionalText(120), formality: optionalText(80), objective: optionalText(1200), constraints: optionalText(1200) })).mutation(async ({ ctx, input }) => {
      await requireDataConsent(ctx.user.id);
      await requireOwnedClient(ctx.user.id, input.clientId);
      return createStylingContext(input);
    }),
  }),
  wardrobe: router({
    list: protectedProcedure.input(z.object({ clientId: clientIdInput.optional() }).optional()).query(async ({ ctx, input }) => {
      if (input?.clientId) await requireOwnedClient(ctx.user.id, input.clientId);
      return listClientWardrobe(ctx.user.id, input?.clientId);
    }),
    add: protectedProcedure.input(z.object({ clientId: clientIdInput.optional(), name: z.string().trim().min(2).max(160), itemType: z.string().trim().min(2).max(80), subcategory: optionalText(80), primaryColor: optionalText(80), material: optionalText(80), pattern: optionalText(80), silhouette: optionalText(80), season: optionalText(80), formality: optionalText(80), condition: optionalText(80), brand: optionalText(120), size: optionalText(80), garmentNotes: optionalText(1200), tags: optionalText(280), imageData: z.string().max(6_000_000).optional() })).mutation(async ({ ctx, input }) => {
      await requireDataConsent(ctx.user.id);
      if (input.clientId) await requireOwnedClient(ctx.user.id, input.clientId);
      const { imageData, ...garmentInput } = input;
      let imageReference: { imageKey?: string; imageUrl?: string } = {};
      if (imageData) {
        const image = decodeImageData(imageData);
        const stored = await storagePut(`private/${ctx.user.id}/wardrobe/${input.clientId ?? "personal"}/garment.${image.extension}`, image.bytes, image.contentType);
        imageReference = { imageKey: stored.key, imageUrl: stored.url };
      }
      return createWardrobeItem({ userId: ctx.user.id, ...garmentInput, ...imageReference });
    }),
  }),
  decisions: router({
    list: adminProcedure.input(z.object({ clientId: clientIdInput.optional() }).optional()).query(async ({ ctx, input }) => {
      if (input?.clientId) await requireOwnedClient(ctx.user.id, input.clientId);
      return listStylingDecisions(ctx.user.id, input?.clientId);
    }),
    create: adminProcedure.input(z.object({ clientId: clientIdInput.optional(), contextId: z.number().int().positive().optional(), outfitId: z.number().int().positive().optional(), category: z.string().trim().min(2).max(80), statement: z.string().trim().min(2).max(1200) })).mutation(async ({ ctx, input }) => {
      await requireDataConsent(ctx.user.id);
      if (input.clientId) await requireOwnedClient(ctx.user.id, input.clientId);
      return createStylingDecision({ userId: ctx.user.id, ...input });
    }),
  }),
  outfits: router({
    list: adminProcedure.input(z.object({ clientId: clientIdInput.optional() }).optional()).query(async ({ ctx, input }) => {
      if (input?.clientId) await requireOwnedClient(ctx.user.id, input.clientId);
      return listOutfits(ctx.user.id, input?.clientId);
    }),
    presentation: adminProcedure.input(clientIdInput).query(async ({ ctx, input }) => {
      await requireOwnedClient(ctx.user.id, input);
      const [items, wardrobe] = await Promise.all([listOutfits(ctx.user.id, input), listClientWardrobe(ctx.user.id, input)]);
      const garments = new Map(wardrobe.map((garment) => [garment.id, garment]));
      return Promise.all(items.filter((item) => item.status !== "archived").map(async (outfit) => ({
        ...outfit,
        components: (await getOutfitItems(outfit.id)).map((item) => {
          const garment = garments.get(item.garmentId);
          return { id: item.id, role: item.role, name: garment?.name ?? "Prenda no disponible", itemType: garment?.itemType ?? null, color: garment?.primaryColor ?? null, imageUrl: garment?.imageUrl ?? null };
        }),
      })));
    }),
    create: adminProcedure.input(z.object({ clientId: clientIdInput.optional(), contextId: z.number().int().positive().optional(), name: z.string().trim().min(2).max(160), occasion: optionalText(160), formality: optionalText(80), explanation: optionalText(1200), adjustment: optionalText(1200), items: z.array(z.object({ garmentId: z.number().int().positive(), role: optionalText(80), notes: optionalText(400) })).max(20) })).mutation(async ({ ctx, input }) => {
      await requireDataConsent(ctx.user.id);
      if (input.clientId) await requireOwnedClient(ctx.user.id, input.clientId);
      const wardrobe = await listClientWardrobe(ctx.user.id);
      const permittedIds = new Set(wardrobe.map((item) => item.id));
      if (input.items.some((item) => !permittedIds.has(item.garmentId))) throw new TRPCError({ code: "FORBIDDEN", message: "Solo puedes usar prendas que estén registradas en tu armario." });
      return createOutfit({ userId: ctx.user.id, ...input });
    }),
    updateNarrative: adminProcedure.input(z.object({ outfitId: z.number().int().positive(), explanation: z.string().trim().min(2).max(1200), adjustment: optionalText(1200) })).mutation(async ({ ctx, input }) => {
      await requireDataConsent(ctx.user.id);
      const updated = await updateOutfitNarrative({ userId: ctx.user.id, ...input });
      if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "El look que quieres editar no está disponible." });
      return updated;
    }),
    setClientVisibility: adminProcedure.input(z.object({ outfitId: z.number().int().positive(), visibleToClient: z.boolean() })).mutation(async ({ ctx, input }) => {
      await requireDataConsent(ctx.user.id);
      const updated = await setOutfitClientVisibility({ userId: ctx.user.id, ...input });
      if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "El look que quieres aprobar no está disponible." });
      return updated;
    }),
  }),
  references: router({
    list: adminProcedure.input(z.object({ clientId: clientIdInput.optional() }).optional()).query(async ({ ctx, input }) => {
      if (input?.clientId) await requireOwnedClient(ctx.user.id, input.clientId);
      return listVisualReferences(ctx.user.id, input?.clientId);
    }),
    create: adminProcedure.input(z.object({ clientId: clientIdInput.optional(), referenceType: z.enum(["inspiration", "aesthetic", "silhouette", "palette", "campaign", "look"]), title: z.string().trim().min(2).max(160), notes: optionalText(1200), imageData: z.string().max(6_000_000).optional() })).mutation(async ({ ctx, input }) => {
      await requireDataConsent(ctx.user.id);
      if (input.clientId) await requireOwnedClient(ctx.user.id, input.clientId);
      const { imageData, ...referenceInput } = input;
      let imageReference: { imageKey?: string; imageUrl?: string } = {};
      if (imageData) {
        const image = decodeImageData(imageData);
        const stored = await storagePut(`private/${ctx.user.id}/references/${input.clientId ?? "studio"}/reference.${image.extension}`, image.bytes, image.contentType);
        imageReference = { imageKey: stored.key, imageUrl: stored.url };
      }
      return createVisualReference({ userId: ctx.user.id, ...referenceInput, ...imageReference });
    }),
  }),
  stylist: router({
    reply: protectedProcedure.input(z.object({ messages: z.array(styleMessage).min(1).max(12), language: z.enum(studioLanguageCodes).optional() })).mutation(async ({ ctx, input }) => {
      await requireDataConsent(ctx.user.id);
      const profile = await getStyleProfile(ctx.user.id);
      const wardrobe = await listClientWardrobe(ctx.user.id);
      const systemPrompt = buildStylistSystemPrompt(profile, wardrobe, input.language);
      const response = await invokeLLM({ messages: [{ role: "system", content: systemPrompt }, ...input.messages] });
      const content = response.choices[0]?.message?.content;
      return { reply: typeof content === "string" ? content : "No pude elaborar la recomendación. Inténtalo de nuevo." };
    }),
    propose: adminProcedure.input(z.object({ clientId: clientIdInput, contextId: z.number().int().positive().optional(), language: z.enum(studioLanguageCodes).optional() })).mutation(async ({ ctx, input }) => {
      await requireDataConsent(ctx.user.id);
      const client = await requireOwnedClient(ctx.user.id, input.clientId);
      const [profile, contexts, wardrobe, decisions] = await Promise.all([
        getClientStyleProfile(input.clientId),
        listStylingContexts(input.clientId),
        listClientWardrobe(ctx.user.id, input.clientId),
        listStylingDecisions(ctx.user.id, input.clientId),
      ]);
      const context = input.contextId ? contexts.find((item) => item.id === input.contextId) : contexts[0];
      if (input.contextId && !context) throw new TRPCError({ code: "NOT_FOUND", message: "El encargo seleccionado no pertenece a esta clienta." });
      const language = input.language ?? "es-ES";
      const systemPrompt = buildProfessionalStylistPrompt({ clientName: client.displayName, profile, context, wardrobe, decisions, language });
      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Elabora hasta tres propuestas de look. Si faltan prendas o contexto, devuelve una propuesta parcial y deja una única pregunta concreta en question. Todos los valores de texto del JSON deben estar en el idioma de respuesta seleccionado." },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "styling_proposals",
            strict: true,
            schema: {
              type: "object",
              properties: {
                proposals: {
                  type: "array",
                  maxItems: 3,
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      garmentIds: { type: "array", items: { type: "integer" }, maxItems: 12 },
                      whyWorks: { type: "string" },
                      adjustment: { type: "string" },
                      alternatives: {
                        type: "array",
                        maxItems: 3,
                        items: {
                          type: "object",
                          properties: {
                            garmentIds: { type: "array", items: { type: "integer" }, minItems: 1, maxItems: 4 },
                            note: { type: "string" },
                          },
                          required: ["garmentIds", "note"],
                          additionalProperties: false,
                        },
                      },
                      question: { type: "string" },
                    },
                    required: ["name", "garmentIds", "whyWorks", "adjustment", "alternatives", "question"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["proposals"],
              additionalProperties: false,
            },
          },
        },
      });
      const content = response.choices[0]?.message?.content;
      if (typeof content !== "string") return { language, proposals: [], advisory: "No se recibió una propuesta estructurada. Puedes continuar creando un look manual." };
      try {
        const parsed = proposedResponseSchema.parse(JSON.parse(content));
        const validGarmentIds = new Set(wardrobe.map((item) => item.id));
        const proposals = parsed.proposals.map((proposal) => ({
          ...proposal,
          garmentIds: proposal.garmentIds.filter((id) => validGarmentIds.has(id)),
          alternatives: proposal.alternatives.map((alternative) => ({ ...alternative, garmentIds: alternative.garmentIds.filter((id) => validGarmentIds.has(id)) })).filter((alternative) => alternative.garmentIds.length > 0),
        }));
        return { language, proposals, advisory: proposals.some((proposal) => proposal.garmentIds.length === 0) ? "Una propuesta no contiene prendas verificables. Revísala o crea el look manualmente." : null };
      } catch {
        return { language, proposals: [], advisory: "La propuesta no pudo verificarse. Puedes continuar creando un look manual." };
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
