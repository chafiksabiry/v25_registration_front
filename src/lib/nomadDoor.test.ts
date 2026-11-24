import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Défaut validé par le fondateur (23/11/2026) : la porte NOMAD (`/auth/signin?product=nomad`) enregistrait seulement le produit
 * Téléphonie ; le portail, dans un navigateur neuf ou après déconnexion, ouvrait alors le parcours Entreprise d'un compte Nomad.
 * La porte transmet maintenant « nomad » au portail (profil « solo », clé partagée de même origine), sans changer le produit.
 */

const checkUserType = vi.fn();
vi.mock('./api', () => ({ auth: { checkUserType: (id: string) => checkUserType(id), setProduct: vi.fn(() => Promise.resolve()) } }));
vi.mock('./agentInvitations', () => ({ INVITATIONS_SEEN_KEY: 'seen', fetchPendingInvitations: vi.fn(() => Promise.resolve([])) }));
vi.mock('./appNavigation', () => ({ hardNavigate: vi.fn() }));
vi.mock('./authSync', () => ({ readStoredAuthToken: vi.fn(() => null) }));
vi.mock('axios', () => ({ default: { get: vi.fn(() => Promise.reject({ response: { status: 404 } })) } }));
vi.mock('js-cookie', () => ({ default: { set: vi.fn(), remove: vi.fn(), get: vi.fn() } }));

import { getPostLoginRedirectUrl } from './authRedirect';
import { captureProductFromUrl, isCallcentreProduct, telephonySignupDestination } from './product';

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

describe('porte NOMAD → portail', () => {
  it('navigateur neuf : connexion par la porte NOMAD → /nomad/poste (adresses NOMAD), profil « solo » transmis, produit toujours « callcentre »', async () => {
    captureProductFromUrl('?product=nomad');
    checkUserType.mockResolvedValue({ userType: 'company', product: 'callcentre' });
    expect(await login()).toBe('/nomad/poste');
    expect(localStorage.getItem('harx_cc_pending_profile')).toBe('solo');
    expect(localStorage.getItem('harx_product')).toBe('callcentre');
    expect(isCallcentreProduct()).toBe(true);
  });

  it('rien n’est écrit pour le portail avant la connexion (écrans d’inscription inchangés)', () => {
    captureProductFromUrl('?product=nomad');
    expect(localStorage.getItem('harx_cc_pending_profile')).toBeNull();
  });

  it('porte Téléphonie (?product=callcentre) : aucun profil « solo » ; elle efface une porte NOMAD prise plus tôt dans l’onglet', async () => {
    checkUserType.mockResolvedValue({ userType: 'company', product: 'callcentre' });
    captureProductFromUrl('?product=callcentre');
    expect(await login()).toBe('/telephony');
    expect(localStorage.getItem('harx_cc_pending_profile')).toBeNull();
    captureProductFromUrl('?product=nomad');
    captureProductFromUrl('?product=callcentre');
    await login();
    expect(localStorage.getItem('harx_cc_pending_profile')).toBeNull();
  });

  it('compte hors Téléphonie (TAAS) entré par la porte NOMAD : rien n’est transmis', async () => {
    captureProductFromUrl('?product=nomad');
    localStorage.removeItem('harx_product');
    checkUserType.mockResolvedValue({ userType: 'company', product: 'taas' });
    await login();
    expect(localStorage.getItem('harx_cc_pending_profile')).toBeNull();
  });
});

describe('adresses NOMAD (24/11/2026) : arrivée après connexion et inscription', () => {
  const at = (pathname: string, search = '') => vi.stubGlobal('window', { location: { pathname, search } });

  it('connexion par /nomad/connexion → poste NOMAD /nomad/poste, profil « solo » transmis', async () => {
    at('/nomad/connexion');
    captureProductFromUrl('', '/nomad/connexion');
    checkUserType.mockResolvedValue({ userType: 'company', product: 'callcentre' });
    expect(await login()).toBe('/nomad/poste');
    expect(localStorage.getItem('harx_cc_pending_profile')).toBe('solo');
    expect(localStorage.getItem('harx_product')).toBe('callcentre');
  });

  it('ancienne porte /auth/signin?product=nomad → /nomad/poste', async () => {
    at('/auth/signin', '?product=nomad');
    captureProductFromUrl('?product=nomad', '/auth/signin');
    checkUserType.mockResolvedValue({ userType: 'call-center', product: 'callcentre' });
    expect(await login()).toBe('/nomad/poste');
  });

  it('CLOUD inchangé : connexion Téléphonie (?product=callcentre) → /telephony', async () => {
    at('/auth/signin', '?product=callcentre');
    captureProductFromUrl('?product=callcentre', '/auth/signin');
    checkUserType.mockResolvedValue({ userType: 'company', product: 'callcentre' });
    expect(await login()).toBe('/telephony');
    expect(localStorage.getItem('harx_cc_pending_profile')).toBeNull();
  });

  it('compte hors Téléphonie (TAAS) à /nomad/connexion : jamais /nomad/poste', async () => {
    at('/nomad/connexion');
    checkUserType.mockResolvedValue({ userType: 'company', product: 'taas' });
    expect(await login()).toBe('/company');
  });

  it('après l’inscription : /nomad/mise-en-route pour NOMAD, /telephony pour CLOUD', () => {
    expect(telephonySignupDestination('/nomad/inscription')).toBe('/nomad/mise-en-route');
    expect(telephonySignupDestination('/auth/register-nomad')).toBe('/nomad/mise-en-route');
    expect(telephonySignupDestination('/auth/register-call-center')).toBe('/telephony');
    localStorage.setItem('harx_cc_pending_plan', 'accueil');
    expect(telephonySignupDestination('/fr/auth/register-call-center')).toBe('/telephony');
  });

  it('« Tableau de bord » depuis l’accueil (/fr) : compte NOMAD → /nomad/poste, selon le meilleur signal du navigateur', async () => {
    checkUserType.mockResolvedValue({ userType: 'company', product: 'callcentre' });
    at('/fr');
    // Profil « solo » laissé par une connexion NOMAD précédente (ou par le parcours Nomad Solo).
    localStorage.setItem('harx_cc_pending_profile', 'solo');
    expect(await login()).toBe('/nomad/poste');
    localStorage.clear();
    // Porte NOMAD prise dans cet onglet.
    sessionStorage.setItem('harx_nomad_door', '1');
    expect(await login()).toBe('/nomad/poste');
    sessionStorage.clear();
    localStorage.clear(); // la connexion par la porte NOMAD a transmis le profil « solo » : retiré pour le cas suivant
    // Aucun signal : /telephony (le portail renverra un compte NOMAD vers /nomad).
    expect(await login()).toBe('/telephony');
    // Compte CLOUD avec une offre CLOUD mémorisée : /telephony.
    localStorage.setItem('harx_cc_pending_plan', 'accueil');
    expect(await login()).toBe('/telephony');
  });
});
