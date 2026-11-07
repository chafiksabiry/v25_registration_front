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
