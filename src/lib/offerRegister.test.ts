import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  NOMAD_REGISTER_PATH,
  NOMAD_SIGN_IN_PATH,
  OFFER_RETURN_KEY,
  isNomadDoorPath,
  isNomadRegisterPath,
  isNomadSignInPath,
  nomadPageUrl,
  nomadRegisterRedirect,
  nomadRegisterSearch,
  readNomadReturn,
  resolveRegisterBack,
} from './offerRegister';
import { captureProductFromUrl, isCallcentreProduct, isNomadVisitor, rememberNomadSoloOffer } from './product';
import { REGISTER_ROUTE_PATHS, resolveRegisterPath } from './registerNavigation';
import { languageSwitchUrl } from './languageMenu';

function memoryStorage(initial: Record<string, string> = {}) {
  const m = new Map(Object.entries(initial));
  return {
    getItem: (k: string) => (m.has(k) ? m.get(k)! : null),
    setItem: (k: string, v: string) => void m.set(k, String(v)),
    removeItem: (k: string) => void m.delete(k),
    clear: () => m.clear(),
    key: () => null,
    length: 0,
  } as Storage;
}

afterEach(() => vi.unstubAllGlobals());

describe('adresses NOMAD de connexion et d’inscription (24/11/2026)', () => {
  it('/nomad/inscription est la route d’inscription NOMAD ; l’ancienne /auth/register-nomad reste reconnue', () => {
    expect(NOMAD_REGISTER_PATH).toBe('/nomad/inscription');
    expect(NOMAD_SIGN_IN_PATH).toBe('/nomad/connexion');
    expect(REGISTER_ROUTE_PATHS).toContain('/nomad/inscription');
    expect(resolveRegisterPath('/nomad/inscription')).toBe('/nomad/inscription');
    expect(REGISTER_ROUTE_PATHS).toContain('/auth/register-nomad');
    for (const p of ['/nomad/inscription', '/nomad/inscription/', '/auth/register-nomad', '/en/auth/register-nomad', '/fr/auth/register-nomad', '/es/auth/register-nomad', '/ar/auth/register-nomad']) {
      expect(isNomadRegisterPath(p), p).toBe(true);
    }
    for (const p of ['/auth/register-call-center', '/auth/register', '/auth/register-company', '/telephony/nomad', '/nomad', '/nomad/connexion']) expect(isNomadRegisterPath(p), p).toBe(false);
  });

  it('/nomad/connexion est la connexion NOMAD ; porte NOMAD = connexion ou inscription NOMAD', () => {
    for (const p of ['/nomad/connexion', '/nomad/connexion/']) expect(isNomadSignInPath(p)).toBe(true);
    for (const p of ['/auth/signin', '/nomad', '/nomad/inscription']) expect(isNomadSignInPath(p)).toBe(false);
    for (const p of ['/nomad/connexion', '/nomad/inscription', '/auth/register-nomad']) expect(isNomadDoorPath(p)).toBe(true);
    for (const p of ['/auth/signin', '/auth/register-call-center', '/nomad', '/nomad/poste', '/telephony']) expect(isNomadDoorPath(p)).toBe(false);
  });

  it('requête d’une adresse NOMAD : ?product= retiré (porté par l’adresse), étape et autres paramètres gardés', () => {
    expect(nomadRegisterSearch('?product=callcentre')).toBe('');
    expect(nomadRegisterSearch('?product=nomad')).toBe('');
    expect(nomadRegisterSearch('')).toBe('');
    expect(nomadRegisterSearch('?product=callcentre&step=email')).toBe('?step=email');
    expect(nomadRegisterSearch('?utm_source=mail')).toBe('?utm_source=mail');
  });

  it('anciennes adresses → adresses NOMAD avant le routeur (sans préfixe de langue)', () => {
    // /auth/register-nomad : toujours.
    expect(nomadRegisterRedirect({ pathname: '/auth/register-nomad', search: '?product=nomad' }, false)).toBe('/nomad/inscription');
    expect(nomadRegisterRedirect({ pathname: '/en/auth/register-nomad', search: '?product=nomad&step=email', hash: '#x' }, true)).toBe('/nomad/inscription?step=email#x');
    // /auth/register-call-center : seulement pour un visiteur Nomad.
    expect(nomadRegisterRedirect({ pathname: '/auth/register-call-center', search: '?product=callcentre' }, true)).toBe('/nomad/inscription');
    expect(nomadRegisterRedirect({ pathname: '/fr/auth/register-call-center/', search: '?product=callcentre&step=email', hash: '#x' }, true)).toBe('/nomad/inscription?step=email#x');
    for (const lang of ['en', 'es', 'ar']) {
      expect(nomadRegisterRedirect({ pathname: `/${lang}/auth/register-call-center`, search: '' }, true)).toBe('/nomad/inscription');
    }
    // /auth/signin?product=nomad → /nomad/connexion.
    expect(nomadRegisterRedirect({ pathname: '/auth/signin', search: '?product=nomad' }, false)).toBe('/nomad/connexion');
    expect(nomadRegisterRedirect({ pathname: '/ar/auth/signin', search: '?product=nomad&next=x' }, false)).toBe('/nomad/connexion?next=x');
    // /:lang/nomad/connexion, /:lang/nomad/inscription → sans préfixe.
    expect(nomadRegisterRedirect({ pathname: '/en/nomad/inscription', search: '?step=email' }, true)).toBe('/nomad/inscription?step=email');
    expect(nomadRegisterRedirect({ pathname: '/fr/nomad/connexion' }, false)).toBe('/nomad/connexion');
  });

  it('CLOUD et TAAS : jamais redirigés ; adresses NOMAD : stables (pas de boucle)', () => {
    expect(nomadRegisterRedirect({ pathname: '/auth/register-call-center', search: '?product=callcentre' }, false)).toBeNull();
    expect(nomadRegisterRedirect({ pathname: '/auth/signin', search: '?product=callcentre' }, false)).toBeNull();
    expect(nomadRegisterRedirect({ pathname: '/auth/signin', search: '' }, true)).toBeNull();
    for (const p of ['/auth/register-company', '/auth/register-rep', '/auth/register', '/auth/choice', '/nomad/inscription', '/nomad/connexion']) {
      expect(nomadRegisterRedirect({ pathname: p, search: '' }, true), p).toBeNull();
    }
  });

  it('le changement de langue garde l’adresse NOMAD (pas de préfixe : la langue change sans rechargement)', () => {
    expect(languageSwitchUrl({ pathname: '/nomad/inscription', search: '?step=email' }, 'fr')).toBeNull();
    expect(languageSwitchUrl({ pathname: '/nomad/connexion' }, 'ar')).toBeNull();
  });

  it('?product=nomad = compte du produit Téléphonie (arrivée sur /telephony après inscription), comme ?product=callcentre', () => {
    vi.stubGlobal('localStorage', memoryStorage());
    captureProductFromUrl('?product=nomad');
    expect(isCallcentreProduct()).toBe(true);
    expect(localStorage.getItem('harx_product')).toBe('callcentre');
    vi.stubGlobal('localStorage', memoryStorage());
    captureProductFromUrl('?product=autre');
    expect(isCallcentreProduct()).toBe(false);
  });

  it('/nomad/connexion et /nomad/inscription = porte NOMAD : produit Téléphonie et marqueur harx_nomad_door, sans ?product=', () => {
    for (const path of ['/nomad/connexion', '/nomad/inscription']) {
      vi.stubGlobal('localStorage', memoryStorage());
      vi.stubGlobal('sessionStorage', memoryStorage());
      captureProductFromUrl('', path);
      expect(isCallcentreProduct(), path).toBe(true);
      expect(sessionStorage.getItem('harx_nomad_door'), path).toBe('1');
    }
    // Porte CLOUD : marqueur NOMAD effacé (inchangé).
    vi.stubGlobal('localStorage', memoryStorage());
    vi.stubGlobal('sessionStorage', memoryStorage({ harx_nomad_door: '1' }));
    captureProductFromUrl('?product=callcentre', '/auth/signin');
    expect(sessionStorage.getItem('harx_nomad_door')).toBeNull();
    expect(isCallcentreProduct()).toBe(true);
  });

  it('/nomad/inscription mémorise l’offre Nomad Solo comme le relais /telephony/start?profil=solo (connexion : rien)', () => {
    vi.stubGlobal('localStorage', memoryStorage({ harx_cc_pending_plan: 'accueil', harx_cc_pending_name: 'Ancien centre', harx_cc_pending_price: 'price_old' }));
    vi.stubGlobal('sessionStorage', memoryStorage());
    captureProductFromUrl('?utm_source=ads', '/nomad/inscription');
    expect(localStorage.getItem('harx_cc_pending_plan')).toBe('nomad_solo');
    expect(localStorage.getItem('harx_cc_pending_profile')).toBe('solo');
    expect(localStorage.getItem('harx_cc_pending_name')).toBeNull();
    expect(localStorage.getItem('harx_cc_pending_price')).toBeNull();
    // Étapes suivantes (?step=…) : le prix noté à l'arrivée n'est pas effacé.
    vi.stubGlobal('localStorage', memoryStorage());
    rememberNomadSoloOffer('?price=price_1');
    rememberNomadSoloOffer('?step=email');
    expect(localStorage.getItem('harx_cc_pending_price')).toBe('price_1');
    // Connexion NOMAD : l'offre mémorisée n'est pas touchée.
    vi.stubGlobal('localStorage', memoryStorage({ harx_cc_pending_plan: 'accueil' }));
    captureProductFromUrl('', '/nomad/connexion');
    expect(localStorage.getItem('harx_cc_pending_plan')).toBe('accueil');
    // CLOUD : rien n'est écrit.
    vi.stubGlobal('localStorage', memoryStorage({ harx_cc_pending_plan: 'accueil' }));
    captureProductFromUrl('?product=callcentre', '/auth/register-call-center');
    expect(localStorage.getItem('harx_cc_pending_plan')).toBe('accueil');
    expect(localStorage.getItem('harx_cc_pending_profile')).toBeNull();
  });

  it('visiteur Nomad : adresse NOMAD (prioritaire), sinon offre ou profil mémorisés par la Téléphonie', () => {
    vi.stubGlobal('localStorage', memoryStorage({ harx_cc_pending_plan: 'accueil' }));
    expect(isNomadVisitor('/nomad/inscription')).toBe(true);
    expect(isNomadVisitor('/nomad/connexion')).toBe(true);
    expect(isNomadVisitor('/fr/auth/register-nomad')).toBe(true);
    expect(isNomadVisitor('/auth/register-call-center')).toBe(false); // CLOUD reste sur l'ancienne adresse
    vi.stubGlobal('localStorage', memoryStorage({ harx_cc_pending_plan: 'nomad_solo' }));
    expect(isNomadVisitor('/auth/register-call-center')).toBe(true);
    vi.stubGlobal('localStorage', memoryStorage({ harx_cc_pending_profile: 'solo' }));
    expect(isNomadVisitor('/auth/register-call-center')).toBe(true);
    vi.stubGlobal('localStorage', memoryStorage());
    expect(isNomadVisitor('/auth/register-call-center')).toBe(false);
  });
});

describe('bouton « Retour » de l’inscription', () => {
  it('Nomad sans historique du module : jamais /auth/choice', () => {
    for (const pathname of ['/auth/register-nomad', '/en/auth/register-nomad', '/fr/auth/register-nomad', '/es/auth/register-nomad', '/ar/auth/register-nomad']) {
      const a = resolveRegisterBack({ canGoBack: false, nomad: true, returnTo: '/auth/choice', pathname });
      expect(a.type).toBe('hard');
      expect(a.type === 'hard' && a.url).not.toContain('/auth/choice');
    }
  });

  it('Nomad : page NOMAD /nomad (adresse sans préfixe de langue : la langue est mémorisée)', () => {
    expect(resolveRegisterBack({ canGoBack: false, nomad: true, pathname: '/nomad/inscription' })).toEqual({ type: 'hard', url: '/nomad' });
    expect(resolveRegisterBack({ canGoBack: false, nomad: true, pathname: '/fr/auth/register-nomad' })).toEqual({ type: 'hard', url: '/nomad' });
    expect(nomadPageUrl()).toBe('/nomad');
  });

  it('Nomad venu de la page Nomad (note de l’hôte) : retour navigateur, qui garde langue et pays de l’adresse', () => {
    const nomadReturn = readNomadReturn(JSON.stringify({ url: '/nomad?pays=CA' }));
    expect(nomadReturn).toBe('/nomad?pays=CA');
    expect(resolveRegisterBack({ canGoBack: false, nomad: true, nomadReturn, pathname: '/nomad/inscription' })).toEqual({ type: 'browser-back' });
    // Note écrite avant le changement d'adresse : ancienne page NOMAD, toujours reconnue.
    expect(readNomadReturn(JSON.stringify({ url: '/telephony/nomad?pays=CA' }))).toBe('/telephony/nomad?pays=CA');
  });

  it('note de l’hôte invalide ou étrangère à Nomad : ignorée', () => {
    expect(OFFER_RETURN_KEY).toBe('harx_offer_return');
    for (const raw of [null, '', 'x', '{}', JSON.stringify({ url: '/telephony' }), JSON.stringify({ url: 'https://evil.test/telephony/nomad' }), JSON.stringify({ url: '/telephony/nomadic' }), JSON.stringify({ url: '//evil.test/telephony/nomad' }), JSON.stringify({ url: '/nomadic' }), JSON.stringify({ url: '/nomad/poste' }), JSON.stringify({ url: '//evil.test/nomad' })]) {
      expect(readNomadReturn(raw)).toBeNull();
    }
    expect(readNomadReturn(JSON.stringify({ url: '/telephony/nomad/' }))).toBe('/telephony/nomad/');
  });

  it('historique du module disponible : étape / page précédente (inchangé)', () => {
    expect(resolveRegisterBack({ canGoBack: true, nomad: true, pathname: '/auth/register-nomad' })).toEqual({ type: 'history' });
    expect(resolveRegisterBack({ canGoBack: true, nomad: false, pathname: '/auth/register-company' })).toEqual({ type: 'history' });
  });

  it('TAAS et CLOUD : destination inchangée (returnTo, sinon /auth/choice)', () => {
    expect(resolveRegisterBack({ canGoBack: false, nomad: false, pathname: '/auth/register-company' })).toEqual({ type: 'route', to: '/auth/choice' });
    expect(resolveRegisterBack({ canGoBack: false, nomad: false, returnTo: '/taas', pathname: '/auth/register-rep' })).toEqual({ type: 'route', to: '/taas' });
    expect(resolveRegisterBack({ canGoBack: false, nomad: false, pathname: '/auth/register-call-center' })).toEqual({ type: 'route', to: '/auth/choice' });
    // La note de l'hôte ne concerne que Nomad.
    expect(resolveRegisterBack({ canGoBack: false, nomad: false, nomadReturn: '/telephony/nomad', pathname: '/auth/register-call-center' })).toEqual({ type: 'route', to: '/auth/choice' });
  });
});
