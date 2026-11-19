/**
 * Champ téléphone de l'inscription (audit du 19/11, constat n° 7).
 *
 * Le téléphone est FACULTATIF à l'inscription : l'envoi du code SMS (`send-otp`) échoue aujourd'hui, et l'appel de test
 * de la mise en route redemande le numéro. S'il est saisi, il doit être plausible. L'exemple affiché dépend du pays du
 * visiteur (région de la langue du navigateur, sinon langue du site), et non plus d'un numéro américain pour tous.
 *
 * Module sans dépendance (ni React, ni i18n) : testé par `src/lib/phoneField.test.ts`.
 */

/** Numéro saisi plausible : chiffres, espaces, tirets, points, parenthèses, « + » en tête, de 8 à 15 chiffres. */
export function isPlausiblePhone(raw: string): boolean {
  const value = raw.trim();
  if (!/^\+?[\d\s().-]+$/.test(value)) return false;
  const digits = value.replace(/\D/g, '').length;
  return digits >= 8 && digits <= 15;
}

/** Règle de l'inscription : vide accepté (facultatif), sinon numéro plausible. */
export function isValidOptionalPhone(raw: string): boolean {
  return raw.trim() === '' || isPlausiblePhone(raw);
}

/** Exemples fictifs (plages réservées à la fiction quand le pays en a une), au format international. */
export const PHONE_EXAMPLES: Readonly<Record<string, string>> = {
  FR: '+33 6 12 34 56 78',
  GB: '+44 7700 900123',
  US: '+1 201 555 0123',
  CA: '+1 506 555 0123',
  ES: '+34 612 34 56 78',
  MX: '+52 55 1234 5678',
  BE: '+32 470 12 34 56',
  CH: '+41 78 123 45 67',
  LU: '+352 621 123 456',
  DE: '+49 1512 3456789',
  IT: '+39 312 345 6789',
  IE: '+353 85 123 4567',
  PT: '+351 912 345 678',
  NL: '+31 6 12345678',
  MA: '+212 6 12 34 56 78',
  DZ: '+213 551 23 45 67',
  TN: '+216 20 123 456',
  SN: '+221 77 123 45 67',
  CI: '+225 07 12 34 56 78',
  AE: '+971 50 123 4567',
  SA: '+966 50 123 4567',
  EG: '+20 100 123 4567',
};

/** Pays retenu quand la langue du navigateur n'indique pas de région. */
const COUNTRY_BY_LANG: Readonly<Record<string, string>> = { fr: 'FR', en: 'GB', es: 'ES', ar: 'MA' };

/** Pays du visiteur : région de la première langue du navigateur qui en a une et que l'on connaît, sinon langue du site. */
export function guessPhoneCountry(input: { browser?: readonly string[]; siteLang?: string | null }): string {
  for (const tag of input.browser ?? []) {
    const region = /^[a-z]{2,3}[-_]([a-z]{2})\b/i.exec(tag || '')?.[1]?.toUpperCase();
    if (region && PHONE_EXAMPLES[region]) return region;
  }
  const lang = (input.siteLang || input.browser?.[0] || '').toLowerCase().slice(0, 2);
  return COUNTRY_BY_LANG[lang] ?? 'GB';
}

/** Exemple de numéro affiché dans le champ, selon le pays du visiteur. */
export function phonePlaceholder(input: { browser?: readonly string[]; siteLang?: string | null }): string {
  return PHONE_EXAMPLES[guessPhoneCountry(input)] ?? PHONE_EXAMPLES.GB;
}

/**
 * Refus du serveur faute de téléphone (le modèle de compte l'exige encore tant que le serveur n'est pas adapté) :
 * on revient alors à l'étape téléphone avec un message clair, au lieu d'un échec générique.
 */
export function isMissingPhoneError(message: string | null | undefined): boolean {
  const m = (message || '').toLowerCase();
  return m.includes('phone') && (m.includes('required') || m.includes('obligatoire'));
}
