/**
 * Offres HARX présentées sur l'écran d'accueil de l'ensemble (hub, `/`).
 *
 * Ajouter une offre = ajouter UNE entrée à `OFFERS` (puis ses textes fr/en dans
 * `src/locales/*\/translation.json`, sous `hub.offers.<id>`). Le panneau de
 * l'écran d'accueil, l'onglet mobile et le lien de l'en-tête sont générés depuis
 * cette liste, dans l'ordre. Mise en page : voir « .hub-panels » dans
 * src/components/Hub/hub.css (2 panneaux de largeur égale aujourd'hui ; au-delà,
 * chaque panneau garde une largeur minimale et la rangée défile horizontalement).
 * `status: 'soon'` = offre annoncée, sans lien, non affichée.
 *
 * Module volontairement sans dépendance (ni React, ni i18n) : il est vérifié
 * par `node --experimental-strip-types scripts/check-offers.ts`.
 */

export type OfferStatus = 'available' | 'soon';

/** Identifiants d'icônes ; la correspondance avec les icônes lucide est faite dans le composant. */
export type OfferIcon = 'layers' | 'phone' | 'sparkles';

/** Icônes des étapes du flux animé ; `mascot` = la mascotte HARX. */
export type FlowIcon = 'building' | 'mascot' | 'target' | 'wallet' | 'phone' | 'calls' | 'voicemail' | 'sparkles';

/** Présentation d'une offre sur l'écran d'accueil (chaque clé = une rangée alignée d'un panneau à l'autre). */
export interface OfferHero {
  /** « C'est quoi, pour quoi faire ? » en une phrase. */
  defKey: string;
  /** Phrase d'illustration sous la définition. */
  supportKey: string;
  /** `true` : l'illustration est une citation (italique). */
  supportQuote: boolean;
  /** Petite note de vocabulaire. */
  noteKey: string;
  /** Étapes du flux animé (4). */
  flow: Array<{ key: string; icon: FlowIcon }>;
}

export type OfferLang = 'fr' | 'en';

/** Entrée de l'arborescence d'une offre : parcours d'inscription direct (rôle) ou lien vers une page. */
export type OfferChild =
  | { id: string; labelKey: string; hintKey?: string; kind: 'role'; role: 'company' | 'rep' | 'call-center' }
  | { id: string; labelKey: string; hintKey?: string; kind: 'route'; route: string; langPrefixed: boolean };

/**
 * Parcours d'inscription pas encore ouverts : « Publier un gig » (rôle company) est annoncé « Bientôt disponible » ;
 * son entrée reste visible mais ne démarre aucune inscription. Les connexions existantes ne sont pas concernées.
 */
export const COMING_SOON_ROLES: ReadonlyArray<'company' | 'rep' | 'call-center'> = ['company'];

export function isRoleComingSoon(role: 'company' | 'rep' | 'call-center'): boolean {
  return COMING_SOON_ROLES.includes(role);
}

export function isChildComingSoon(child: OfferChild): boolean {
  return child.kind === 'role' && isRoleComingSoon(child.role);
}

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
  /** Libellé court pour l'en-tête et l'onglet mobile. */
  navKey: string;
  ctaKey: string;
  /** Accroche et flux animé du panneau de l'offre. */
  hero: OfferHero;
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
    ctaKey: 'hub.offers.taas.cta',
    hero: {
      defKey: 'hub.offers.taas.hero.def',
      supportKey: 'hub.offers.taas.hero.support',
      supportQuote: true,
      noteKey: 'hub.offers.taas.hero.note',
      flow: [
        { key: 'hub.offers.taas.hero.flow1', icon: 'building' },
        { key: 'hub.offers.taas.hero.flow2', icon: 'mascot' },
        { key: 'hub.offers.taas.hero.flow3', icon: 'target' },
        { key: 'hub.offers.taas.hero.flow4', icon: 'wallet' },
      ],
    },
    children: [
      { id: 'company', labelKey: 'hub.offers.taas.company', hintKey: 'hub.offers.taas.companyHint', kind: 'role', role: 'company' },
      { id: 'reps', labelKey: 'hub.offers.taas.reps', hintKey: 'hub.offers.taas.repsHint', kind: 'role', role: 'rep' },
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
    ctaKey: 'hub.offers.telephony.cta',
    // Accroche et étapes tirées de la vitrine /telephony (Landing.tsx, landingStories.ts, landingProfiles.ts).
    hero: {
      defKey: 'hub.offers.telephony.hero.def',
      supportKey: 'hub.offers.telephony.hero.support',
      supportQuote: false,
      noteKey: 'hub.offers.telephony.hero.note',
      flow: [
        { key: 'hub.offers.telephony.hero.flow1', icon: 'phone' },
        { key: 'hub.offers.telephony.hero.flow2', icon: 'calls' },
        { key: 'hub.offers.telephony.hero.flow3', icon: 'voicemail' },
        { key: 'hub.offers.telephony.hero.flow4', icon: 'sparkles' },
      ],
    },
    // Noms et ordre de la vitrine /telephony ; ancres déjà présentes sur la vitrine (sections d'histoires).
    children: [
      { id: 'nomad_solo', labelKey: 'hub.offers.telephony.nomadSolo', kind: 'route', route: '/telephony#nomade', langPrefixed: false },
      { id: 'accueil', labelKey: 'hub.offers.telephony.accueil', kind: 'route', route: '/telephony#accueil-secretariat', langPrefixed: false },
      { id: 'full_scope', labelKey: 'hub.offers.telephony.fullScope', kind: 'route', route: '/telephony#pme-equipes-distantes', langPrefixed: false },
      { id: 'multi_clients', labelKey: 'hub.offers.telephony.multiClients', kind: 'route', route: '/telephony#centres-appels', langPrefixed: false },
    ],
    signIn: { route: '/auth/signin?product=callcentre', langPrefixed: false },
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
