import { describe, expect, it } from "vitest";
import { getStudioLanguage, studioLanguageCodes } from "./studio-languages";

describe("catálogo de idiomas del Studio", () => {
  it("distingue los dos registros de portugués y conserva los siete idiomas solicitados", () => {
    expect(studioLanguageCodes).toHaveLength(7);
    expect(getStudioLanguage("pt-BR").responseInstruction).toContain("Brazilian");
    expect(getStudioLanguage("pt-PT").responseInstruction).toContain("European");
  });
});
