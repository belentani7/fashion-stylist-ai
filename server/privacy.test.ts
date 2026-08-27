import { describe, expect, it } from "vitest";
import { hasActiveConsent } from "./privacy";

describe("hasActiveConsent", () => {
  const base = { id: 1, userId: 1, updatedAt: new Date("2026-08-26T00:00:00.000Z") };

  it("solo activa el tratamiento con consentimiento vigente", () => {
    expect(hasActiveConsent({ ...base, consentedAt: new Date("2026-08-26T00:00:00.000Z"), revokedAt: null })).toBe(true);
    expect(hasActiveConsent({ ...base, consentedAt: null, revokedAt: null })).toBe(false);
  });

  it("desactiva el tratamiento cuando la revocación es más reciente", () => {
    expect(hasActiveConsent({ ...base, consentedAt: new Date("2026-08-26T00:00:00.000Z"), revokedAt: new Date("2026-08-26T01:00:00.000Z") })).toBe(false);
  });
});
