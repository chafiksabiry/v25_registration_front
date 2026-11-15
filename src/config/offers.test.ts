import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  OFFERS,
  HUB_MARK_IDS,
  HEADER_MARK_IDS,
  NOMAD_SOLO_START,
  getAvailableOffers,
  isChildComingSoon,
  resolveChildTarget,
  resolveMarkHref,
  resolveOfferHref,
  resolveOfferSignInHref,
} from './offers';

const LANGS = ['fr', 'en', 'es', 'ar'] as const;
const locale = (lang: string) => JSON.parse(readFileSync(new URL(`../locales/${lang}/translation.json`, import.meta.url), 'utf8'));
const lookup = (obj: any, path: string) => path.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), obj);
const byId = Object.fromEntries(OFFERS.map((o) => [o.id, o]));

describe('accueil : trois offres', () => {
  it('présente TAAS, CLOUD et NOMAD, dans cet ordre', () => {
    expect(getAvailableOffers().map((o) => o.id)).toEqual(['taas', 'cloud', 'nomad']);
    expect(getAvailableOffers().map((o) => o.acronym)).toEqual(['TAAS', 'CLOUD', 'NOMAD']);
  });

  it('chaque offre a trois bénéfices', () => {
    for (const o of OFFERS) expect(o.benefitKeys).toHaveLength(3);
  });

  it('boutons principaux : TAAS et CLOUD vers l\'existant, NOMAD vers Nomad Solo', () => {
    expect(resolveOfferHref(byId.taas, 'en')).toBe('/en/taas');
    expect(resolveOfferHref(byId.taas, 'fr')).toBe('/fr/taas');
    expect(resolveOfferHref(byId.cloud, 'es')).toBe('/telephony');
    expect(resolveOfferHref(byId.nomad, 'ar')).toBe('/telephony/start?plan=nomad_solo');
    expect(NOMAD_SOLO_START).toBe('/telephony/start?plan=nomad_solo');
  });

  it('« Déjà client ? » : connexions existantes inchangées', () => {
    expect(resolveOfferSignInHref(byId.taas, 'en')).toBe('/en/auth/signin');
    expect(resolveOfferSignInHref(byId.cloud, 'en')).toBe('/auth/signin?product=callcentre');
    expect(resolveOfferSignInHref(byId.nomad, 'fr')).toBe('/auth/signin?product=callcentre');
  });

  it('TAAS conserve ses deux parcours (Company bientôt disponible, REPS) et CLOUD ses ancres SEO', () => {
    expect(byId.taas.children.map((c) => c.id)).toEqual(['company', 'reps']);
    expect(resolveChildTarget(byId.taas.children[0], 'en')).toEqual({ type: 'role', role: 'company' });
    expect(resolveChildTarget(byId.taas.children[1], 'en')).toEqual({ type: 'role', role: 'rep' });
    expect(byId.cloud.children.map((c) => (resolveChildTarget(c, 'en') as { href: string }).href)).toEqual([
      '/telephony#accueil-secretariat',
      '/telephony#pme-equipes-distantes',
      '/telephony#centres-appels',
    ]);
    expect(byId.nomad.children).toEqual([]);
  });

  it('CLOUD : seules les offres ouvertes sont des liens (Full Scope et Multi-clients « Bientôt disponible »)', () => {
    expect(byId.cloud.children.map((c) => [c.id, isChildComingSoon(c)])).toEqual([
      ['accueil', false],
      ['full_scope', true],
      ['multi_clients', true],
    ]);
    expect(byId.taas.children.map((c) => isChildComingSoon(c))).toEqual([true, false]);
  });
});

describe('bandeau', () => {
  it('l\'accueil affiche TAAS, CLOUD, NOMAD ; les autres écrans gardent TAAS et TELEPHONY', () => {
    expect(HUB_MARK_IDS).toEqual(['taas', 'cloud', 'nomad']);
    expect(HEADER_MARK_IDS).toEqual(['taas', 'telephony']);
  });

  it('liens des pastilles', () => {
    expect(resolveMarkHref('taas', 'en')).toBe('/en/taas');
    expect(resolveMarkHref('telephony', 'fr')).toBe('/telephony');
    expect(resolveMarkHref('cloud', 'fr')).toBe('/telephony');
    expect(resolveMarkHref('nomad', 'fr')).toBe('/telephony/start?plan=nomad_solo');
  });
});

describe('textes (i18n)', () => {
  const keysOf = (o: (typeof OFFERS)[number]) => [
    o.titleKey, o.navKey, o.ctaKey, o.targetKey, ...o.benefitKeys,
    ...o.children.flatMap((c) => [c.labelKey, ...(c.hintKey ? [c.hintKey] : [])]),
  ];
  const globalKeys = ['hub.aiPowered', 'hub.alreadyClient', 'hub.signIn', 'hub.definition', 'hub.offersAria'];

  for (const lang of LANGS) {
    it(`${lang} : toutes les clés existent`, () => {
      const json = locale(lang);
      for (const key of [...globalKeys, ...OFFERS.flatMap(keysOf)]) {
        const v = lookup(json, key);
        expect(typeof v === 'string' && v.trim() !== '', `${lang} : clé manquante ${key}`).toBe(true);
      }
    });
  }

  it('es et ar sont réellement traduits (cible et bénéfices différents de l\'anglais)', () => {
    const en = locale('en');
    for (const lang of ['fr', 'es', 'ar']) {
      const json = locale(lang);
      for (const o of OFFERS) for (const key of [o.targetKey, ...o.benefitKeys]) expect(lookup(json, key), `${lang} ${key}`).not.toBe(lookup(en, key));
    }
  });

  it('aucun prix ni offre marchande', () => {
    const price = /[$€£]|\b\d+([.,]\d+)?\s?(usd|eur|gbp|dollars?|euros?)\b|\b(price|pricing|prix|tarif|precio|\/mo|per month|par mois)\b|السعر|سعر/i;
    for (const lang of LANGS) {
      const json = locale(lang);
      for (const o of OFFERS) for (const key of [o.titleKey, o.targetKey, o.ctaKey, ...o.benefitKeys]) expect(lookup(json, key), `${lang} ${key}`).not.toMatch(price);
    }
  });

  it('anglais : « Contact Center Multi-Clients » ; français : « Contact Centre Multi-clients »', () => {
    expect(lookup(locale('en'), 'hub.offers.cloud.multiClients')).toBe('Contact Center Multi-Clients');
    expect(lookup(locale('fr'), 'hub.offers.cloud.multiClients')).toBe('Contact Centre Multi-clients');
  });

  it('anglais : orthographe US', () => {
    const json = locale('en');
    for (const o of OFFERS) for (const key of [o.titleKey, o.targetKey, o.ctaKey, ...o.benefitKeys, ...o.children.map((c) => c.labelKey)]) expect(lookup(json, key), key).not.toMatch(/\b(centre|colour|organis\w+|favour\w*|programme)\b/i);
  });

  it('les noms complets et la mention AI POWERED', () => {
    const en = locale('en');
    expect(lookup(en, byId.taas.titleKey)).toBe('Transaction As A Service');
    expect(lookup(en, byId.cloud.titleKey)).toBe('Telephony In The Cloud');
    expect(lookup(en, byId.nomad.titleKey)).toBe('Telephony for Digital Workers');
    for (const lang of LANGS) expect(lookup(locale(lang), 'hub.aiPowered')).toBe('AI POWERED');
  });
});
