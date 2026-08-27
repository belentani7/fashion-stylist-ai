import type { PrivacyPreference } from "../drizzle/schema";

/** El consentimiento solo está activo cuando existe y no ha sido revocado posteriormente. */
export function hasActiveConsent(preference: PrivacyPreference | undefined) {
  if (!preference?.consentedAt) return false;
  if (!preference.revokedAt) return true;
  return preference.consentedAt.getTime() > preference.revokedAt.getTime();
}
