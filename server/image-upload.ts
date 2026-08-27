const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const supportedImages: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function decodeImageData(dataUrl: string) {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) throw new Error("Usa una imagen JPG, PNG o WebP.");
  const contentType = match[1];
  const extension = supportedImages[contentType];
  const bytes = Buffer.from(match[2], "base64");
  if (!bytes.length || bytes.length > MAX_IMAGE_BYTES) throw new Error("La imagen debe pesar como máximo 4 MB.");
  return { bytes, contentType, extension };
}
