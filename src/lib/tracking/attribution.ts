/**
 * Origine d'une inscription : paramètres utm_ du lien de campagne, lus dans l'adresse de la page d'inscription (la page d'entrée
 * Téléphonie les y reporte). Rien n'est stocké dans le navigateur : la valeur est lue au chargement et jointe à l'inscription, et
 * seulement si la personne a accepté la mesure d'audience (cookies « analytics »). Même filtre que côté serveur.
 */
export const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
const SAFE = /^[A-Za-z0-9_\-.~+ ]{1,100}$/;

export function utmFromSearch(search: string): Record<string, string> {
  const params = new URLSearchParams(search);
  const out: Record<string, string> = {};
  for (const key of UTM_KEYS) {
    const value = (params.get(key) ?? '').trim();
    if (value && SAFE.test(value)) out[key] = value;
  }
  return out;
}

export function analyticsConsentGiven(): boolean {
  try {
    const raw = localStorage.getItem('harx_cookie_consent');
    const c = raw ? JSON.parse(raw) : null;
    return Boolean(c && c.v === 1 && c.analytics === true);
  } catch {
    return false;
  }
}

/** Paramètres à joindre à l'inscription : `undefined` sans consentement ou sans paramètre utm_. */
export function signUpAttribution(captured: Record<string, string>): Record<string, string> | undefined {
  if (!analyticsConsentGiven() || Object.keys(captured).length === 0) return undefined;
  return captured;
}
