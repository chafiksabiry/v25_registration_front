import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  NOMAD_REGISTER_PATH,
  OFFER_RETURN_KEY,
  isNomadRegisterPath,
  nomadPageUrl,
  nomadRegisterRedirect,
  nomadRegisterSearch,
  readNomadReturn,
  resolveRegisterBack,
} from './offerRegister';
import { captureProductFromUrl, isCallcentreProduct, isNomadVisitor } from './product';
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

describe('adresse d’inscription nommée selon l’offre (Nomad)', () => {
  it('/auth/register-nomad est une route d’inscription, avec ou sans préfixe de langue (en, fr, es, ar)', () => {
    expect(NOMAD_REGISTER_PATH).toBe('/auth/register-nomad');
    expect(REGISTER_ROUTE_PATHS).toContain('/auth/register-nomad');
    expect(resolveRegisterPath('/auth/register-nomad')).toBe('/auth/register-nomad');
    for (const p of ['/auth/register-nomad', '/auth/register-nomad/', '/en/auth/register-nomad', '/fr/auth/register-nomad', '/es/auth/register-nomad', '/ar/auth/register-nomad']) {
      expect(isNomadRegisterPath(p)).toBe(true);
    }
    for (const p of ['/auth/register-call-center', '/auth/register', '/auth/register-company', '/telephony/nomad']) expect(isNomadRegisterPath(p)).toBe(false);
  });

  it('ancienne adresse → nouvelle : ?product=nomad, étape et autres paramètres gardés', () => {
    expect(nomadRegisterSearch('?product=callcentre')).toBe('?product=nomad');
    expect(nomadRegisterSearch('')).toBe('?product=nomad');
    expect(nomadRegisterSearch('?product=callcentre&step=email')).toBe('?product=nomad&step=email');
    expect(nomadRegisterSearch('?utm_source=mail')).toBe('?utm_source=mail&product=nomad');
  });

  it('redirection de l’ancienne adresse avant le routeur : seulement pour un visiteur Nomad, préfixe de langue gardé', () => {
    expect(nomadRegisterRedirect({ pathname: '/auth/register-call-center', search: '?product=callcentre' }, true)).toBe('/auth/register-nomad?product=nomad');
    expect(nomadRegisterRedirect({ pathname: '/fr/auth/register-call-center/', search: '?product=callcentre&step=email', hash: '#x' }, true)).toBe('/fr/auth/register-nomad?product=nomad&step=email#x');
    for (const lang of ['en', 'es', 'ar']) {
      expect(nomadRegisterRedirect({ pathname: `/${lang}/auth/register-call-center`, search: '' }, true)).toBe(`/${lang}/auth/register-nomad?product=nomad`);
    }
    // CLOUD (pas Nomad) : ancienne adresse gardée telle quelle.
    expect(nomadRegisterRedirect({ pathname: '/auth/register-call-center', search: '?product=callcentre' }, false)).toBeNull();
    // Autres écrans : jamais redirigés.
    for (const p of ['/auth/register-company', '/auth/register-rep', '/auth/register', '/auth/register-nomad', '/auth/choice']) {
      expect(nomadRegisterRedirect({ pathname: p, search: '' }, true)).toBeNull();
    }
  });

  it('le changement de langue garde l’adresse Nomad', () => {
    expect(languageSwitchUrl({ pathname: '/en/auth/register-nomad', search: '?product=nomad' }, 'fr')).toBe('/fr/auth/register-nomad?product=nomad');
    expect(languageSwitchUrl({ pathname: '/fr/auth/register-nomad', search: '?product=nomad' }, 'ar')).toBe('/ar/auth/register-nomad?product=nomad');
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

  it('visiteur Nomad : adresse /auth/register-nomad (prioritaire), sinon offre ou profil mémorisés par la Téléphonie', () => {
    vi.stubGlobal('localStorage', memoryStorage({ harx_cc_pending_plan: 'accueil' }));
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

  it('Nomad : page Nomad dans la langue de l’adresse', () => {
    expect(resolveRegisterBack({ canGoBack: false, nomad: true, pathname: '/auth/register-nomad' })).toEqual({ type: 'hard', url: '/telephony/nomad' });
    expect(resolveRegisterBack({ canGoBack: false, nomad: true, pathname: '/fr/auth/register-nomad' })).toEqual({ type: 'hard', url: '/fr/telephony/nomad' });
    expect(nomadPageUrl('/ar/auth/register-nomad')).toBe('/ar/telephony/nomad');
    expect(nomadPageUrl('/es/auth/register-nomad')).toBe('/es/telephony/nomad');
    expect(nomadPageUrl('/en/auth/register-nomad')).toBe('/en/telephony/nomad');
  });

  it('Nomad venu de la page Nomad (note de l’hôte) : retour navigateur, qui garde langue et pays de l’adresse', () => {
    const nomadReturn = readNomadReturn(JSON.stringify({ url: '/telephony/nomad?pays=CA' }));
    expect(nomadReturn).toBe('/telephony/nomad?pays=CA');
    expect(resolveRegisterBack({ canGoBack: false, nomad: true, nomadReturn, pathname: '/auth/register-nomad' })).toEqual({ type: 'browser-back' });
  });

  it('note de l’hôte invalide ou étrangère à Nomad : ignorée', () => {
    expect(OFFER_RETURN_KEY).toBe('harx_offer_return');
    for (const raw of [null, '', 'x', '{}', JSON.stringify({ url: '/telephony' }), JSON.stringify({ url: 'https://evil.test/telephony/nomad' }), JSON.stringify({ url: '/telephony/nomadic' }), JSON.stringify({ url: '//evil.test/telephony/nomad' })]) {
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
