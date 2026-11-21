/** Préfixes de langue des pages publiques : /fr/…, /en/…, /es/…, /ar/… (le français reste aussi servi sans préfixe). */
export type SiteLang = 'fr' | 'en' | 'es' | 'ar';

export const SITE_LANGS: readonly SiteLang[] = ['fr', 'en', 'es', 'ar'];

/** Langue de repli : l'anglais (HARX est d'abord une société américaine). Le français reste servi sur /fr. */
export const DEFAULT_SITE_LANG: SiteLang = 'en';

/** Langues qui s'écrivent de droite à gauche. */
export const RTL_LANGS: readonly SiteLang[] = ['ar'];

export function isRtlLang(lang: string | null | undefined): boolean {
  return RTL_LANGS.includes(normalizeSiteLang(lang));
}

/** Code de langue quelconque (« en-GB », « ES », « ar-MA »…) → langue du site ; l'anglais par défaut. */
export function normalizeSiteLang(raw: string | null | undefined): SiteLang {
  const code = (raw || '').toLowerCase().slice(0, 2);
  return (SITE_LANGS as readonly string[]).includes(code) ? (code as SiteLang) : DEFAULT_SITE_LANG;
}

/**
 * Choix de la langue. Décision du fondateur (21/11/2026) : « on gère 4 langues et pour le reste des langues c'est l'anglais ». Par ordre de
 * priorité : préfixe d'URL (/fr, /en, /es, /ar) > choix mémorisé (explicite) > première langue de la liste du navigateur qui fait partie de
 * en, fr, es, ar > anglais. Le pays et le fuseau horaire ne servent pas à choisir la langue.
 */
export function resolveSiteLanguage(input: {
  urlLang: string | null | undefined;
  storedExplicit: string | null | undefined;
  browser: readonly string[] | undefined;
}): SiteLang {
  const supported = (raw: string | null | undefined): SiteLang | null => {
    const code = (raw || '').toLowerCase().slice(0, 2);
    return (SITE_LANGS as readonly string[]).includes(code) ? (code as SiteLang) : null;
  };
  const fromUrl = supported(input.urlLang);
  if (fromUrl) return fromUrl;
  const stored = supported(input.storedExplicit);
  if (stored) return stored;
  for (const candidate of input.browser ?? []) {
    const lang = supported(candidate);
    if (lang) return lang;
  }
  return DEFAULT_SITE_LANG;
}

const LANG_PREFIX_RE = /^\/(fr|en|es|ar)(?=\/|$)/;

export function getLangFromPath(pathname: string): SiteLang | null {
  const match = LANG_PREFIX_RE.exec(pathname);
  return match ? (match[1] as SiteLang) : null;
}

/** `/fr` → `/`, `/en/auth/choice` → `/auth/choice`, chemin sans préfixe inchangé. */
export function stripLangPrefix(pathname: string): string {
  return pathname.replace(LANG_PREFIX_RE, '') || '/';
}

/** `('/', 'en')` → `/en`, `('/auth/choice', 'fr')` → `/fr/auth/choice`. */
export function withLangPrefix(path: string, lang: SiteLang): string {
  const stripped = stripLangPrefix(path);
  return stripped === '/' ? `/${lang}` : `/${lang}${stripped}`;
}

const LEGAL_PATHS = ['/privacy', '/terms', '/cookies', '/gdpr'];

/** Pages publiques qui existent en version préfixée (accueil, TAAS, auth, légal). */
export function isPrefixablePath(pathname: string): boolean {
  const path = stripLangPrefix(pathname).replace(/\/+$/, '') || '/';
  return path === '/' || path === '/taas' || path.startsWith('/auth') || LEGAL_PATHS.includes(path);
}
