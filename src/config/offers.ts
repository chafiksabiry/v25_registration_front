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
  | { id: string; labelKey: string; hintKey?: string; kind: 'role'; role: 'company' | 'rep' | 'call-center'; soonKey?: ComingSoonKey }
  | { id: string; labelKey: string; hintKey?: string; kind: 'route'; route: string; langPrefixed: boolean; soonKey?: ComingSoonKey };

/**
 * « Bientôt disponible » : UNE seule règle, pilotée par l'environnement.
 * - Production (réglage de construction absent) : Company (TAAS), Full Scope et Multi-clients sont « bientôt », sans lien,
 *   partout où ils apparaissent (accueil et écrans TAAS).
 * - Recette : VITE_RECETTE_UNLOCK_OFFERS=true les ouvre pour les tester (même principe que VITE_RECETTE_UNLOCK_CENTRE_OFFERS
 *   dans l'application Téléphonie).
 */
export type ComingSoonKey = 'company' | 'full_scope' | 'multi_clients';
export const COMING_SOON_OFFERS: readonly ComingSoonKey[] = ['company', 'full_scope', 'multi_clients'];

/** Offres ouvertes pour les tests ? Seule la valeur exacte « true » compte ; absent = production. */
export function offersUnlocked(env: { VITE_RECETTE_UNLOCK_OFFERS?: string } | undefined = import.meta.env): boolean {
  return env?.VITE_RECETTE_UNLOCK_OFFERS === 'true';
}

/** La règle unique : cette offre est-elle « bientôt disponible » ? */
export function isOfferComingSoon(key: ComingSoonKey, unlocked: boolean = offersUnlocked()): boolean {
  return !unlocked && COMING_SOON_OFFERS.includes(key);
}

/** Rôle d'inscription « bientôt » (écrans TAAS : page Company, choix du profil, garde d'inscription). */
export function isRoleComingSoon(role: 'company' | 'rep' | 'call-center', unlocked: boolean = offersUnlocked()): boolean {
  return role === 'company' && isOfferComingSoon('company', unlocked);
}

/** Entrée de l'accueil « bientôt » ? */
export function isChildComingSoon(child: OfferChild, unlocked: boolean = offersUnlocked()): boolean {
  return child.soonKey !== undefined && isOfferComingSoon(child.soonKey, unlocked);
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

/** Textes du haut de l'accueil (clés i18n). */
export const HUB_HERO_KEYS = { title1: 'hub.hero.title1', title2: 'hub.hero.title2', sub: 'hub.hero.sub' } as const;

/**
 * Démarrage de l'offre Nomad Solo (application Téléphonie, même origine). `profil=solo` est indispensable : sans lui, l'application
 * ouvre le parcours entreprise (callcenter_front : planStartPath, src/domain/profile.ts ; StartCenter.tsx).
 */
export const NOMAD_SOLO_START = '/telephony/start?profil=solo&plan=nomad_solo';

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
      // Point d'entrée entreprise TAAS (écran d'inscription entreprise, qui mémorise le profil « company ») : jamais /company/ en direct.
      { id: 'company', labelKey: 'hub.offers.taas.company', kind: 'route', route: '/auth/register-company', langPrefixed: true, soonKey: 'company' },
      { id: 'reps', labelKey: 'hub.offers.taas.reps', kind: 'role', role: 'rep' },
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
    // Chaque offre Téléphonie s'ouvre sur son parcours de démarrage (planStartPath de l'application Téléphonie).
    children: [
      { id: 'accueil', labelKey: 'hub.offers.cloud.accueil', kind: 'route', route: '/telephony/start?plan=accueil', langPrefixed: false },
      { id: 'full_scope', labelKey: 'hub.offers.cloud.fullScope', kind: 'route', route: '/telephony/start?plan=full_scope', langPrefixed: false, soonKey: 'full_scope' },
      { id: 'multi_clients', labelKey: 'hub.offers.cloud.multiClients', kind: 'route', route: '/telephony/start?plan=multi_clients', langPrefixed: false, soonKey: 'multi_clients' },
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

/** Pastilles du bandeau, identiques sur TOUS les écrans : TAAS, CLOUD, NOMAD. */
export type MarkId = 'taas' | 'cloud' | 'nomad';
export const MARK_IDS: readonly MarkId[] = ['taas', 'cloud', 'nomad'];

/**
 * Pastille de l'offre courante : aucune sur l'accueil et les pages légales (`hub`), CLOUD sur les parcours Téléphonie,
 * NOMAD sur les parcours Nomad Solo, TAAS partout ailleurs (pages TAAS, choix du profil, inscription et connexion).
 */
export function activeMark(ctx: { hub?: boolean; taas?: string; telephony?: boolean; nomad?: boolean }): MarkId | null {
  if (ctx.hub) return null;
  if (ctx.telephony) return ctx.nomad ? 'nomad' : 'cloud';
  return 'taas';
}

/** Lien d'une pastille (TAAS est préfixé par la langue ; Téléphonie est une application distincte). */
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
