import { describe, expect, it } from "vitest";
import { imageFileError, requiredTextError } from "./studioValidation";

describe("validación del Studio", () => {
  it("muestra un error claro para texto obligatorio incompleto", () => {
    expect(requiredTextError(" ", "el nombre de la clienta")).toContain("nombre de la clienta");
    expect(requiredTextError("Natalia", "el nombre de la clienta")).toBeNull();
  });

  it("admite solo imágenes pequeñas permitidas", () => {
    expect(imageFileError({ type: "image/webp", size: 1000 })).toBeNull();
    expect(imageFileError({ type: "image/gif", size: 1000 })).toContain("JPG");
    expect(imageFileError({ type: "image/png", size: 5 * 1024 * 1024 })).toContain("4 MB");
  });
});
