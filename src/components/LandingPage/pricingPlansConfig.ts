export type PricingPlan = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'eur';
  features: string[];
  popular?: boolean;
  ctaLabel?: string;
};

export const COMPANY_PRICING_PLANS: PricingPlan[] = [
  {
    id: 'test-it',
    name: 'TEST IT',
    description: 'Start your campaigns with simplicity and efficiency',
    price: 99,
    currency: 'eur',
    features: [
      'Active GIGs: 3',
      'Active REPs: 5',
      'AI Powered Gig Engine',
      'AI Powered Script Engine',
      'AI Powered Learning Planner',
      'AI Powered GIGS REPS Matching',
      'Scheduler',
      'Qualified REPS on demand',
      'Dashboard with Standard KPIs',
      'Email support with assisted onboarding',
    ],
  },
  {
    id: 'grow-it',
    name: 'GROW IT',
    description: 'Drive multichannel efforts with AI automation',
    price: 249,
    currency: 'eur',
    popular: true,
    features: [
      'Active GIGs: 10',
      'Active REPs: 15',
      'Channels : Outbound Calls Only',
      'All Starter Features',
      'AI Powered Lead Management Engine',
      'AI Powered Knowledge Base Engine',
      'AI Powered Call Monitoring and Audit - scoring, fraud detection',
      'call storage - 3 months',
      'Priority support + chat',
    ],
  },
  {
    id: 'scale-it',
    name: 'SCALE IT',
    description: 'Activate intelligence at scale',
    price: 499,
    currency: 'eur',
    features: [
      'Active GIGs: 25',
      'Active REPs: 50',
      'Channels : Outbound Calls Only',
      'Global Coverage',
      'All Growth Features included',
      'Priority Support - live chat, email',
      'Customization - Dashboard, Analytics, Integrations',
    ],
  },
];

export const REP_PRICING_PLANS: PricingPlan[] = [
  {
    id: 'take-a-chance',
    name: 'TAKE A CHANCE',
    description:
      'Completely free. Prove you can earn. No commitment. If you like it and hit €30, upgrade to unlock more.',
    price: 0,
    currency: 'eur',
    ctaLabel: 'Subscribe',
    features: [
      'Earn up to €30/month',
      'Dashboard: Real-time wallet balance; Basic analytics',
      '3 gigs only',
      'Slot Booking: First-Come, First-Served',
      'Call History: Cannot listen to recordings, see AI scores, or read transcripts',
      'Support by email — 24 hours',
    ],
  },
  {
    id: 'pay-the-bills',
    name: 'PAY THE BILLS',
    description: "Now I'm making real money.",
    price: 9.99,
    currency: 'eur',
    ctaLabel: 'Start trial',
    features: [
      'Earn up to €200/month',
      'Dashboard: Advanced analytics',
      '10 gigs',
      'Slot Booking: Priority on waiting list',
      'Call History: Listen to recordings, see AI scores, and read transcripts',
      'Support by email or chat',
      '7 days free trial',
    ],
  },
  {
    id: 'money-must-be-funny',
    name: 'MONEY MUST BE FUNNY',
    description: 'Bills paid. Fun money time.',
    price: 19.99,
    currency: 'eur',
    popular: true,
    ctaLabel: 'Start trial',
    features: [
      'Earn up to €500/month',
      'Dashboard: Advanced analytics',
      '100 gigs',
      'Slot Booking: Priority',
      'Call History: Listen to recordings, see AI scores, read transcripts',
      'Support by Phone, email or chat',
      '7 days free trial',
    ],
  },
  {
    id: 'rich-man-world',
    name: "IN THE RICH MAN'S WORLD",
    description: "I'm elite. No limits.",
    price: 59.99,
    currency: 'eur',
    ctaLabel: 'Start trial',
    features: [
      'Unlimited Monthly Earning',
      'Priority Access to Premium Gigs',
      'Priority to book slots',
      'All AI-powered features for free',
      'No extra fees for wallet management',
      'Support by Phone, email or chat',
      '7 days free trial',
    ],
  },
];

function formatPrice(price: number): string {
  if (price === 0) return '€0';
  return price % 1 === 0 ? `€${price}` : `€${price.toFixed(2)}`;
}

export function getPlanPriceLabel(plan: PricingPlan): string {
  return formatPrice(plan.price);
}
