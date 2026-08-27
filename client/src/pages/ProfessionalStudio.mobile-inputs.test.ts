import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const studioSource = readFileSync(new URL("./ProfessionalStudio.tsx", import.meta.url), "utf8");

describe("cargas móviles del Studio profesional", () => {
  it("ofrece captura desde cámara para prendas y referencias sin ampliar formatos admitidos", () => {
    expect(studioSource.match(/capture="environment"/g)).toHaveLength(2);
    expect(studioSource.match(/accept="image\/jpeg,image\/png,image\/webp"/g)).toHaveLength(2);
  });
});
