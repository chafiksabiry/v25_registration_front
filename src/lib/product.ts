/**
 * Standalone HARX products that share the account backend. A product is
 * remembered from the link the visitor came from (`?product=callcentre`) so
 * sign-in and sign-up can land on that product instead of the marketplace.
 */
const PRODUCT_KEY = 'harx_product';

export const CALLCENTRE_PRODUCT = 'callcentre';
export const CALLCENTRE_PATH = '/telephony';

/** Remember the product named in the address bar, if any. */
export function captureProductFromUrl(search: string = window.location.search): void {
  try {
    const product = new URLSearchParams(search).get('product');
    if (product === CALLCENTRE_PRODUCT) localStorage.setItem(PRODUCT_KEY, product);
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
