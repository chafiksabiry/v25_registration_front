import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { langPrefixOf, registerCompanyFallback, rememberExplicitLang, telephonyHandoff } from './publicRoutes';

describe('telephonyHandoff (/:lang/telephony*)', () => {
  it('renvoie vers /telephony* avec la langue de l’adresse', () => {
    expect(telephonyHandoff({ pathname: '/en/telephony' })).toEqual({ lang: 'en', url: '/telephony' });
    expect(telephonyHandoff({ pathname: '/en/telephony/' })).toEqual({ lang: 'en', url: '/telephony' });
    expect(telephonyHandoff({ pathname: '/en/telephony/nomad' })).toEqual({ lang: 'en', url: '/telephony/nomad' });
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
});
