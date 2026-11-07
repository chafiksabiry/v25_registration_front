/**
 * Offres HARX présentées sur l'accueil de l'ensemble (hub, `/`).
 *
 * Ajouter une offre = ajouter UNE entrée à `OFFERS` (et ses textes fr/en dans
 * `src/locales/*\/translation.json`, sous `hub.offers.<id>`). La carte du hub
 * et le lien de l'en-tête sont générés depuis cette liste.
 *
 * Module volontairement sans dépendance (ni React, ni i18n) : il est vérifié
 * par `node --experimental-strip-types scripts/check-offers.ts`.
 */

export type OfferStatus = 'available' | 'soon';

/** Identifiants d'icônes ; la correspondance avec les icônes lucide est faite dans le composant. */
export type OfferIcon = 'layers' | 'phone' | 'sparkles';

export type OfferLang = 'fr' | 'en';

/** Entrée de l'arborescence d'une offre : parcours d'inscription direct (rôle) ou lien vers une page. */
export type OfferChild =
  | { id: string; labelKey: string; descKey: string; kind: 'role'; role: 'company' | 'rep' | 'call-center' }
  | { id: string; labelKey: string; descKey: string; kind: 'route'; route: string; langPrefixed: boolean };

export type OfferChildTarget = { type: 'role'; role: 'company' | 'rep' | 'call-center' } | { type: 'href'; href: string };

export interface OfferConfig {
  id: string;
  /** Route de l'offre (sans préfixe de langue) ; `null` pour une offre à venir, sans lien. */
  route: string | null;
  /**
   * `true` : page servie par la micro-application « auth », qui existe en /fr/… et /en/… ;
   * `false` : application distincte qui gère sa propre langue (ex. /telephony).
   */
  langPrefixed: boolean;
  status: OfferStatus;
  icon: OfferIcon;
  /** Clés i18n (namespace par défaut). */
  titleKey: string;
  /** Libellé court pour l'en-tête. */
  navKey: string;
  taglineKey: string;
  bulletKeys: string[];
  ctaKey: string;
  /** « Pour qui ? » en une ligne. */
  forWhoKey: string;
  /** Proposition de valeur développée (section de détail). */
  pitchKey: string;
  /** Sous-entrées affichées sous la carte (arborescence de l'offre). */
  children: OfferChild[];
  /** Connexion propre à l'offre (« Déjà client ? Se connecter ») ; `null` si aucune. */
  signIn: { route: string; langPrefixed: boolean } | null;
}

export const OFFERS: readonly OfferConfig[] = [
  {
    id: 'taas',
    route: '/taas',
    langPrefixed: true,
    status: 'available',
    icon: 'layers',
    titleKey: 'hub.offers.taas.title',
    navKey: 'hub.offers.taas.nav',
    taglineKey: 'hub.offers.taas.tagline',
    bulletKeys: ['hub.offers.taas.b1', 'hub.offers.taas.b2', 'hub.offers.taas.b3'],
    ctaKey: 'hub.offers.taas.cta',
    forWhoKey: 'hub.offers.taas.forWho',
    pitchKey: 'hub.offers.taas.pitch',
    children: [
      { id: 'company', labelKey: 'hub.offers.taas.company', descKey: 'hub.offers.taas.companyDesc', kind: 'role', role: 'company' },
      { id: 'reps', labelKey: 'hub.offers.taas.reps', descKey: 'hub.offers.taas.repsDesc', kind: 'role', role: 'rep' },
    ],
    signIn: { route: '/auth/signin', langPrefixed: true },
  },
  {
    id: 'telephony',
    route: '/telephony',
    langPrefixed: false,
    status: 'available',
    icon: 'phone',
    titleKey: 'hub.offers.telephony.title',
    navKey: 'hub.offers.telephony.nav',
    taglineKey: 'hub.offers.telephony.tagline',
    bulletKeys: ['hub.offers.telephony.b1', 'hub.offers.telephony.b2', 'hub.offers.telephony.b3'],
    ctaKey: 'hub.offers.telephony.cta',
    forWhoKey: 'hub.offers.telephony.forWho',
    pitchKey: 'hub.offers.telephony.pitch',
    // Noms et ordre de la vitrine /telephony ; ancres déjà présentes sur la vitrine (sections d'histoires).
    children: [
      { id: 'nomad_solo', labelKey: 'hub.offers.telephony.nomadSolo', descKey: 'hub.offers.telephony.nomadSoloDesc', kind: 'route', route: '/telephony#nomade', langPrefixed: false },
      { id: 'accueil', labelKey: 'hub.offers.telephony.accueil', descKey: 'hub.offers.telephony.accueilDesc', kind: 'route', route: '/telephony#accueil-secretariat', langPrefixed: false },
      { id: 'full_scope', labelKey: 'hub.offers.telephony.fullScope', descKey: 'hub.offers.telephony.fullScopeDesc', kind: 'route', route: '/telephony#pme-equipes-distantes', langPrefixed: false },
      { id: 'multi_clients', labelKey: 'hub.offers.telephony.multiClients', descKey: 'hub.offers.telephony.multiClientsDesc', kind: 'route', route: '/telephony#centres-appels', langPrefixed: false },
    ],
    signIn: { route: '/auth/signin?product=callcentre', langPrefixed: false },
  },
  {
    id: 'more',
    route: null,
    langPrefixed: false,
    status: 'soon',
    icon: 'sparkles',
    titleKey: 'hub.offers.more.title',
    navKey: 'hub.offers.more.title',
    taglineKey: 'hub.offers.more.tagline',
    bulletKeys: [],
    ctaKey: 'hub.offers.more.title',
    forWhoKey: 'hub.offers.more.tagline',
    pitchKey: 'hub.offers.more.tagline',
    children: [],
    signIn: null,
  },
];

/** Offres ouvertes (avec une route) : cartes cliquables et liens de l'en-tête. */
export function getAvailableOffers(offers: readonly OfferConfig[] = OFFERS): OfferConfig[] {
  return offers.filter((o) => o.status === 'available' && o.route !== null);
}

/** Offres annoncées, sans lien. */
export function getSoonOffers(offers: readonly OfferConfig[] = OFFERS): OfferConfig[] {
  return offers.filter((o) => o.status === 'soon');
}

/** URL de destination d'une offre pour la langue donnée ; `null` si elle n'a pas de lien. */
export function resolveOfferHref(offer: OfferConfig, lang: OfferLang): string | null {
  if (offer.status !== 'available' || offer.route === null) return null;
  return offer.langPrefixed ? `/${lang}${offer.route}` : offer.route;
}

/** URL de la connexion propre à l'offre pour la langue donnée ; `null` si l'offre n'en a pas. */
export function resolveOfferSignInHref(offer: OfferConfig, lang: OfferLang): string | null {
  if (offer.status !== 'available' || !offer.signIn) return null;
  return offer.signIn.langPrefixed ? `/${lang}${offer.signIn.route}` : offer.signIn.route;
}

/** Destination d'une sous-entrée : rôle d'inscription (même mécanisme que /auth/choice) ou URL. */
export function resolveChildTarget(child: OfferChild, lang: OfferLang): OfferChildTarget {
  if (child.kind === 'role') return { type: 'role', role: child.role };
  return { type: 'href', href: child.langPrefixed ? `/${lang}${child.route}` : child.route };
}

/** « Quelle offre est faite pour vous ? » : un besoin renvoie vers une sous-entrée existante (mêmes parcours). */
export interface OfferNeed { id: string; questionKey: string; offerId: string; childId: string }

export const NEEDS: readonly OfferNeed[] = [
  { id: 'agents', questionKey: 'hub.needs.agents', offerId: 'taas', childId: 'company' },
  { id: 'gigs', questionKey: 'hub.needs.gigs', offerId: 'taas', childId: 'reps' },
  { id: 'number', questionKey: 'hub.needs.number', offerId: 'telephony', childId: 'nomad_solo' },
  { id: 'reception', questionKey: 'hub.needs.reception', offerId: 'telephony', childId: 'accueil' },
  { id: 'teams', questionKey: 'hub.needs.teams', offerId: 'telephony', childId: 'full_scope' },
  { id: 'clients', questionKey: 'hub.needs.clients', offerId: 'telephony', childId: 'multi_clients' },
];

export function resolveNeed(need: OfferNeed, offers: readonly OfferConfig[] = OFFERS): { offer: OfferConfig; child: OfferChild } | null {
  const offer = offers.find((o) => o.id === need.offerId);
  const child = offer?.children.find((c) => c.id === need.childId);
  return offer && child ? { offer, child } : null;
}
