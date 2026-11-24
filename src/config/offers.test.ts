import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  OFFERS,
  MARK_IDS,
  activeMark,
  NOMAD_PAGE,
  getAvailableOffers,
  HUB_HERO_KEYS,
  isChildComingSoon,
  isOfferComingSoon,
  isRoleComingSoon,
  offersUnlocked,
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
    // Adresses NOMAD (24/11/2026) : page de l'offre /nomad, jamais /telephony.
    expect(resolveOfferHref(byId.nomad, 'ar')).toBe('/nomad');
    expect(NOMAD_PAGE).toBe('/nomad');
  });

  it('« Déjà client ? » : connexions existantes inchangées', () => {
    expect(resolveOfferSignInHref(byId.taas, 'en')).toBe('/en/auth/signin');
    expect(resolveOfferSignInHref(byId.cloud, 'en')).toBe('/auth/signin?product=callcentre');
    // NOMAD : connexion NOMAD (porte NOMAD), plus la connexion CLOUD.
    expect(resolveOfferSignInHref(byId.nomad, 'fr')).toBe('/nomad/connexion');
    expect(resolveOfferSignInHref(byId.nomad, 'ar')).toBe('/nomad/connexion');
  });

  it('liens de l\'accueil (offres ouvertes) : un vrai lien pour chaque entrée', () => {
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
      'nomad/nomad_solo': { type: 'href', href: '/nomad/inscription' },
    });
    // N1 (audit du 19/11) : lien direct « Nomad Solo » ; adresses NOMAD (24/11/2026) : inscription NOMAD /nomad/inscription.
    expect(byId.nomad.children.map((c) => c.id)).toEqual(['nomad_solo']);
    expect(resolveChildTarget(byId.nomad.children[0], 'en')).toEqual({ type: 'href', href: '/nomad/inscription' });
    expect(Object.values(table).some((t) => t.type === 'href' && t.href.startsWith('/telephony/nomad'))).toBe(false);
    expect(Object.values(table).some((t) => t.type === 'href' && /^\/(\w\w\/)?company(\/|$)/.test(t.href))).toBe(false);
  });
});

describe('« Bientôt disponible » piloté par VITE_RECETTE_UNLOCK_OFFERS', () => {
  afterEach(() => vi.unstubAllEnvs());
  const soonKeys = ['company', 'full_scope', 'multi_clients'] as const;

  it('production (réglage absent ou différent de « true ») : seul Company (TAAS) est « bientôt »', () => {
    expect(isOfferComingSoon('company', false)).toBe(true);
    // Full Scope et Multi-clients : ouverts à la vente depuis le 19/11/2026.
    expect(isOfferComingSoon('full_scope', false)).toBe(false);
    expect(isOfferComingSoon('multi_clients', false)).toBe(false);
    expect(offersUnlocked({})).toBe(false);
    expect(offersUnlocked({ VITE_RECETTE_UNLOCK_OFFERS: 'false' })).toBe(false);
    expect(offersUnlocked({ VITE_RECETTE_UNLOCK_OFFERS: '1' })).toBe(false);
    expect(offersUnlocked({ VITE_RECETTE_UNLOCK_OFFERS: 'TRUE' })).toBe(false);
  });

  it('recette (réglage = « true ») : tout est ouvert', () => {
    for (const k of soonKeys) expect(isOfferComingSoon(k, true)).toBe(false);
    expect(offersUnlocked({ VITE_RECETTE_UNLOCK_OFFERS: 'true' })).toBe(true);
  });

  it('les autres offres ne sont jamais « bientôt »', () => {
    expect(isRoleComingSoon('rep', false)).toBe(false);
    expect(isRoleComingSoon('call-center', false)).toBe(false);
  });

  it('une seule règle : rôle et entrées de l\'accueil suivent le même réglage', () => {
    expect(isRoleComingSoon('company', false)).toBe(true);
    expect(isRoleComingSoon('company', true)).toBe(false);
    const state = (unlocked: boolean) => Object.fromEntries(OFFERS.flatMap((o) => o.children.map((c) => [`${o.id}/${c.id}`, isChildComingSoon(c, unlocked)])));
    expect(state(false)).toEqual({ 'taas/company': true, 'taas/reps': false, 'cloud/accueil': false, 'cloud/full_scope': false, 'cloud/multi_clients': false, 'nomad/nomad_solo': false });
    expect(state(true)).toEqual({ 'taas/company': false, 'taas/reps': false, 'cloud/accueil': false, 'cloud/full_scope': false, 'cloud/multi_clients': false, 'nomad/nomad_solo': false });
  });

  it('sans paramètre : lit le réglage de construction', () => {
    vi.stubEnv('VITE_RECETTE_UNLOCK_OFFERS', 'true');
    expect(isRoleComingSoon('company')).toBe(false);
    expect(isOfferComingSoon('full_scope')).toBe(false);
    vi.stubEnv('VITE_RECETTE_UNLOCK_OFFERS', '');
    expect(isRoleComingSoon('company')).toBe(true);
    expect(isOfferComingSoon('multi_clients')).toBe(false);
  });

  it('la pastille « Bientôt disponible » est traduite dans les 4 langues', () => {
    const en = lookup(locale('en'), 'hub.comingSoon');
    expect(en).toBe('Coming soon');
    expect(lookup(locale('fr'), 'hub.comingSoon')).toBe('Bientôt disponible');
    for (const lang of ['es', 'ar']) expect(lookup(locale(lang), 'hub.comingSoon'), lang).not.toBe(en);
    for (const lang of LANGS) expect(String(lookup(locale(lang), 'hub.comingSoon')).trim(), lang).not.toBe('');
  });
});

describe('bandeau à trois pastilles sur tous les écrans', () => {
  it('toujours TAAS, CLOUD, NOMAD (plus de couple TAAS / TELEPHONY)', () => {
    expect(MARK_IDS).toEqual(['taas', 'cloud', 'nomad']);
  });

  it('pastille active selon la page', () => {
    expect(activeMark({ hub: true })).toBeNull(); // accueil, pages légales : aucune offre courante
    expect(activeMark({ taas: 'home' })).toBe('taas');
    expect(activeMark({ taas: 'company' })).toBe('taas');
    expect(activeMark({})).toBe('taas'); // /auth/choice, inscription et connexion TAAS
    expect(activeMark({ telephony: true })).toBe('cloud'); // parcours Téléphonie non Nomad
    expect(activeMark({ telephony: true, nomad: false })).toBe('cloud');
    expect(activeMark({ telephony: true, nomad: true })).toBe('nomad'); // parcours Nomad Solo
    // adresse courante /telephony/nomad : NOMAD actif, quel que soit le contexte
    expect(activeMark({ pathname: '/telephony/nomad' })).toBe('nomad');
    expect(activeMark({ pathname: '/telephony/nomad/' })).toBe('nomad');
    expect(activeMark({ pathname: '/fr/telephony/nomad' })).toBe('nomad');
    expect(activeMark({ pathname: '/telephony/nomad', telephony: true })).toBe('nomad');
    expect(activeMark({ pathname: '/telephony/nomad', hub: true })).toBe('nomad');
    // adresses NOMAD (24/11/2026) : /nomad, /nomad/connexion, /nomad/inscription
    for (const p of ['/nomad', '/nomad/', '/fr/nomad', '/nomad/connexion', '/nomad/inscription']) {
      expect(activeMark({ pathname: p }), p).toBe('nomad');
      expect(activeMark({ pathname: p, telephony: true }), p).toBe('nomad');
    }
    expect(activeMark({ pathname: '/nomadic' })).toBe('taas');
    // CLOUD et TAAS restent actifs ailleurs ; un chemin voisin n'active pas NOMAD
    expect(activeMark({ pathname: '/telephony', telephony: true })).toBe('cloud');
    expect(activeMark({ pathname: '/telephony/nomadic' })).toBe('taas');
    expect(activeMark({ pathname: '/en/taas' })).toBe('taas');
  });

  it('liens des pastilles', () => {
    expect(resolveMarkHref('taas', 'en')).toBe('/en/taas');
    expect(resolveMarkHref('taas', 'ar')).toBe('/ar/taas');
    expect(resolveMarkHref('cloud', 'fr')).toBe('/telephony');
    expect(resolveMarkHref('nomad', 'fr')).toBe('/nomad');
    expect(resolveMarkHref('nomad', 'ar')).toBe('/nomad');
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

  it('héros : titre en deux lignes et phrase d\'appui, traduits', () => {
    const en = locale('en');
    expect(lookup(en, HUB_HERO_KEYS.title1)).toBe('All your calls,');
    expect(lookup(en, HUB_HERO_KEYS.title2)).toBe('wherever you are.');
    expect(lookup(en, HUB_HERO_KEYS.sub)).toBe('Make and take calls with your team, our experts, or AI.');
    expect(lookup(locale('fr'), HUB_HERO_KEYS.title1)).toBe('Tous vos appels,');
    expect(lookup(locale('fr'), HUB_HERO_KEYS.title2)).toBe('où que vous soyez.');
    expect(lookup(locale('fr'), HUB_HERO_KEYS.sub)).toBe("Recevez et passez vos appels avec vos équipes, nos experts ou l'IA.");
    for (const lang of ['es', 'ar']) for (const key of Object.values(HUB_HERO_KEYS)) expect(lookup(locale(lang), key), `${lang} ${key}`).not.toBe(lookup(en, key));
  });

  it('NOMAD : accroche de la carte distincte du titre de la page et du premier avantage', () => {
    const expected: Record<string, string> = {
      fr: 'Gardez votre numéro, même en voyage.',
      en: 'Keep your number, even when you travel.',
      es: 'Conserve su número, incluso de viaje.',
      ar: 'احتفظ برقمك، حتى أثناء السفر.',
    };
    // « partout dans le monde » est déjà dit par le premier avantage de la carte.
    const worldwide: Record<string, RegExp> = {
      fr: /partout dans le monde/i,
      en: /anywhere in the world/i,
      es: /todo el mundo|parte del mundo/i,
      ar: /العالم/,
    };
    for (const lang of LANGS) {
      const json = locale(lang);
      const tagline = lookup(json, 'hub.offers.nomad.target');
      expect(tagline, lang).toBe(expected[lang]);
      expect(tagline, lang).not.toContain(lookup(json, HUB_HERO_KEYS.title2).replace(/\.$/, ''));
      expect(tagline, lang).not.toMatch(worldwide[lang]);
    }
  });

  it('liens secondaires courts, comme la maquette', () => {
    for (const lang of LANGS) {
      expect(lookup(locale(lang), 'hub.offers.cloud.fullScope')).toBe('Entreprise');
      expect(lookup(locale(lang), 'hub.offers.cloud.multiClients')).toBe('Contact Centre');
    }
  });

  // MAQUETTE renommage 22/11 : « Contact Centre » est un nom d'offre identique dans toutes les langues (décision du fondateur), exclu du contrôle US.
  it('anglais : orthographe US', () => {
    const json = locale('en');
    for (const o of OFFERS) for (const key of [o.titleKey, o.targetKey, o.ctaKey, ...o.benefitKeys, ...o.children.map((c) => c.labelKey)]) expect(lookup(json, key).replace(/\bContact Centre\b/g, ''), key).not.toMatch(/\b(centre|colour|organis\w+|favour\w*|programme)\b/i);
  });

  it('les noms complets et la mention AI POWERED', () => {
    const en = locale('en');
    expect(lookup(en, byId.taas.titleKey)).toBe('Transaction As A Service');
    expect(lookup(en, byId.cloud.titleKey)).toBe('Telephony In The Cloud');
    expect(lookup(en, byId.nomad.titleKey)).toBe('Telephony for Digital Workers');
    for (const lang of LANGS) expect(lookup(locale(lang), 'hub.aiPowered')).toBe('AI POWERED');
  });
});
