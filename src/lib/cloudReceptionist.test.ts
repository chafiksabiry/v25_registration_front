import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Adresses CLOUD Receptionist validées par le fondateur (24/11/2026, « ok ») : connexion /cloud/receptionist/connexion, étape 2 de
 * l'inscription /cloud/receptionist/inscription/compte (ce module) ; arrivée après la connexion /cloud/receptionist, après l'inscription
 * /cloud/receptionist/mise-en-route. NOMAD d'abord ; Entreprise et Contact Centre (connexion commune) inchangés.
 */

const checkUserType = vi.fn();
vi.mock('./api', () => ({ auth: { checkUserType: (id: string) => checkUserType(id), setProduct: vi.fn(() => Promise.resolve()) } }));
vi.mock('./agentInvitations', () => ({ INVITATIONS_SEEN_KEY: 'seen', fetchPendingInvitations: vi.fn(() => Promise.resolve([])) }));
vi.mock('./appNavigation', () => ({ hardNavigate: vi.fn() }));
vi.mock('./authSync', () => ({ readStoredAuthToken: vi.fn(() => null) }));
vi.mock('axios', () => ({ default: { get: vi.fn(() => Promise.reject({ response: { status: 404 } })) } }));
vi.mock('js-cookie', () => ({ default: { set: vi.fn(), remove: vi.fn(), get: vi.fn() } }));

import { getPostLoginRedirectUrl } from './authRedirect';
import { captureProductFromUrl, isCallcentreProduct, isNomadVisitor, telephonySignupDestination } from './product';
import {
  CLOUD_RECEPTIONIST_ACCOUNT_PATH,
  CLOUD_RECEPTIONIST_SIGN_IN_PATH,
  cloudReceptionistRedirect,
  isCloudReceptionistDoorPath,
  isCloudReceptionistVisitor,
} from './cloudReceptionist';
import { resolveRegisterBack } from './offerRegister';
import { OFFERS, activeMark, resolveMarkHref } from '../config/offers';
import { REGISTER_ROUTE_PATHS } from './registerNavigation';

function memoryStorage() {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => (m.has(k) ? m.get(k)! : null),
    setItem: (k: string, v: string) => void m.set(k, String(v)),
    removeItem: (k: string) => void m.delete(k),
    clear: () => m.clear(),
  };
}

beforeEach(() => {
  vi.stubGlobal('localStorage', memoryStorage());
  vi.stubGlobal('sessionStorage', memoryStorage());
  checkUserType.mockReset();
});
afterEach(() => vi.unstubAllGlobals());

const login = () => getPostLoginRedirectUrl('u1', 'tok');
const read = (p: string) => readFileSync(new URL(p, import.meta.url), 'utf8');

describe('adresses de la porte Receptionist', () => {
  it('connexion et étape 2 : offre et produit dans l’adresse (avec ou sans préfixe de langue)', () => {
    expect(CLOUD_RECEPTIONIST_SIGN_IN_PATH).toBe('/cloud/receptionist/connexion');
    expect(CLOUD_RECEPTIONIST_ACCOUNT_PATH).toBe('/cloud/receptionist/inscription/compte');
    for (const p of ['/cloud/receptionist/connexion', '/cloud/receptionist/inscription/compte', '/fr/cloud/receptionist/connexion/']) expect(isCloudReceptionistDoorPath(p), p).toBe(true);
    for (const p of ['/cloud/receptionist', '/cloud/receptionist/inscription', '/auth/signin', '/nomad/connexion']) expect(isCloudReceptionistDoorPath(p), p).toBe(false);
  });
  it('anciennes adresses avec l’offre Receptionist → adresses Receptionist ; connexion commune sans offre inchangée', () => {
    expect(cloudReceptionistRedirect({ pathname: '/auth/signin', search: '?product=callcentre&plan=accueil&audience=team' })).toBe('/cloud/receptionist/connexion?audience=team');
    expect(cloudReceptionistRedirect({ pathname: '/fr/auth/register-call-center', search: '?product=callcentre&plan=accueil&step=email' })).toBe('/cloud/receptionist/inscription/compte?step=email');
    expect(cloudReceptionistRedirect({ pathname: '/en/cloud/receptionist/connexion', search: '?x=1', hash: '#a' })).toBe('/cloud/receptionist/connexion?x=1#a');
    expect(cloudReceptionistRedirect({ pathname: '/auth/signin', search: '?product=callcentre' })).toBeNull();
    expect(cloudReceptionistRedirect({ pathname: '/auth/register-call-center', search: '?product=callcentre' })).toBeNull();
    expect(cloudReceptionistRedirect({ pathname: '/cloud/receptionist/connexion' })).toBeNull();
  });
});

describe('arrivée après connexion et inscription', () => {
  it('connexion par la porte Receptionist → /cloud/receptionist (le portail ouvre l’écran d’arrivée), produit Téléphonie retenu', async () => {
    captureProductFromUrl('', '/cloud/receptionist/connexion');
    expect(isCallcentreProduct()).toBe(true);
    expect(isCloudReceptionistVisitor('/autre')).toBe(true);
    checkUserType.mockResolvedValue({ userType: 'company', product: 'callcentre' });
    expect(await login()).toBe('/cloud/receptionist');
    // Secrétaire invitée (membre) entrée par la même porte.
    checkUserType.mockResolvedValue({ userType: 'company-member', product: 'callcentre', employerCompanyId: 'c1' });
    expect(await login()).toBe('/cloud/receptionist');
  });
  it('inscription par la porte Receptionist → /cloud/receptionist/mise-en-route', () => {
    captureProductFromUrl('', '/cloud/receptionist/inscription/compte');
    expect(telephonySignupDestination('/cloud/receptionist/inscription/compte')).toBe('/cloud/receptionist/mise-en-route');
  });
  it('connexion commune (?product=callcentre, Entreprise et Contact Centre) : /telephony inchangé ; elle efface la porte Receptionist', async () => {
    checkUserType.mockResolvedValue({ userType: 'company', product: 'callcentre' });
    captureProductFromUrl('?product=callcentre', '/auth/signin');
    expect(await login()).toBe('/telephony');
    captureProductFromUrl('', '/cloud/receptionist/connexion');
    captureProductFromUrl('?product=callcentre', '/auth/signin');
    expect(isCloudReceptionistVisitor('/auth/signin')).toBe(false);
    expect(await login()).toBe('/telephony');
    expect(telephonySignupDestination('/auth/register-call-center')).toBe('/telephony');
  });
  it('NOMAD d’abord : porte NOMAD → /nomad/poste ; la porte Receptionist n’est jamais lue comme NOMAD', async () => {
    checkUserType.mockResolvedValue({ userType: 'company', product: 'callcentre' });
    captureProductFromUrl('', '/nomad/connexion');
    expect(await login()).toBe('/nomad/poste');
    // Reste NOMAD en mémoire (offre et profil d'un ancien parcours) : l'adresse Receptionist l'emporte.
    localStorage.setItem('harx_cc_pending_plan', 'nomad_solo');
    localStorage.setItem('harx_cc_pending_profile', 'solo');
    expect(isNomadVisitor('/cloud/receptionist/connexion')).toBe(false);
    expect(isNomadVisitor('/cloud/receptionist/inscription/compte')).toBe(false);
    expect(isNomadVisitor('/nomad/inscription')).toBe(true);
  });
});

describe('bouton « Retour » de l’étape 2 et étapes de l’inscription', () => {
  it('étape 2 Receptionist : « Retour » mène à l’étape 1 /cloud/receptionist/inscription, jamais à /auth/choice', () => {
    expect(resolveRegisterBack({ canGoBack: false, nomad: false, receptionist: true, pathname: '/cloud/receptionist/inscription/compte' })).toEqual({ type: 'hard', url: '/cloud/receptionist/inscription' });
    expect(resolveRegisterBack({ canGoBack: true, nomad: false, receptionist: true, pathname: '/cloud/receptionist/inscription/compte' })).toEqual({ type: 'history' });
    // CLOUD hors Receptionist et TAAS : inchangés.
    expect(resolveRegisterBack({ canGoBack: false, nomad: false, pathname: '/auth/register-call-center' })).toEqual({ type: 'route', to: '/auth/choice' });
  });
  it('les étapes (?step=…) restent sur /cloud/receptionist/inscription/compte', () => {
    expect(REGISTER_ROUTE_PATHS).toContain('/cloud/receptionist/inscription/compte');
  });
});

describe('accueil harx.ai et bandeau : liens CLOUD vers les nouvelles adresses', () => {
  it('carte CLOUD → /cloud ; puce Receptionist → /cloud/receptionist/inscription ; Entreprise et Contact Centre inchangés', () => {
    const cloud = OFFERS.find((o) => o.id === 'cloud')!;
    expect(cloud.route).toBe('/cloud');
    const route = (id: string) => (cloud.children.find((c) => c.id === id) as { route?: string }).route;
    expect(route('accueil')).toBe('/cloud/receptionist/inscription');
    expect(route('full_scope')).toBe('/telephony/start?plan=full_scope');
    expect(route('multi_clients')).toBe('/telephony/start?plan=multi_clients');
    expect(cloud.signIn).toEqual({ route: '/auth/signin?product=callcentre', langPrefixed: false });
    expect(resolveMarkHref('cloud', 'fr')).toBe('/cloud');
  });
  it('pastille CLOUD sur les adresses /cloud ; NOMAD inchangé', () => {
    expect(activeMark({ pathname: '/cloud/receptionist/connexion' })).toBe('cloud');
    expect(activeMark({ pathname: '/fr/cloud/receptionist/inscription/compte' })).toBe('cloud');
    expect(activeMark({ pathname: '/nomad/connexion' })).toBe('nomad');
  });
});

describe('écrans de la porte Receptionist : logo CLOUD, onglet « HARX CLOUD », routes', () => {
  it('connexion Receptionist : logo CLOUD (OfferWordmark, 40 px) au-dessus du titre, comme NOMAD', () => {
    const src = read('../components/SignInDialog.tsx');
    expect(src).toMatch(/const receptionistDoor = !nomad && isCloudReceptionistSignInPath\(/);
    expect(src).toMatch(/\{receptionistDoor \? <div className="mb-6 flex justify-center text-white \[&_svg\]:h-10[^"]*" data-testid="signin-offer-word"><OfferWordmark offer="cloud" label=\{cloudWord\} \/><\/div> : null\}/);
  });
  it('étape 2 : le logo de l’offre (CLOUD) est déjà au-dessus des étapes (RegistrationDialog, pastille CLOUD)', () => {
    const src = read('../components/RegistrationDialog.tsx');
    expect(src).toMatch(/data-testid="register-offer-word"><OfferWordmark offer=\{offerId\}/);
  });
  it('routes et onglet « HARX CLOUD »', () => {
    const router = read('../router.tsx');
    expect(router).toContain("{ path: 'cloud/receptionist/connexion', element: <CloudReceptionistSignInScreen /> }");
    expect(router).toContain("{ path: 'cloud/receptionist/inscription/compte', element: <RegisterCloudReceptionistScreen /> }");
    const routes = read('../routes/AuthRoutes.tsx');
    expect(routes).toContain("export const CLOUD_TAB_TITLE = 'HARX CLOUD';");
    expect(routes.match(/usePageTitle\(CLOUD_TAB_TITLE\)/g)).toHaveLength(2);
  });
});
