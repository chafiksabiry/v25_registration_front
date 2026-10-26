/** Préfixes de langue des pages publiques : /fr/… et /en/… (le français reste aussi servi sans préfixe). */
export type SiteLang = 'fr' | 'en';

export const SITE_LANGS: readonly SiteLang[] = ['fr', 'en'];

const LANG_PREFIX_RE = /^\/(fr|en)(?=\/|$)/;

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

/** Pages publiques qui existent en version préfixée (landing, auth, légal). */
export function isPrefixablePath(pathname: string): boolean {
  const path = stripLangPrefix(pathname).replace(/\/+$/, '') || '/';
  return path === '/' || path.startsWith('/auth') || LEGAL_PATHS.includes(path);
}
