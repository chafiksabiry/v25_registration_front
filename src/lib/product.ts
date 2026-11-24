/**
 * Standalone HARX products that share the account backend. A product is
 * remembered from the link the visitor came from (`?product=callcentre`) so
 * sign-in and sign-up can land on that product instead of the marketplace.
 */
import { NOMAD_PRODUCT, isNomadDoorPath, isNomadRegisterPath } from './offerRegister';
import {
  CLOUD_RECEPTIONIST_POST_LOGIN_PATH,
  CLOUD_RECEPTIONIST_POST_SIGNUP_PATH,
  isCloudReceptionistDoorPath,
  isCloudReceptionistVisitor,
  rememberCloudReceptionistDoor,
} from './cloudReceptionist';

const PRODUCT_KEY = 'harx_product';

export const CALLCENTRE_PRODUCT = 'callcentre';
export const CALLCENTRE_PATH = '/telephony';
/** Adresses NOMAD (24/11/2026) : arrivée d'un visiteur NOMAD après la connexion (poste) et après l'inscription (mise en route). */
export const NOMAD_POST_LOGIN_PATH = '/nomad/poste';
export const NOMAD_POST_SIGNUP_PATH = '/nomad/mise-en-route';

/** Arrivée après l'inscription d'un compte Téléphonie : mise en route NOMAD pour un visiteur NOMAD, sinon `/telephony` (CLOUD, inchangé). */
export function telephonySignupDestination(pathname: string = currentPathname()): string {
  if (isNomadVisitor(pathname)) return NOMAD_POST_SIGNUP_PATH;
  // Porte CLOUD Receptionist (24/11/2026) : la mise en route à son adresse /cloud/receptionist/mise-en-route.
  return isCloudReceptionistVisitor(pathname) ? CLOUD_RECEPTIONIST_POST_SIGNUP_PATH : CALLCENTRE_PATH;
}

/**
 * Arrivée d'un compte Téléphonie (CLOUD) : `/cloud/receptionist` pour la porte Receptionist (le portail ouvre l'écran d'arrivée du
 * compte, et renvoie un compte d'une autre offre vers ses adresses `/telephony`), sinon `/telephony` (inchangé).
 */
export function callcentreHome(pathname: string = currentPathname()): string {
  return isCloudReceptionistVisitor(pathname) ? CLOUD_RECEPTIONIST_POST_LOGIN_PATH : CALLCENTRE_PATH;
}

/**
 * Espace d'arrivée d'un compte entreprise après connexion (arbitrage 12 du 18/11/2026) :
 * un compte Call Center (ou venu du produit Téléphonie) va vers `/telephony`, l'ancienne
 * application `/call-center` étant retirée. Les autres comptes entreprise vont vers `/company`.
 */
export function companyWorkspacePath(userType: string | null | undefined, callcentreProduct: boolean): string {
  if (callcentreProduct || userType === 'call-center') return callcentreHome();
  return '/company';
}

/**
 * Remember the product named in the address bar, if any. Adresses NOMAD (24/11/2026) : `/nomad/connexion` et `/nomad/inscription`
 * valent `?product=nomad` (porte NOMAD) ; l'arrivée sur `/nomad/inscription` mémorise en plus l'offre Nomad Solo, comme le relais
 * `/telephony/start?profil=solo` de l'application Téléphonie (voir `rememberNomadSoloOffer`).
 */
export function captureProductFromUrl(search: string = window.location.search, pathname: string = currentPathname()): void {
  try {
    const nomadDoor = isNomadDoorPath(pathname);
    // Porte CLOUD Receptionist (/cloud/receptionist/connexion, /cloud/receptionist/inscription/compte) : produit Téléphonie.
    const receptionistDoor = isCloudReceptionistDoorPath(pathname);
    const product = nomadDoor ? NOMAD_PRODUCT : receptionistDoor ? CALLCENTRE_PRODUCT : new URLSearchParams(search).get('product');
    // Porte Receptionist retenue pour cet onglet ; toute autre porte d'un produit l'efface.
    if (receptionistDoor) rememberCloudReceptionistDoor(true);
    else if (product === CALLCENTRE_PRODUCT || product === NOMAD_PRODUCT) rememberCloudReceptionistDoor(false);
    // `?product=nomad` (porte NOMAD : /nomad/connexion, /nomad/inscription) : compte du produit Téléphonie, comme `callcentre`.
    if (product === CALLCENTRE_PRODUCT || product === NOMAD_PRODUCT) localStorage.setItem(PRODUCT_KEY, CALLCENTRE_PRODUCT);
    // Porte NOMAD : retenue pour cet onglet jusqu'à la connexion, puis transmise au portail (voir `handNomadProfileToPortal`).
    // La porte Téléphonie l'efface. Le produit, lui, reste « callcentre » dans les deux cas.
    if (product === NOMAD_PRODUCT) sessionStorage.setItem(NOMAD_DOOR_KEY, '1');
    else if (product === CALLCENTRE_PRODUCT) sessionStorage.removeItem(NOMAD_DOOR_KEY);
    if (nomadDoor && isNomadRegisterPath(pathname)) rememberNomadSoloOffer(search);
  } catch {
    /* ignore storage errors */
  }
}

/** Clés du portail Téléphonie (même origine, v25_callcenter_front src/lib/session.ts), écrites par le relais Solo. */
const PORTAL_PLAN_KEY = 'harx_cc_pending_plan';
const PORTAL_NAME_KEY = 'harx_cc_pending_name';
const PORTAL_PRICE_KEY = 'harx_cc_pending_price';

/**
 * Inscription NOMAD (`/nomad/inscription`) : même mémoire que le relais `/telephony/start?profil=solo&plan=nomad_solo` qu'elle
 * remplace (StartCenter.tsx de v25_callcenter_front) : offre `nomad_solo`, profil « solo », ancien nom de centre effacé, prix
 * Stripe de `?price=` (sinon effacé). Le portail les lit après l'inscription.
 */
export function rememberNomadSoloOffer(search: string = ''): void {
  try {
    // Appelé à chaque affichage de l'écran : l'arrivée (offre pas encore Nomad Solo) efface les restes d'un autre parcours ;
    // les étapes suivantes (?step=…, sans ?price=) ne les effacent plus.
    const arrival = localStorage.getItem(PORTAL_PLAN_KEY) !== 'nomad_solo';
    localStorage.setItem(PORTAL_PLAN_KEY, 'nomad_solo');
    localStorage.setItem(PORTAL_PROFILE_KEY, 'solo');
    if (arrival) localStorage.removeItem(PORTAL_NAME_KEY);
    const price = new URLSearchParams(search).get('price');
    if (price) localStorage.setItem(PORTAL_PRICE_KEY, price);
    else if (arrival) localStorage.removeItem(PORTAL_PRICE_KEY);
  } catch {
    /* ignore storage errors */
  }
}

/** Marqueur de session : la personne est entrée par la porte NOMAD (`/nomad/connexion`, `/nomad/inscription`, `?product=nomad`). */
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

/**
 * Meilleur signal NOMAD disponible côté navigateur pour un compte Téléphonie connecté (bouton « Tableau de bord » de l'accueil,
 * arrivée après connexion) : adresse ou parcours NOMAD (`isNomadVisitor` : adresse NOMAD, offre `nomad_solo` ou profil « solo »
 * mémorisés, ce dernier étant aussi écrit à la connexion par la porte NOMAD), ou porte NOMAD prise dans cet onglet.
 * Le portail renvoie de toute façon un compte NOMAD arrivé sur /telephony vers ses écrans /nomad.
 */
export function isNomadAccountHint(pathname: string = currentPathname()): boolean {
  if (isNomadVisitor(pathname)) return true;
  try {
    return sessionStorage.getItem(NOMAD_DOOR_KEY) === '1';
  } catch {
    return false;
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
 * Visiteur d'un parcours Nomad Solo : adresse NOMAD (/nomad/connexion, /nomad/inscription, ancienne /auth/register-nomad,
 * prioritaire), sinon offre choisie ou profil « solo » mémorisé par l'application Téléphonie. Pastille NOMAD du bandeau, panneau
 * de gauche, adresse, bouton Retour et destination après connexion ou inscription.
 */
export function isNomadVisitor(pathname: string = currentPathname()): boolean {
  if (isNomadDoorPath(pathname)) return true;
  // Porte CLOUD Receptionist (adresse prioritaire, 24/11/2026) : jamais le parcours Nomad, quoi qu'il reste en mémoire.
  if (isCloudReceptionistDoorPath(pathname)) return false;
  // Ancien lien « Se connecter » de la page Nomad : /auth/signin?product=nomad (porte NOMAD).
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
