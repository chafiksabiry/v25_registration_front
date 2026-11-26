import { isNomadRegisterPath } from './offerRegister';

/**
 * Préremplissage de l'inscription NOMAD depuis le lien de l'e-mail d'activation envoyé après une création de compte dans l'app mobile
 * (v25_registration_backend, utils/appSignup.js : `/nomad/inscription?email=…&lang=…`). Seulement sur l'adresse d'inscription NOMAD.
 * L'e-mail est validé (forme, longueur) et n'est jamais injecté en HTML : il ne sert que de valeur initiale d'un champ React.
 */
export const PREFILL_LANGS = ['en', 'fr', 'es', 'ar'] as const;
export type PrefillLang = (typeof PREFILL_LANGS)[number];

const EMAIL_OK = /^[^\s@<>"'`]+@[^\s@<>"'`]+\.[^\s@<>"'`]{2,}$/;

export function prefillEmail(raw: string | null | undefined): string | null {
  if (typeof raw !== 'string') return null;
  const email = raw.trim().toLowerCase();
  return email.length <= 254 && EMAIL_OK.test(email) ? email : null;
}

export function prefillLang(raw: string | null | undefined): PrefillLang | null {
  const l = String(raw ?? '').trim().toLowerCase().slice(0, 2);
  return (PREFILL_LANGS as readonly string[]).includes(l) ? (l as PrefillLang) : null;
}

/** Valeurs à préremplir pour cette adresse ; vide hors de l'inscription NOMAD ou si les paramètres sont invalides. */
export function registerPrefill(loc: { pathname: string; search?: string }): { email: string | null; lang: PrefillLang | null } {
  if (!isNomadRegisterPath(loc.pathname)) return { email: null, lang: null };
  const params = new URLSearchParams(loc.search || '');
  return { email: prefillEmail(params.get('email')), lang: prefillLang(params.get('lang')) };
}

/** Lecture au chargement de la page (navigateur seulement). */
export function browserRegisterPrefill(): { email: string | null; lang: PrefillLang | null } {
  if (typeof window === 'undefined') return { email: null, lang: null };
  return registerPrefill(window.location);
}
