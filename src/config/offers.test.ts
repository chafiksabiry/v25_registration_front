import { describe, expect, it } from 'vitest';
import * as offersModule from './offers';
import { readFileSync } from 'node:fs';
import {
  OFFERS,
  HUB_MARK_IDS,
  HEADER_MARK_IDS,
  NOMAD_SOLO_START,
  getAvailableOffers,
  getHeaderMarkIds,
  HUB_HERO_KEYS,
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
    expect(resolveOfferHref(byId.nomad, 'ar')).toBe('/telephony/start?profil=solo&plan=nomad_solo');
    expect(NOMAD_SOLO_START).toBe('/telephony/start?profil=solo&plan=nomad_solo');
  });

  it('« Déjà client ? » : connexions existantes inchangées', () => {
    expect(resolveOfferSignInHref(byId.taas, 'en')).toBe('/en/auth/signin');
    expect(resolveOfferSignInHref(byId.cloud, 'en')).toBe('/auth/signin?product=callcentre');
    expect(resolveOfferSignInHref(byId.nomad, 'fr')).toBe('/auth/signin?product=callcentre');
  });

  it('liens de l\'accueil : un vrai lien pour chaque entrée, aucune entrée « bientôt »', () => {
    const table = Object.fromEntries(
      OFFERS.flatMap((o) => o.children.map((c) => [`${o.id}/${c.id}`, resolveChildTarget(c, 'en')])),
    );
    expect(table).toEqual({
      // Company : point d'entrée entreprise TAAS (inscription entreprise), jamais /company/ en direct.
      'taas/company': { type: 'href', href: '/en/auth/register-company' },
      'taas/reps': { type: 'role', role: 'rep' },
      'cloud/accueil': { type: 'href', href: '/telephony/start?plan=accueil' },
      'cloud/full_scope': { type: 'href', href: '/telephony/start?plan=full_scope' },
      'cloud/multi_clients': { type: 'href', href: '/telephony/start?plan=multi_clients' },
    });
    expect(byId.nomad.children).toEqual([]);
    for (const o of OFFERS) for (const c of o.children) expect(JSON.stringify(c)).not.toMatch(/soon/i);
    expect(offersModule).not.toHaveProperty('isChildComingSoon');
    expect(Object.values(table).some((t) => t.type === 'href' && /^\/(\w\w\/)?company(\/|$)/.test(t.href))).toBe(false);
  });
});

describe('bandeau', () => {
  it('l\'accueil affiche TAAS, CLOUD, NOMAD ; les autres écrans gardent TAAS et TELEPHONY', () => {
    expect(HUB_MARK_IDS).toEqual(['taas', 'cloud', 'nomad']);
    expect(HEADER_MARK_IDS).toEqual(['taas', 'telephony']);
  });

  it('seul l\'accueil (prop homeThreePills) affiche trois pastilles ; pages légales et autres : ancien bandeau', () => {
    expect(getHeaderMarkIds(true)).toEqual(['taas', 'cloud', 'nomad']);
    expect(getHeaderMarkIds(false)).toEqual(['taas', 'telephony']);
  });

  it('liens des pastilles', () => {
    expect(resolveMarkHref('taas', 'en')).toBe('/en/taas');
    expect(resolveMarkHref('telephony', 'fr')).toBe('/telephony');
    expect(resolveMarkHref('cloud', 'fr')).toBe('/telephony');
    expect(resolveMarkHref('nomad', 'fr')).toBe('/telephony/start?profil=solo&plan=nomad_solo');
  });
});

describe('textes (i18n)', () => {
  const keysOf = (o: (typeof OFFERS)[number]) => [
    o.titleKey, o.navKey, o.ctaKey, o.targetKey, ...o.benefitKeys,
    ...o.children.flatMap((c) => [c.labelKey, ...(c.hintKey ? [c.hintKey] : [])]),
  ];
  const globalKeys = ['hub.aiPowered', 'hub.alreadyClient', 'hub.signIn', 'hub.offersAria', ...Object.values(HUB_HERO_KEYS)];

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

  it('héros : titre en deux lignes et phrase d\'appui, traduits ; aucun « Bientôt disponible » dans l\'accueil', () => {
    const en = locale('en');
    expect(lookup(en, HUB_HERO_KEYS.title1)).toBe('Customer service, telephony, your number.');
    expect(lookup(en, HUB_HERO_KEYS.title2)).toBe('Powered by AI.');
    expect(lookup(en, HUB_HERO_KEYS.sub)).toBe('Three offers, three ways to work with HARX.');
    expect(lookup(locale('fr'), HUB_HERO_KEYS.title1)).toBe('Service client, téléphonie, votre numéro.');
    expect(lookup(locale('fr'), HUB_HERO_KEYS.title2)).toBe("Propulsés par l'IA.");
    expect(lookup(locale('fr'), HUB_HERO_KEYS.sub)).toBe('Trois offres pour trois façons de travailler avec HARX.');
    for (const lang of ['es', 'ar']) for (const key of Object.values(HUB_HERO_KEYS)) expect(lookup(locale(lang), key), `${lang} ${key}`).not.toBe(lookup(en, key));
    for (const lang of LANGS) expect(JSON.stringify(lookup(locale(lang), 'hub')), lang).not.toMatch(/comingSoon|bient[ôo]t|pr[óo]ximamente|قريبًا|coming soon/i);
  });

  it('liens secondaires courts, comme la maquette', () => {
    for (const lang of LANGS) {
      expect(lookup(locale(lang), 'hub.offers.cloud.fullScope')).toBe('Full Scope');
      expect(lookup(locale(lang), 'hub.offers.cloud.multiClients')).toBe('Multi-clients');
    }
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
