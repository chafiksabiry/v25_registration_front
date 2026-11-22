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
  const plan = readPendingPlan();
  if (plan) return plan === 'nomad_solo';
  try {
    return localStorage.getItem('harx_cc_pending_profile') === 'solo';
  } catch {
    return false;
  }
}
