export const studioLanguageCodes = ["es-ES", "pt-BR", "pt-PT", "en-US", "fr-FR", "it-IT", "de-DE"] as const;

export type StudioLanguageCode = typeof studioLanguageCodes[number];

export type StudioLanguage = {
  code: StudioLanguageCode;
  label: string;
  responseInstruction: string;
};

export const studioLanguages: Record<StudioLanguageCode, StudioLanguage> = {
  "es-ES": { code: "es-ES", label: "Español", responseInstruction: "Spanish (Spain)" },
  "pt-BR": { code: "pt-BR", label: "Português (Brasil)", responseInstruction: "Brazilian Portuguese" },
  "pt-PT": { code: "pt-PT", label: "Português (Portugal)", responseInstruction: "European Portuguese (Portugal)" },
  "en-US": { code: "en-US", label: "English", responseInstruction: "English (United States)" },
  "fr-FR": { code: "fr-FR", label: "Français", responseInstruction: "French (France)" },
  "it-IT": { code: "it-IT", label: "Italiano", responseInstruction: "Italian (Italy)" },
  "de-DE": { code: "de-DE", label: "Deutsch", responseInstruction: "German (Germany)" },
};

export function getStudioLanguage(code: StudioLanguageCode) {
  return studioLanguages[code];
}
