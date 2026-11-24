import {
  CLOUD_PAGE,
  CLOUD_RECEPTIONIST_ACCOUNT_PATH,
  CLOUD_RECEPTIONIST_PAGE,
  CLOUD_RECEPTIONIST_SIGN_IN_PATH,
  CLOUD_RECEPTIONIST_SIGNUP_PATH,
} from '../config/offers';
import { stripLangPrefix } from './langRoutes';

export { CLOUD_PAGE, CLOUD_RECEPTIONIST_ACCOUNT_PATH, CLOUD_RECEPTIONIST_PAGE, CLOUD_RECEPTIONIST_SIGN_IN_PATH, CLOUD_RECEPTIONIST_SIGNUP_PATH };

/**
 * Porte CLOUD Receptionist (adresses validées par le fondateur le 24/11/2026) : connexion `/cloud/receptionist/connexion` et étape 2
 * de l'inscription `/cloud/receptionist/inscription/compte`, servies par ce module. Calqué sur la porte NOMAD (offerRegister.ts).
 * Entreprise et Contact Centre gardent la connexion commune `/auth/signin?product=callcentre` et `/auth/register-call-center`.
 */

/** Arrivée d'un compte Receptionist après la connexion : le portail ouvre son écran d'arrivée (tableau de bord, mise en route…). */
export const CLOUD_RECEPTIONIST_POST_LOGIN_PATH = CLOUD_RECEPTIONIST_PAGE;
/** Arrivée après l'inscription d'un compte Receptionist : la mise en route. */
export const CLOUD_RECEPTIONIST_POST_SIGNUP_PATH = '/cloud/receptionist/mise-en-route';

/** Marqueur de session : la personne est entrée par la porte Receptionist (connexion ou inscription Receptionist). */
const DOOR_KEY = 'harx_cloud_receptionist_door';

function cleanPath(pathname: string): string {
  return stripLangPrefix(pathname).replace(/\/+$/, '') || '/';
}

export function isCloudReceptionistSignInPath(pathname: string): boolean {
  return cleanPath(pathname) === CLOUD_RECEPTIONIST_SIGN_IN_PATH;
}

export function isCloudReceptionistAccountPath(pathname: string): boolean {
  return cleanPath(pathname) === CLOUD_RECEPTIONIST_ACCOUNT_PATH;
}

/** Porte Receptionist par l'adresse (avec ou sans préfixe de langue). */
export function isCloudReceptionistDoorPath(pathname: string): boolean {
  return isCloudReceptionistSignInPath(pathname) || isCloudReceptionistAccountPath(pathname);
}

/** Retient la porte Receptionist pour cet onglet (jusqu'à la connexion ou l'inscription) ; une autre porte l'efface. */
export function rememberCloudReceptionistDoor(on: boolean): void {
  try {
    if (on) sessionStorage.setItem(DOOR_KEY, '1');
    else sessionStorage.removeItem(DOOR_KEY);
  } catch {
    /* stockage indisponible : l'adresse seule décide */
  }
}

function currentPathname(): string {
  try {
    return typeof window === 'undefined' ? '' : window.location.pathname;
  } catch {
    return '';
  }
}

/** Visiteur de la porte Receptionist : adresse de la porte, sinon porte prise dans cet onglet. */
export function isCloudReceptionistVisitor(pathname: string = currentPathname()): boolean {
  if (isCloudReceptionistDoorPath(pathname)) return true;
  try {
    return sessionStorage.getItem(DOOR_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Ancienne adresse ou adresse préfixée du parcours Receptionist → adresse CLOUD (sans préfixe de langue : la langue est mémorisée
 * par l'appelant ; autres paramètres et ancre gardés) ; `null` sinon. Normalement l'hôte le fait avant de monter ce module.
 * - `/auth/signin?product=callcentre&plan=accueil` → `/cloud/receptionist/connexion` ;
 * - `/auth/register-call-center?plan=accueil` → `/cloud/receptionist/inscription/compte` ;
 * - `/:lang/cloud/receptionist/connexion`, `/:lang/cloud/receptionist/inscription/compte` → sans préfixe.
 * `/auth/signin?product=callcentre` sans offre reste la connexion commune des offres CLOUD (Entreprise, Contact Centre).
 */
export function cloudReceptionistRedirect(loc: { pathname: string; search?: string; hash?: string }): string | null {
  const p = cleanPath(loc.pathname);
  const hash = loc.hash || '';
  const params = new URLSearchParams(loc.search || '');
  const without = (...names: string[]) => {
    for (const n of names) params.delete(n);
    const s = params.toString();
    return s ? `?${s}` : '';
  };
  const receptionist = (params.get('plan') || '').toLowerCase() === 'accueil';
  if (p === '/auth/signin' && receptionist && params.get('product') === 'callcentre') return `${CLOUD_RECEPTIONIST_SIGN_IN_PATH}${without('product', 'plan')}${hash}`;
  if (p === '/auth/register-call-center' && receptionist) return `${CLOUD_RECEPTIONIST_ACCOUNT_PATH}${without('product', 'plan')}${hash}`;
  if (isCloudReceptionistDoorPath(p) && p !== loc.pathname) return `${p}${loc.search || ''}${hash}`;
  return null;
}
