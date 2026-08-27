import { describe, expect, it } from "vitest";
import { buildProfessionalStylistPrompt } from "./style-guide";

describe("buildProfessionalStylistPrompt", () => {
  it("separa las decisiones confirmadas de las prendas realmente disponibles", () => {
    const prompt = buildProfessionalStylistPrompt({
      clientName: "Lucía",
      profile: { avoidedColors: "naranja", imageGoals: "presencia serena" },
      context: { title: "Cena", occasion: "cena informal" },
      decisions: [{ category: "preferencia", statement: "No recomendar tacones." }],
      wardrobe: [{ id: 7, name: "Blazer tinta", itemType: "blazer", primaryColor: "azul marino" }],
      language: "pt-BR",
    });

    expect(prompt).toContain("#7 Blazer tinta");
    expect(prompt).toContain("No recomendar tacones.");
    expect(prompt).toContain("solo estas prendas pueden aparecer");
    expect(prompt).toContain("naranja");
    expect(prompt).toContain("Brazilian Portuguese");
    expect(prompt).toContain("Conserva exactamente los nombres registrados");
  });
});
