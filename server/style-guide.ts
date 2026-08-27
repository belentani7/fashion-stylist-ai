import { getStudioLanguage, type StudioLanguageCode } from "@shared/studio-languages";

export type StyleProfileContext = {
  archetype?: string | null;
  energy?: string | null;
  palette?: string | null;
  notes?: string | null;
};

export type WardrobeContextItem = {
  id?: number;
  name: string;
  itemType: string;
  primaryColor?: string | null;
  material?: string | null;
  formality?: string | null;
};

export type ProfessionalProfileContext = {
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
};

export type StylingContextInput = {
  title: string;
  occasion?: string | null;
  season?: string | null;
  climate?: string | null;
  formality?: string | null;
  objective?: string | null;
  constraints?: string | null;
};

export type DecisionContext = { category: string; statement: string };

function line(label: string, value: string | null | undefined) {
  return `${label}: ${value?.trim() || "sin definir"}.`;
}

export function buildStylistSystemPrompt(profile: StyleProfileContext | undefined, wardrobe: WardrobeContextItem[], language: StudioLanguageCode = "es-ES") {
  const wardrobeSummary = wardrobe.length
    ? wardrobe.map((item) => `${item.name} (${item.itemType}${item.primaryColor ? `, ${item.primaryColor}` : ""})`).join("; ")
    : "Aún no hay prendas registradas.";
  const responseLanguage = getStudioLanguage(language).responseInstruction;

  return [
    `Eres un asistente de apoyo para una estilista profesional. Responde en ${responseLanguage} con precisión, calidez e inclusión.`,
    "Nunca avergüences el cuerpo ni presentes reglas estéticas como obligaciones. Explica Gestalt de forma práctica solo cuando mejore una decisión.",
    `Perfil actual: arquetipo ${profile?.archetype ?? "sin definir"}; energía ${profile?.energy ?? "sin definir"}; paleta ${profile?.palette ?? "sin definir"}; notas ${profile?.notes ?? "sin notas"}.`,
    `Armario disponible: ${wardrobeSummary}`,
    "No inventes prendas. Si falta información, formula una sola pregunta útil.",
  ].join("\n");
}

export function buildProfessionalStylistPrompt(input: {
  clientName: string;
  profile?: ProfessionalProfileContext;
  context?: StylingContextInput;
  wardrobe: WardrobeContextItem[];
  decisions: DecisionContext[];
  language?: StudioLanguageCode;
}) {
  const wardrobeSummary = input.wardrobe.length
    ? input.wardrobe.map((item) => `#${item.id ?? "?"} ${item.name} · ${item.itemType}${item.primaryColor ? ` · ${item.primaryColor}` : ""}${item.material ? ` · ${item.material}` : ""}${item.formality ? ` · ${item.formality}` : ""}`).join("\n")
    : "No hay prendas registradas para esta clienta.";
  const decisionsSummary = input.decisions.length ? input.decisions.map((decision) => `- ${decision.category}: ${decision.statement}`).join("\n") : "No hay decisiones previas registradas.";
  const responseLanguage = getStudioLanguage(input.language ?? "es-ES").responseInstruction;

  return [
    "Eres el asistente contextual del estudio profesional de Natalia. Tu función es apoyar, no reemplazar, el criterio de Natalia.",
    `IDIOMA DE RESPUESTA: redacta todos los textos dirigidos a la persona usuaria en ${responseLanguage}. Conserva exactamente los nombres registrados de prendas y los identificadores numéricos; no los traduzcas ni inventes equivalencias.`,
    "PROTOCOLO DE TRES NODOS: (1) Persona y encargo: usa únicamente datos confirmados. (2) Mesa de composición: usa exclusivamente prendas con identificadores reales del armario. Las referencias de inspiración no son prendas disponibles. (3) Propuesta profesional: plantea alternativas para revisión humana; nunca publica, compra ni confirma decisiones.",
    "REGLAS: no inventes prendas, medidas, disponibilidad, clima, presupuesto ni preferencias. No conviertas sugerencias en hechos. Si faltan datos, marca una única pregunta o devuelve una propuesta parcial. Evita imperativos corporales y explica armonía, proporción, color o formalidad solo cuando resulten útiles.",
    `CLIENTA: ${input.clientName}.`,
    "PERFIL CONFIRMADO:",
    line("Estilo dominante", input.profile?.dominantStyle),
    line("Estilos secundarios", input.profile?.secondaryStyles),
    line("Colores preferidos", input.profile?.preferredColors),
    line("Colores a evitar", input.profile?.avoidedColors),
    line("Siluetas", input.profile?.silhouettes),
    line("Proporciones", input.profile?.proportions),
    line("Materiales", input.profile?.materials),
    line("Estampados", input.profile?.patterns),
    line("Formalidad preferida", input.profile?.formality),
    line("Prendas que no utiliza", input.profile?.neverWears),
    line("Objetivo de imagen", input.profile?.imageGoals),
    "ENCARGO ACTUAL:",
    line("Nombre", input.context?.title),
    line("Ocasión", input.context?.occasion),
    line("Estación", input.context?.season),
    line("Clima", input.context?.climate),
    line("Formalidad solicitada", input.context?.formality),
    line("Objetivo", input.context?.objective),
    line("Restricciones", input.context?.constraints),
    "DECISIONES CONFIRMADAS POR NATALIA:",
    decisionsSummary,
    "ARMARIO DISPONIBLE (solo estas prendas pueden aparecer en componentes):",
    wardrobeSummary,
    "Devuelve una propuesta con nombre, IDs de prendas válidos, explicación profesional, ajuste y una única pregunta si faltan datos críticos. Cada alternativa debe incluir solo garmentIds reales y una nota breve; nunca nombres prendas fuera del armario.",
  ].join("\n");
}
