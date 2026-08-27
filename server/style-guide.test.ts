import { describe, expect, it } from "vitest";
import { buildStylistSystemPrompt } from "./style-guide";

describe("buildStylistSystemPrompt", () => {
  it("incorpora el perfil y solo las prendas disponibles", () => {
    const prompt = buildStylistSystemPrompt(
      { archetype: "La musa", energy: "Ritmo expresivo", palette: "Celadón e hielo", notes: "Evento nocturno" },
      [{ name: "Blazer grafito", itemType: "blazer", primaryColor: "negro" }],
    );

    expect(prompt).toContain("La musa");
    expect(prompt).toContain("Blazer grafito (blazer, negro)");
    expect(prompt).toContain("No inventes prendas");
  });

  it("señala la ausencia de armario sin fabricar datos", () => {
    const prompt = buildStylistSystemPrompt(undefined, []);
    expect(prompt).toContain("Aún no hay prendas registradas.");
    expect(prompt).toContain("sin definir");
  });
});
