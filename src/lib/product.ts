/**
 * Standalone HARX products that share the account backend. A product is
 * remembered from the link the visitor came from (`?product=callcentre`) so
 * sign-in and sign-up can land on that product instead of the marketplace.
 */
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
    // `?product=nomad` (connexion depuis la page Nomad) : compte du produit Téléphonie, comme `callcentre`.
    if (product === CALLCENTRE_PRODUCT || product === 'nomad') localStorage.setItem(PRODUCT_KEY, CALLCENTRE_PRODUCT);
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

/** Visiteur d'un parcours Nomad Solo (offre choisie ou profil « solo » mémorisé par l'application Téléphonie) : pastille NOMAD du bandeau. */
export function isNomadVisitor(): boolean {
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
