import { CLOUD_RECEPTIONIST_SIGNUP_PATH, NOMAD_PAGE, NOMAD_REGISTER_PATH, NOMAD_SIGN_IN_PATH } from '../config/offers';
import { stripLangPrefix } from './langRoutes';

export { NOMAD_REGISTER_PATH, NOMAD_SIGN_IN_PATH };

/**
 * Inscription propre à l'offre choisie (constat du fondateur, 22/11/2026, parcours Nomad).
 *
 * 1. Adresse nommée selon l'offre : Nomad s'inscrit sur `/nomad/inscription` (adresses NOMAD du 24/11/2026 ; avant :
 *    `/auth/register-nomad?product=nomad`, avant encore `/auth/register-call-center?product=callcentre`). Les anciennes adresses
 *    restent valables et sont remplacées par la nouvelle (liens de prod, e-mails, application) : `/auth/register-nomad` toujours,
 *    `/auth/register-call-center` pour un visiteur du parcours Nomad. La connexion NOMAD est `/nomad/connexion` (avant :
 *    `/auth/signin?product=nomad`). Les offres CLOUD gardent `/auth/register-call-center?product=callcentre` et
 *    `/auth/signin?product=callcentre`.
 * 2. Bouton « Retour » : retour à la page d'origine de l'offre, jamais vers `/auth/choice` (page TAAS) depuis Nomad.
 */
/** Ancienne adresse d'inscription NOMAD (22/11/2026), remplacée par `/nomad/inscription`. */
export const LEGACY_NOMAD_REGISTER_PATH = '/auth/register-nomad';
export const CALL_CENTER_REGISTER_PATH = '/auth/register-call-center';
/** Valeur de `?product=` des anciennes adresses NOMAD (compte du produit Téléphonie, comme `callcentre`). */
export const NOMAD_PRODUCT = 'nomad';

/** Note écrite par l'hôte (v25_process_connections, lib/redirectHop.ts) : page de l'offre quittée juste avant l'inscription. */
export const OFFER_RETURN_KEY = 'harx_offer_return';

function cleanPath(pathname: string): string {
  return stripLangPrefix(pathname).replace(/\/+$/, '') || '/';
}

/** Inscription NOMAD : `/nomad/inscription` ou l'ancienne `/auth/register-nomad`, avec ou sans préfixe de langue (ou basename déjà retiré). */
export function isNomadRegisterPath(pathname: string): boolean {
  const p = cleanPath(pathname);
  return p === NOMAD_REGISTER_PATH || p === LEGACY_NOMAD_REGISTER_PATH;
}

/** Connexion NOMAD : `/nomad/connexion`, avec ou sans préfixe de langue. */
export function isNomadSignInPath(pathname: string): boolean {
  return cleanPath(pathname) === NOMAD_SIGN_IN_PATH;
}

/** Porte NOMAD par l'adresse : `/nomad/connexion` ou `/nomad/inscription` (ou l'ancienne `/auth/register-nomad`). */
export function isNomadDoorPath(pathname: string): boolean {
  return isNomadSignInPath(pathname) || isNomadRegisterPath(pathname);
}

/** Requête d'une adresse NOMAD : `?product=callcentre&step=email` → `?step=email` (le produit est porté par l'adresse, les autres paramètres sont gardés). */
export function nomadRegisterSearch(search: string): string {
  const params = new URLSearchParams(search);
  params.delete('product');
  const s = params.toString();
  return s ? `?${s}` : '';
}

/**
 * Ancienne adresse du parcours NOMAD (avec ou sans préfixe de langue) → adresse NOMAD (sans préfixe : la langue est mémorisée par
 * l'appelant, voir main.tsx ; étape, autres paramètres et ancre gardés) ; `null` sinon :
 * - `/auth/register-nomad` → `/nomad/inscription` ;
 * - `/auth/register-call-center` d'un visiteur du parcours Nomad → `/nomad/inscription` ;
 * - `/auth/signin?product=nomad` → `/nomad/connexion` ;
 * - `/:lang/nomad/connexion`, `/:lang/nomad/inscription` → sans préfixe.
 * Appliqué avant le montage du routeur (arrivée par chargement complet, liens d'e-mails, application).
 */
export function nomadRegisterRedirect(loc: { pathname: string; search?: string; hash?: string }, nomad: boolean): string | null {
  const p = cleanPath(loc.pathname);
  const hash = loc.hash || '';
  if (p === LEGACY_NOMAD_REGISTER_PATH || (nomad && p === CALL_CENTER_REGISTER_PATH)) {
    return `${NOMAD_REGISTER_PATH}${nomadRegisterSearch(loc.search || '')}${hash}`;
  }
  if (p === '/auth/signin' && new URLSearchParams(loc.search || '').get('product') === NOMAD_PRODUCT) {
    return `${NOMAD_SIGN_IN_PATH}${nomadRegisterSearch(loc.search || '')}${hash}`;
  }
  if ((p === NOMAD_REGISTER_PATH || p === NOMAD_SIGN_IN_PATH) && p !== loc.pathname) {
    return `${p}${loc.search || ''}${hash}`;
  }
  return null;
}

/** Page de l'offre Nomad pour un retour par chargement complet (`/nomad`, sans préfixe : la langue est mémorisée). */
export function nomadPageUrl(): string {
  return NOMAD_PAGE;
}

/** Note de l'hôte, si elle désigne bien la page Nomad (sinon `null`). */
export function readNomadReturn(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const url = (JSON.parse(raw) as { url?: unknown })?.url;
    if (typeof url !== 'string' || !url.startsWith('/') || url.startsWith('//')) return null;
    const pathname = new URL(url, 'https://harx.invalid').pathname;
    // Page NOMAD : `/nomad` (ou l'ancienne `/telephony/nomad`, notée avant le changement d'adresse).
    const p = cleanPath(pathname);
    return p === NOMAD_PAGE || p === '/telephony/nomad' ? url : null;
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
 *   l'adresse ; sinon chargement de /nomad). Jamais /auth/choice.
 * - Sinon : `returnTo` ou `/auth/choice` (inchangé pour TAAS et CLOUD).
 */
export function resolveRegisterBack(input: {
  canGoBack: boolean;
  nomad: boolean;
  /** Étape 2 de l'inscription CLOUD Receptionist : « Retour » mène à l'étape 1 (application Téléphonie), jamais à /auth/choice (TAAS). */
  receptionist?: boolean;
  returnTo?: string | null;
  nomadReturn?: string | null;
  pathname: string;
}): RegisterBackAction {
  if (input.canGoBack) return { type: 'history' };
  if (input.receptionist && !input.nomad) return { type: 'hard', url: CLOUD_RECEPTIONIST_SIGNUP_PATH };
  if (input.nomad) {
    if (input.nomadReturn) return { type: 'browser-back' };
    return { type: 'hard', url: nomadPageUrl() };
  }
  return { type: 'route', to: input.returnTo ?? '/auth/choice' };
}
