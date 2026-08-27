import { describe, expect, it } from "vitest";
import { decodeImageData } from "./image-upload";

describe("decodeImageData", () => {
  it("acepta una imagen PNG compacta y conserva su tipo", () => {
    const image = decodeImageData("data:image/png;base64,aGVsbG8=");
    expect(image.contentType).toBe("image/png");
    expect(image.extension).toBe("png");
    expect(image.bytes.toString()).toBe("hello");
  });

  it("rechaza formatos no permitidos", () => {
    expect(() => decodeImageData("data:image/gif;base64,aGVsbG8=")).toThrow("JPG, PNG o WebP");
  });
});
