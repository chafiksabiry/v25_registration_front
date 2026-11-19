/**
 * Adresses publiques que ce module reçoit sans les servir lui-même (audit du 19/11, constat n° 3, T2).
 *
 * Module sans dépendance (ni React, ni i18n) : testé par `src/lib/publicRoutes.test.ts`.
 */

const SITE_LANG_RE = /^\/(fr|en|es|ar)(?=\/|$)/;
const LANG_TELEPHONY_RE = /^\/(fr|en|es|ar)(\/telephony(?:\/.*)?)$/;

export type HandoffLang = 'fr' | 'en' | 'es' | 'ar';

/**
 * `/:lang/telephony*` appartient à l'application Téléphonie (servie sous `/telephony*`, sans préfixe de langue).
 * Normalement l'hôte (v25_process_connections) redirige avant de monter ce module ; si ce module est monté quand même,
 * il renvoie vers `/telephony*` (requête et ancre gardées) avec la langue de l'adresse, au lieu d'une page 404.
 */
export function telephonyHandoff(loc: { pathname: string; search?: string; hash?: string }): { lang: HandoffLang; url: string } | null {
  const match = LANG_TELEPHONY_RE.exec(loc.pathname);
  if (!match) return null;
  const path = match[2].replace(/\/+$/, '') || '/telephony';
  return { lang: match[1] as HandoffLang, url: `${path}${loc.search || ''}${loc.hash || ''}` };
}

/** Clés de langue partagées avec l'accueil HARX et l'application Téléphonie (même origine). */
export const LANG_STORAGE = { site: 'harxSiteLang', shared: 'i18nextLng', explicit: 'harxLangExplicit' } as const;

/** Mémorise la langue comme choix explicite ; ne lève jamais (stockage indisponible : la langue par défaut s'applique). */
export function rememberExplicitLang(lang: HandoffLang, storage: Pick<Storage, 'setItem'> | null): void {
  if (!storage) return;
  try {
    storage.setItem(LANG_STORAGE.site, lang);
    storage.setItem(LANG_STORAGE.shared, lang);
    storage.setItem(LANG_STORAGE.explicit, '1');
  } catch {
    /* ignore */
  }
}

/**
 * Garde de `/auth/register-company` : tant que l'offre Company (TAAS) est « bientôt », l'inscription entreprise n'est pas
 * ouverte, même par adresse directe. Renvoie la page TAAS Company (qui l'annonce) ; `null` quand l'inscription est ouverte.
 */
export function registerCompanyFallback(companySoon: boolean): string | null {
  return companySoon ? '/taas/company' : null;
}

/** Préfixe de langue de l'adresse (`/en/…` → `en`), ou `null`. */
export function langPrefixOf(pathname: string): HandoffLang | null {
  const match = SITE_LANG_RE.exec(pathname);
  return match ? (match[1] as HandoffLang) : null;
}
