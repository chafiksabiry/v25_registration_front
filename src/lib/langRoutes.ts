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
 * Fuseaux horaires (IANA) des pays francophones (FR BE CH LU MC, Afrique francophone, Maghreb) et des territoires français : c'est le pays
 * « détecté » d'un visiteur du site public, qui n'a pas encore de société. Le Canada n'y est pas (anglais, Québec non détectable).
 */
export const FRENCH_TIME_ZONES: readonly string[] = [
  'Europe/Paris', 'Europe/Brussels', 'Europe/Zurich', 'Europe/Luxembourg', 'Europe/Monaco',
  'Africa/Dakar', 'Africa/Abidjan', 'Africa/Douala', 'Africa/Bamako', 'Africa/Ouagadougou', 'Africa/Niamey', 'Africa/Lome', 'Africa/Porto-Novo',
  'Africa/Conakry', 'Africa/Kinshasa', 'Africa/Lubumbashi', 'Africa/Brazzaville', 'Africa/Libreville', 'Indian/Antananarivo',
  'Africa/Tunis', 'Africa/Algiers', 'Africa/Casablanca', 'Africa/El_Aaiun',
  'Indian/Reunion', 'Indian/Mayotte', 'America/Guadeloupe', 'America/Martinique', 'America/Cayenne', 'America/Miquelon', 'Pacific/Noumea', 'Pacific/Tahiti',
];

/**
 * Choix de la langue (règle du fondateur du 21/11/2026 : « English must be the native language and French only for French-speaking
 * countries »), par ordre de priorité : préfixe d'URL (/fr, /en, /es, /ar) > choix mémorisé (explicite) > première langue du navigateur
 * parmi fr, en, es, ar si c'est fr, es ou ar > français si le pays détecté (fuseau horaire) est francophone > anglais.
 * Maroc, Tunisie, Algérie : français, sauf navigateur en arabe. L'espagnol et l'arabe ne viennent que de l'appareil ou du choix.
 */
export function resolveSiteLanguage(input: {
  urlLang: string | null | undefined;
  storedExplicit: string | null | undefined;
  browser: readonly string[] | undefined;
  /** Fuseau horaire du navigateur (`Intl.DateTimeFormat().resolvedOptions().timeZone`), pour le pays détecté. */
  timeZone?: string | null;
}): SiteLang {
  const supported = (raw: string | null | undefined): SiteLang | null => {
    const code = (raw || '').toLowerCase().slice(0, 2);
    return (SITE_LANGS as readonly string[]).includes(code) ? (code as SiteLang) : null;
  };
  const fromUrl = supported(input.urlLang);
  if (fromUrl) return fromUrl;
  const stored = supported(input.storedExplicit);
  if (stored) return stored;
  let browser: SiteLang | null = null;
  for (const candidate of input.browser ?? []) {
    browser = supported(candidate);
    if (browser) break;
  }
  if (browser && browser !== 'en') return browser;
  if (FRENCH_TIME_ZONES.includes(String(input.timeZone ?? '').trim())) return 'fr';
  return browser ?? DEFAULT_SITE_LANG;
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
