import { NOMAD_PAGE } from '../config/offers';
import { getLangFromPath, stripLangPrefix, withLangPrefix } from './langRoutes';

/**
 * Inscription propre à l'offre choisie (constat du fondateur, 22/11/2026, parcours Nomad).
 *
 * 1. Adresse nommée selon l'offre : Nomad s'inscrit sur `/auth/register-nomad?product=nomad` (au lieu de
 *    `/auth/register-call-center?product=callcentre`). L'ancienne adresse reste valable : pour un visiteur du parcours Nomad
 *    elle est remplacée par la nouvelle (liens de prod, e-mails, application). Les offres CLOUD gardent
 *    `/auth/register-call-center?product=callcentre`.
 * 2. Bouton « Retour » : retour à la page d'origine de l'offre, jamais vers `/auth/choice` (page TAAS) depuis Nomad.
 */
export const NOMAD_REGISTER_PATH = '/auth/register-nomad';
export const CALL_CENTER_REGISTER_PATH = '/auth/register-call-center';
/** Valeur de `?product=` de l'inscription Nomad (compte du produit Téléphonie, comme `callcentre`). */
export const NOMAD_PRODUCT = 'nomad';

/** Note écrite par l'hôte (v25_process_connections, lib/redirectHop.ts) : page de l'offre quittée juste avant l'inscription. */
export const OFFER_RETURN_KEY = 'harx_offer_return';

function cleanPath(pathname: string): string {
  return stripLangPrefix(pathname).replace(/\/+$/, '') || '/';
}

/** `/auth/register-nomad`, avec ou sans préfixe de langue (ou basename déjà retiré). */
export function isNomadRegisterPath(pathname: string): boolean {
  return cleanPath(pathname) === NOMAD_REGISTER_PATH;
}

/** `?product=callcentre&step=email` → `?product=nomad&step=email` (les autres paramètres sont gardés). */
export function nomadRegisterSearch(search: string): string {
  const params = new URLSearchParams(search);
  params.set('product', NOMAD_PRODUCT);
  return `?${params.toString()}`;
}

/**
 * Ancienne adresse d'inscription (`/auth/register-call-center`, avec ou sans préfixe de langue) d'un visiteur du parcours Nomad
 * → adresse de l'offre (`/auth/register-nomad?product=nomad`, préfixe, étape, autres paramètres et ancre gardés) ; `null` sinon.
 * Appliqué avant le montage du routeur (arrivée par chargement complet depuis /telephony/start, liens d'e-mails, application).
 */
export function nomadRegisterRedirect(loc: { pathname: string; search?: string; hash?: string }, nomad: boolean): string | null {
  if (!nomad || cleanPath(loc.pathname) !== CALL_CENTER_REGISTER_PATH) return null;
  const lang = getLangFromPath(loc.pathname);
  const path = lang ? withLangPrefix(NOMAD_REGISTER_PATH, lang) : NOMAD_REGISTER_PATH;
  return `${path}${nomadRegisterSearch(loc.search || '')}${loc.hash || ''}`;
}

/** Page de l'offre Nomad pour un retour par chargement complet, avec la langue de l'adresse si elle y figure. */
export function nomadPageUrl(currentPathname: string): string {
  const lang = getLangFromPath(currentPathname);
  return lang ? withLangPrefix(NOMAD_PAGE, lang) : NOMAD_PAGE;
}

/** Note de l'hôte, si elle désigne bien la page Nomad (sinon `null`). */
export function readNomadReturn(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const url = (JSON.parse(raw) as { url?: unknown })?.url;
    if (typeof url !== 'string' || !url.startsWith('/') || url.startsWith('//')) return null;
    const pathname = new URL(url, 'https://harx.invalid').pathname;
    return cleanPath(pathname) === NOMAD_PAGE ? url : null;
  } catch {
    return null;
  }
}

export type RegisterBackAction =
  /** Étape précédente / page précédente dans le module (historique React Router). */
  | { type: 'history' }
  /** Page précédente du navigateur : la page de l'offre, notée par l'hôte juste avant l'inscription. */
  | { type: 'browser-back' }
  /** Page d'une autre application (Téléphonie) : chargement complet. */
  | { type: 'hard'; url: string }
  /** Écran du module (comportement TAAS / CLOUD inchangé). */
  | { type: 'route'; to: string };

/**
 * Destination du bouton « Retour » de l'inscription.
 * - Historique du module disponible : on y revient (inchangé).
 * - Parcours Nomad : page Nomad (retour navigateur quand l'hôte a noté qu'on en vient, ce qui garde la langue et le pays de
 *   l'adresse ; sinon chargement de /telephony/nomad). Jamais /auth/choice.
 * - Sinon : `returnTo` ou `/auth/choice` (inchangé pour TAAS et CLOUD).
 */
export function resolveRegisterBack(input: {
  canGoBack: boolean;
  nomad: boolean;
  returnTo?: string | null;
  nomadReturn?: string | null;
  pathname: string;
}): RegisterBackAction {
  if (input.canGoBack) return { type: 'history' };
  if (input.nomad) {
    if (input.nomadReturn) return { type: 'browser-back' };
    return { type: 'hard', url: nomadPageUrl(input.pathname) };
  }
  return { type: 'route', to: input.returnTo ?? '/auth/choice' };
}
