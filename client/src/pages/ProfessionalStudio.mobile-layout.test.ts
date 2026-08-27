import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const mobileStyles = readFileSync(new URL("../professional-studio.css", import.meta.url), "utf8");

describe("contrato móvil del Studio profesional", () => {
  it("preserva objetivos táctiles y espacio seguro para el recorrido de los tres nodos", () => {
    expect(mobileStyles).toContain("min-height:44px");
    expect(mobileStyles).toContain("min-height:46px");
    expect(mobileStyles).toContain("env(safe-area-inset-bottom)");
    expect(mobileStyles).toContain("font-size:16px");
  });
});
