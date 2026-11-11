/**
 * Missions types présentées sur la page TAAS (onglet REPS) : contenu marketing éditable ici, indépendant des missions réelles.
 * Rémunération HARX d'une mission : un fixe par appel argumenté, une commission par transaction et un bonus de performance.
 * Les montants sont ceux affichés au professionnel (en €), à valider avant la mise en production.
 */
export type ExampleGigIcon = 'Sales' | 'Reception' | 'Support' | 'Healthcare' | 'RealEstate' | 'Finance';

export interface ExampleGigText {
  title: string;
  category: string;
  description: string;
}

export interface ExampleGig {
  id: string;
  icon: ExampleGigIcon;
  fr: ExampleGigText;
  en: ExampleGigText;
  /** `perCall` : fixe par appel argumenté ; `perTransaction` : commission par transaction ; `bonus` : bonus de performance. */
  commission: { perCall: number; perTransaction: number; bonus: number };
}

export const EXAMPLE_GIGS: ExampleGig[] = [
  {
    id: 'health-insurance-sales',
    icon: 'Sales',
    fr: { title: 'Télévendeur en assurance santé', category: 'Vente à distance', description: 'Présentez une offre d’assurance santé à des prospects qualifiés et accompagnez-les jusqu’à la souscription.' },
    en: { title: 'Health insurance telesales', category: 'Telesales', description: 'Present a health insurance offer to qualified prospects and guide them through to subscription.' },
    commission: { perCall: 1.5, perTransaction: 35, bonus: 100 },
  },
  {
    id: 'company-reception',
    icon: 'Reception',
    fr: { title: 'Accueil téléphonique d’entreprise', category: 'Accueil', description: 'Répondez aux appels entrants au nom d’une entreprise et orientez chaque appelant vers le bon interlocuteur.' },
    en: { title: 'Company phone reception', category: 'Reception', description: 'Answer inbound calls on behalf of a company and route each caller to the right person.' },
    commission: { perCall: 1.2, perTransaction: 3, bonus: 50 },
  },
  {
    id: 'ecommerce-support',
    icon: 'Support',
    fr: { title: 'Support client e-commerce', category: 'Service client', description: 'Répondez aux questions sur les commandes, livraisons et retours d’une boutique en ligne.' },
    en: { title: 'E-commerce customer support', category: 'Customer service', description: 'Answer questions about orders, deliveries and returns for an online store.' },
    commission: { perCall: 2, perTransaction: 6, bonus: 60 },
  },
  {
    id: 'medical-appointments',
    icon: 'Healthcare',
    fr: { title: 'Confirmation de rendez-vous médicaux', category: 'Santé', description: 'Appelez les patients pour confirmer ou déplacer leur rendez-vous et réduire les absences.' },
    en: { title: 'Medical appointment confirmation', category: 'Healthcare', description: 'Call patients to confirm or reschedule their appointment and reduce no-shows.' },
    commission: { perCall: 1.5, perTransaction: 4, bonus: 80 },
  },
  {
    id: 'property-leads',
    icon: 'RealEstate',
    fr: { title: 'Qualification de contacts immobiliers', category: 'Immobilier', description: 'Évaluez des contacts intéressés par un projet immobilier et identifiez ceux prêts à avancer.' },
    en: { title: 'Property lead qualification', category: 'Real estate', description: 'Assess contacts interested in a property project and identify those ready to move forward.' },
    commission: { perCall: 2, perTransaction: 60, bonus: 120 },
  },
  {
    id: 'payment-reminders',
    icon: 'Finance',
    fr: { title: 'Relance de paiements', category: 'Recouvrement', description: 'Rappelez aimablement les clients dont une échéance est en retard et convenez d’un règlement.' },
    en: { title: 'Payment reminders', category: 'Collections', description: 'Politely call customers with an overdue payment and agree on a settlement.' },
    commission: { perCall: 1.5, perTransaction: 25, bonus: 70 },
  },
];

export interface EarningsEstimate {
  fixed: number;
  commission: number;
  bonus: number;
  total: number;
}

/** Estimation selon le modèle HARX : fixe par appel argumenté + commission par transaction + bonus si l'objectif est atteint. */
export function estimateEarnings(gig: ExampleGig, argumentedCalls: number, transactions: number, targetReached: boolean): EarningsEstimate {
  const fixed = Math.max(0, argumentedCalls) * gig.commission.perCall;
  const commission = Math.max(0, transactions) * gig.commission.perTransaction;
  const bonus = targetReached ? gig.commission.bonus : 0;
  return { fixed, commission, bonus, total: fixed + commission + bonus };
}
