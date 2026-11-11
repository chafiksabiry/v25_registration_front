/** Préfixes de langue des pages publiques : /fr/…, /en/…, /es/…, /ar/… (le français reste aussi servi sans préfixe). */
export type SiteLang = 'fr' | 'en' | 'es' | 'ar';

export const SITE_LANGS: readonly SiteLang[] = ['fr', 'en', 'es', 'ar'];

/** Langues qui s'écrivent de droite à gauche. */
export const RTL_LANGS: readonly SiteLang[] = ['ar'];

export function isRtlLang(lang: string | null | undefined): boolean {
  return RTL_LANGS.includes(normalizeSiteLang(lang));
}

/** Code de langue quelconque (« en-GB », « ES », « ar-MA »…) → langue du site ; le français par défaut. */
export function normalizeSiteLang(raw: string | null | undefined): SiteLang {
  const code = (raw || '').toLowerCase().slice(0, 2);
  return (SITE_LANGS as readonly string[]).includes(code) ? (code as SiteLang) : 'fr';
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
