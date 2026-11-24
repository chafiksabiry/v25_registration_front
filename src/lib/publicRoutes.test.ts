import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { langPrefixOf, nomadHandoff, registerCompanyFallback, rememberExplicitLang, telephonyHandoff } from './publicRoutes';

describe('telephonyHandoff (/:lang/telephony*)', () => {
  it('renvoie vers /telephony* avec la langue de l’adresse', () => {
    expect(telephonyHandoff({ pathname: '/en/telephony' })).toEqual({ lang: 'en', url: '/telephony' });
    expect(telephonyHandoff({ pathname: '/en/telephony/' })).toEqual({ lang: 'en', url: '/telephony' });
    // Page NOMAD : adresse NOMAD /nomad (24/11/2026).
    expect(telephonyHandoff({ pathname: '/en/telephony/nomad' })).toEqual({ lang: 'en', url: '/nomad' });
    expect(telephonyHandoff({ pathname: '/fr/telephony' })).toEqual({ lang: 'fr', url: '/telephony' });
    expect(telephonyHandoff({ pathname: '/es/telephony', search: '?situation=tpe', hash: '#prix' })).toEqual({
      lang: 'es',
      url: '/telephony?situation=tpe#prix',
    });
  });

  it('ne touche à aucune autre adresse', () => {
    for (const p of ['/telephony', '/en', '/en/taas', '/en/auth/signin', '/de/telephony', '/en/telephonyx', '/']) {
      expect(telephonyHandoff({ pathname: p })).toBeNull();
    }
  });
});

describe('rememberExplicitLang', () => {
  it('écrit les clés lues par l’application Téléphonie', () => {
    const store = new Map<string, string>();
    rememberExplicitLang('en', { setItem: (k, v) => void store.set(k, v) });
    expect(Object.fromEntries(store)).toEqual({ harxSiteLang: 'en', i18nextLng: 'en', harxLangExplicit: '1' });
  });
  it('ne lève jamais', () => {
    expect(() => rememberExplicitLang('fr', { setItem: () => { throw new Error('x'); } })).not.toThrow();
    expect(() => rememberExplicitLang('fr', null)).not.toThrow();
  });
});

describe('registerCompanyFallback (T2)', () => {
  it('ferme /auth/register-company tant que Company est « bientôt »', () => {
    expect(registerCompanyFallback(true)).toBe('/taas/company');
    expect(registerCompanyFallback(false)).toBeNull();
  });
});

describe('nomadHandoff (/:lang/nomad* → /nomad*, adresses NOMAD du 24/11/2026)', () => {
  it('retire le préfixe de langue, requête et ancre gardées', () => {
    expect(nomadHandoff({ pathname: '/en/nomad' })).toEqual({ lang: 'en', url: '/nomad' });
    expect(nomadHandoff({ pathname: '/ar/nomad/poste/', search: '?x=1', hash: '#h' })).toEqual({ lang: 'ar', url: '/nomad/poste?x=1#h' });
  });
  it('ignore les autres adresses', () => {
    for (const p of ['/nomad', '/nomad/connexion', '/en/nomadic', '/en/telephony/nomad', '/de/nomad', '/en/taas']) expect(nomadHandoff({ pathname: p }), p).toBeNull();
  });
});

describe('langPrefixOf', () => {
  it('lit le préfixe', () => {
    expect(langPrefixOf('/en/xyz')).toBe('en');
    expect(langPrefixOf('/xyz')).toBeNull();
  });
});

describe('router.tsx', () => {
  const src = readFileSync(fileURLToPath(new URL('../router.tsx', import.meta.url)), 'utf8');
  it('a une route * (page 404 propre) et une page d’erreur à la racine, plus seulement sous /admin', () => {
    expect(src).toMatch(/path:\s*'\*'\s*,\s*element:\s*<NotFoundPage/);
    expect(src).toMatch(/errorElement:\s*<NotFoundPage variant="error"/);
  });
  it('sert /:lang/telephony* et garde /auth/register-company', () => {
    expect(src).toMatch(/path:\s*'telephony\/\*'/);
    expect(src).toMatch(/path:\s*'telephony'/);
    expect(src).toMatch(/path:\s*'auth\/register-company',\s*element:\s*<RegisterCompanyGate/);
  });
  it('sert /nomad/connexion et /nomad/inscription, redirige /auth/register-nomad, et passe la main pour /:lang/nomad*', () => {
    expect(src).toMatch(/path:\s*'nomad\/connexion',\s*element:\s*<NomadSignInScreen/);
    expect(src).toMatch(/path:\s*'nomad\/inscription',\s*element:\s*<RegisterNomadScreen/);
    expect(src).toMatch(/path:\s*'auth\/register-nomad',\s*element:\s*<LegacyRegisterNomadRedirect/);
    expect(src).toMatch(/path:\s*'nomad\/\*',\s*element:\s*<NomadHandoff/);
    expect(src).toMatch(/path:\s*'auth\/signin',\s*element:\s*<SignInScreen/);
  });
});
