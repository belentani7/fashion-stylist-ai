export function requiredTextError(value: string, label: string, minLength = 2) {
  return value.trim().length >= minLength ? null : `Completa ${label} con al menos ${minLength} caracteres.`;
}

export function imageFileError(file: { type: string; size: number } | undefined) {
  if (!file) return null;
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return "Usa una imagen JPG, PNG o WebP.";
  if (file.size > 4 * 1024 * 1024) return "La imagen debe pesar como máximo 4 MB.";
  return null;
}
