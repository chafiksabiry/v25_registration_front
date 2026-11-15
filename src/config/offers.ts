/**
 * Offres HARX présentées sur l'écran d'accueil de l'ensemble (hub, `/`) : TAAS, CLOUD, NOMAD, toutes « AI POWERED ».
 *
 * Ajouter une offre = ajouter UNE entrée à `OFFERS` (puis ses textes dans `src/locales/*\/translation.json`,
 * sous `hub.offers.<id>`). Les cartes de l'accueil et les pastilles du bandeau de l'accueil sont générées depuis
 * cette liste. `status: 'soon'` = offre annoncée, sans lien, non affichée.
 *
 * Module volontairement sans dépendance (ni React, ni i18n) : testé par `src/config/offers.test.ts`.
 */

export type OfferStatus = 'available' | 'soon';

/** Identifiants d'icônes ; la correspondance avec les icônes lucide est faite dans le composant. */
export type OfferIcon = 'layers' | 'cloud' | 'globe';

export type OfferLang = 'fr' | 'en' | 'es' | 'ar';

/** Entrée de l'arborescence d'une offre : parcours d'inscription direct (rôle) ou lien vers une page. */
export type OfferChild =
  | { id: string; labelKey: string; hintKey?: string; kind: 'role'; role: 'company' | 'rep' | 'call-center' }
  | { id: string; labelKey: string; hintKey?: string; kind: 'route'; route: string; langPrefixed: boolean; /** Offre annoncée mais pas encore ouverte : affichée « Bientôt disponible », sans lien. */ soon?: boolean };

/**
 * Parcours d'inscription pas encore ouverts : « Publier un gig » (rôle company) est annoncé « Bientôt disponible » ;
 * son entrée reste visible mais ne démarre aucune inscription. Les connexions existantes ne sont pas concernées.
 */
export const COMING_SOON_ROLES: ReadonlyArray<'company' | 'rep' | 'call-center'> = ['company'];

export function isRoleComingSoon(role: 'company' | 'rep' | 'call-center'): boolean {
  return COMING_SOON_ROLES.includes(role);
}

export function isChildComingSoon(child: OfferChild): boolean {
  return child.kind === 'role' ? isRoleComingSoon(child.role) : child.soon === true;
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
  /** Sigle de la marque (non traduit) : TAAS, CLOUD, NOMAD. */
  acronym: string;
  /** Clés i18n (namespace par défaut) : nom complet, libellé court, bouton principal. */
  titleKey: string;
  navKey: string;
  ctaKey: string;
  /** La cible en une phrase. */
  targetKey: string;
  /** Trois bénéfices concrets. */
  benefitKeys: [string, string, string];
  /** Sous-entrées affichées sous le bouton principal. */
  children: OfferChild[];
  /** Connexion propre à l'offre (« Déjà client ? Se connecter ») ; `null` si aucune. */
  signIn: { route: string; langPrefixed: boolean } | null;
}

/** Démarrage de l'offre Nomad Solo (application Téléphonie, même origine). */
export const NOMAD_SOLO_START = '/telephony/start?plan=nomad_solo';

const TELEPHONY_SIGN_IN = { route: '/auth/signin?product=callcentre', langPrefixed: false } as const;

export const OFFERS: readonly OfferConfig[] = [
  {
    id: 'taas',
    acronym: 'TAAS',
    route: '/taas',
    langPrefixed: true,
    status: 'available',
    icon: 'layers',
    titleKey: 'hub.offers.taas.title',
    navKey: 'hub.offers.taas.nav',
    ctaKey: 'hub.offers.taas.cta',
    targetKey: 'hub.offers.taas.target',
    benefitKeys: ['hub.offers.taas.benefit1', 'hub.offers.taas.benefit2', 'hub.offers.taas.benefit3'],
    children: [
      { id: 'company', labelKey: 'hub.offers.taas.company', hintKey: 'hub.offers.taas.companyHint', kind: 'role', role: 'company' },
      { id: 'reps', labelKey: 'hub.offers.taas.reps', hintKey: 'hub.offers.taas.repsHint', kind: 'role', role: 'rep' },
    ],
    signIn: { route: '/auth/signin', langPrefixed: true },
  },
  {
    id: 'cloud',
    acronym: 'CLOUD',
    route: '/telephony',
    langPrefixed: false,
    status: 'available',
    icon: 'cloud',
    titleKey: 'hub.offers.cloud.title',
    navKey: 'hub.offers.cloud.nav',
    ctaKey: 'hub.offers.cloud.cta',
    targetKey: 'hub.offers.cloud.target',
    benefitKeys: ['hub.offers.cloud.benefit1', 'hub.offers.cloud.benefit2', 'hub.offers.cloud.benefit3'],
    // Noms et ancres de la vitrine /telephony (Nomad Solo a désormais sa propre offre). Full Scope et Multi-clients sont
    // « Bientôt disponible » sur la page Téléphonie (statut communiqué par le CTO, non revérifié dans callcenter_front).
    children: [
      { id: 'accueil', labelKey: 'hub.offers.cloud.accueil', kind: 'route', route: '/telephony#accueil-secretariat', langPrefixed: false },
      { id: 'full_scope', labelKey: 'hub.offers.cloud.fullScope', kind: 'route', route: '/telephony#pme-equipes-distantes', langPrefixed: false, soon: true },
      { id: 'multi_clients', labelKey: 'hub.offers.cloud.multiClients', kind: 'route', route: '/telephony#centres-appels', langPrefixed: false, soon: true },
    ],
    signIn: TELEPHONY_SIGN_IN,
  },
  {
    id: 'nomad',
    acronym: 'NOMAD',
    route: NOMAD_SOLO_START,
    langPrefixed: false,
    status: 'available',
    icon: 'globe',
    titleKey: 'hub.offers.nomad.title',
    navKey: 'hub.offers.nomad.nav',
    ctaKey: 'hub.offers.nomad.cta',
    targetKey: 'hub.offers.nomad.target',
    benefitKeys: ['hub.offers.nomad.benefit1', 'hub.offers.nomad.benefit2', 'hub.offers.nomad.benefit3'],
    children: [],
    signIn: TELEPHONY_SIGN_IN,
  },
];

/**
 * Pastilles du bandeau. Sur l'accueil : TAAS, CLOUD, NOMAD. Sur tous les autres écrans : TAAS et TELEPHONY (inchangé,
 * à aligner plus tard sur les trois offres).
 */
export type MarkId = 'taas' | 'telephony' | 'cloud' | 'nomad';
export const HUB_MARK_IDS: readonly MarkId[] = ['taas', 'cloud', 'nomad'];
export const HEADER_MARK_IDS: readonly MarkId[] = ['taas', 'telephony'];

/** Lien d'une pastille (l'accueil et TAAS sont préfixés par la langue ; Téléphonie est une application distincte). */
export function resolveMarkHref(mark: MarkId, lang: OfferLang): string {
  if (mark === 'taas') return `/${lang}/taas`;
  if (mark === 'nomad') return NOMAD_SOLO_START;
  return '/telephony';
}

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
