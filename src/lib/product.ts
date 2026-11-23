/**
 * Standalone HARX products that share the account backend. A product is
 * remembered from the link the visitor came from (`?product=callcentre`) so
 * sign-in and sign-up can land on that product instead of the marketplace.
 */
import { NOMAD_PRODUCT, isNomadRegisterPath } from './offerRegister';

const PRODUCT_KEY = 'harx_product';

export const CALLCENTRE_PRODUCT = 'callcentre';
export const CALLCENTRE_PATH = '/telephony';

/**
 * Espace d'arrivée d'un compte entreprise après connexion (arbitrage 12 du 18/11/2026) :
 * un compte Call Center (ou venu du produit Téléphonie) va vers `/telephony`, l'ancienne
 * application `/call-center` étant retirée. Les autres comptes entreprise vont vers `/company`.
 */
export function companyWorkspacePath(userType: string | null | undefined, callcentreProduct: boolean): string {
  if (callcentreProduct || userType === 'call-center') return CALLCENTRE_PATH;
  return '/company';
}

/** Remember the product named in the address bar, if any. */
export function captureProductFromUrl(search: string = window.location.search): void {
  try {
    const product = new URLSearchParams(search).get('product');
    // `?product=nomad` (inscription Nomad, /auth/register-nomad) : compte du produit Téléphonie, comme `callcentre`.
    if (product === CALLCENTRE_PRODUCT || product === NOMAD_PRODUCT) localStorage.setItem(PRODUCT_KEY, CALLCENTRE_PRODUCT);
    // Porte NOMAD : retenue pour cet onglet jusqu'à la connexion, puis transmise au portail (voir `handNomadProfileToPortal`).
    // La porte Téléphonie l'efface. Le produit, lui, reste « callcentre » dans les deux cas.
    if (product === NOMAD_PRODUCT) sessionStorage.setItem(NOMAD_DOOR_KEY, '1');
    else if (product === CALLCENTRE_PRODUCT) sessionStorage.removeItem(NOMAD_DOOR_KEY);
  } catch {
    /* ignore storage errors */
  }
}

/** Marqueur de session : la personne est entrée par la porte NOMAD (`?product=nomad`). */
const NOMAD_DOOR_KEY = 'harx_nomad_door';
/** Clé du portail Téléphonie (même origine, v25_callcenter_front src/lib/session.ts) : profil « solo » = parcours Nomad. */
const PORTAL_PROFILE_KEY = 'harx_cc_pending_profile';

/**
 * Après la connexion d'un compte Téléphonie entré par la porte NOMAD : le portail reçoit le profil « solo » (parcours Nomad), même
 * dans un navigateur neuf ou après une déconnexion, en appoint du profil conservé côté serveur. Sans porte NOMAD, rien n'est écrit.
 */
export function handNomadProfileToPortal(): void {
  try {
    if (sessionStorage.getItem(NOMAD_DOOR_KEY) === '1') localStorage.setItem(PORTAL_PROFILE_KEY, 'solo');
  } catch {
    /* ignore storage errors */
  }
}

export function isCallcentreProduct(): boolean {
  try {
    return localStorage.getItem(PRODUCT_KEY) === CALLCENTRE_PRODUCT;
  } catch {
    return false;
  }
}

export function clearProduct(): void {
  try {
    localStorage.removeItem(PRODUCT_KEY);
  } catch {
    /* ignore storage errors */
  }
}

/** Offre choisie sur la page d'accueil Téléphonie (mémorisée par l'application, même origine), si elle est connue. */
export type TelephonyPlan = 'nomad_solo' | 'accueil' | 'full_scope' | 'multi_clients';
const PLANS: TelephonyPlan[] = ['nomad_solo', 'accueil', 'full_scope', 'multi_clients'];

export function readPendingPlan(): TelephonyPlan | null {
  try {
    const v = localStorage.getItem('harx_cc_pending_plan');
    return PLANS.find((p) => p === v) ?? null;
  } catch {
    return null;
  }
}

function currentPathname(): string {
  try {
    return typeof window === 'undefined' ? '' : window.location.pathname;
  } catch {
    return '';
  }
}

/**
 * Visiteur d'un parcours Nomad Solo : adresse d'inscription Nomad (/auth/register-nomad, prioritaire), sinon offre choisie ou
 * profil « solo » mémorisé par l'application Téléphonie. Pastille NOMAD du bandeau, panneau de gauche, adresse et bouton Retour.
 */
export function isNomadVisitor(pathname: string = currentPathname()): boolean {
  if (isNomadRegisterPath(pathname)) return true;
  // Lien « Se connecter » de la page Nomad : /auth/signin?product=nomad (porte NOMAD).
  try {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('product') === 'nomad') return true;
  } catch {
    /* ignore */
  }
  const plan = readPendingPlan();
  if (plan) return plan === 'nomad_solo';
  try {
    return localStorage.getItem('harx_cc_pending_profile') === 'solo';
  } catch {
    return false;
  }
}
