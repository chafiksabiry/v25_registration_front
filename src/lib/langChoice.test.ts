import { describe, expect, it } from 'vitest';
import { DEFAULT_SITE_LANG, normalizeSiteLang, resolveSiteLanguage } from './langRoutes';
import { resolvePageMeta } from './tracking/pageMeta';

describe('choix de la langue : préfixe d\'URL > choix mémorisé > navigateur > anglais', () => {
  const cases: Array<[string, Parameters<typeof resolveSiteLanguage>[0], string]> = [
    ['préfixe /fr prime sur tout', { urlLang: 'fr', storedExplicit: 'en', browser: ['ar'] }, 'fr'],
    ['préfixe /ar prime sur tout', { urlLang: 'ar', storedExplicit: 'fr', browser: ['fr'] }, 'ar'],
    ['préfixe /es', { urlLang: 'es', storedExplicit: null, browser: [] }, 'es'],
    ['préfixe inconnu ignoré, navigateur fr', { urlLang: 'xx', storedExplicit: null, browser: ['fr-CA'] }, 'fr'],
    ['choix mémorisé prime sur le navigateur', { urlLang: null, storedExplicit: 'en', browser: ['fr'] }, 'en'],
    ['choix mémorisé ar', { urlLang: null, storedExplicit: 'ar', browser: ['en-US'] }, 'ar'],
    ['choix mémorisé invalide ignoré', { urlLang: null, storedExplicit: 'de', browser: ['es-ES'] }, 'es'],
    ['navigateur fr', { urlLang: null, storedExplicit: null, browser: ['fr-FR', 'en'] }, 'fr'],
    ['navigateur ar', { urlLang: null, storedExplicit: null, browser: ['ar-MA'] }, 'ar'],
    ['première langue prise en charge dans la liste', { urlLang: null, storedExplicit: null, browser: ['de-DE', 'es-MX', 'fr'] }, 'es'],
    ['navigateur de (inconnu) => anglais', { urlLang: null, storedExplicit: null, browser: ['de-DE'] }, 'en'],
    ['aucune préférence => anglais', { urlLang: null, storedExplicit: null, browser: [] }, 'en'],
    ['navigateur absent => anglais', { urlLang: null, storedExplicit: null, browser: undefined }, 'en'],
  ];
  for (const [name, input, expected] of cases) it(name, () => expect(resolveSiteLanguage(input)).toBe(expected));

  it('le repli par défaut est l\'anglais', () => {
    expect(DEFAULT_SITE_LANG).toBe('en');
    expect(normalizeSiteLang('')).toBe('en');
    expect(normalizeSiteLang(undefined)).toBe('en');
    expect(normalizeSiteLang('de-DE')).toBe('en');
    expect(normalizeSiteLang('fr-CA')).toBe('fr');
    expect(normalizeSiteLang('AR')).toBe('ar');
  });
});

describe('SEO : racine sans préférence en anglais, /fr /es /ar inchangés', () => {
  it('racine sans préfixe : canonical /en et x-default /en', () => {
    const m = resolvePageMeta('/');
    expect(m.lang).toBe('en');
    expect(m.canonical).toMatch(/\/en$/);
    expect(m.alternates?.find((a) => a.hreflang === 'x-default')?.href).toMatch(/\/en$/);
  });
  it('/fr reste français, canonical /fr', () => {
    const m = resolvePageMeta('/fr');
    expect(m.lang).toBe('fr');
    expect(m.canonical).toMatch(/\/fr$/);
  });
  it('/en, /es, /ar gardent leur propre canonical', () => {
    for (const l of ['en', 'es', 'ar']) expect(resolvePageMeta(`/${l}`).canonical).toMatch(new RegExp(`/${l}$`));
  });
  it('page sans préfixe : canonical anglais', () => {
    expect(resolvePageMeta('/taas').canonical).toMatch(/\/en\/taas$/);
  });
});
