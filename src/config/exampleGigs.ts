/**
 * Missions types présentées sur la page TAAS (onglet REPS) : contenu marketing éditable ici, indépendant des missions réelles.
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
  commission: { perCall?: number; perTransaction?: number; bonus?: number };
}

export const EXAMPLE_GIGS: ExampleGig[] = [
  {
    id: 'health-insurance-sales',
    icon: 'Sales',
    fr: { title: 'Télévendeur en assurance santé', category: 'Vente à distance', description: 'Présentez une offre d’assurance santé à des prospects qualifiés et accompagnez-les jusqu’à la souscription.' },
    en: { title: 'Health insurance telesales', category: 'Telesales', description: 'Present a health insurance offer to qualified prospects and guide them through to subscription.' },
    commission: { perTransaction: 35, bonus: 100 },
  },
  {
    id: 'company-reception',
    icon: 'Reception',
    fr: { title: 'Accueil téléphonique d’entreprise', category: 'Accueil', description: 'Répondez aux appels entrants au nom d’une entreprise et orientez chaque appelant vers le bon interlocuteur.' },
    en: { title: 'Company phone reception', category: 'Reception', description: 'Answer inbound calls on behalf of a company and route each caller to the right person.' },
    commission: { perCall: 1.2, bonus: 50 },
  },
  {
    id: 'ecommerce-support',
    icon: 'Support',
    fr: { title: 'Support client e-commerce', category: 'Service client', description: 'Répondez aux questions sur les commandes, livraisons et retours d’une boutique en ligne.' },
    en: { title: 'E-commerce customer support', category: 'Customer service', description: 'Answer questions about orders, deliveries and returns for an online store.' },
    commission: { perCall: 2, perTransaction: 6 },
  },
  {
    id: 'medical-appointments',
    icon: 'Healthcare',
    fr: { title: 'Confirmation de rendez-vous médicaux', category: 'Santé', description: 'Appelez les patients pour confirmer ou déplacer leur rendez-vous et réduire les absences.' },
    en: { title: 'Medical appointment confirmation', category: 'Healthcare', description: 'Call patients to confirm or reschedule their appointment and reduce no-shows.' },
    commission: { perCall: 1.5, bonus: 80 },
  },
  {
    id: 'property-leads',
    icon: 'RealEstate',
    fr: { title: 'Qualification de contacts immobiliers', category: 'Immobilier', description: 'Évaluez des contacts intéressés par un projet immobilier et identifiez ceux prêts à avancer.' },
    en: { title: 'Property lead qualification', category: 'Real estate', description: 'Assess contacts interested in a property project and identify those ready to move forward.' },
    commission: { perCall: 2, perTransaction: 60 },
  },
  {
    id: 'payment-reminders',
    icon: 'Finance',
    fr: { title: 'Relance de paiements', category: 'Recouvrement', description: 'Rappelez aimablement les clients dont une échéance est en retard et convenez d’un règlement.' },
    en: { title: 'Payment reminders', category: 'Collections', description: 'Politely call customers with an overdue payment and agree on a settlement.' },
    commission: { perTransaction: 25 },
  },
];

/** Commission moyenne par transaction des missions types (0 si aucune n'en prévoit). */
export function exampleAvgTransaction(gigs: ExampleGig[] = EXAMPLE_GIGS): number {
  const tx = gigs.map((g) => g.commission.perTransaction ?? 0).filter((n) => n > 0);
  return tx.length ? tx.reduce((a, b) => a + b, 0) / tx.length : 0;
}
