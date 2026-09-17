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

/** No hardcoded plan defaults — UI loads only from API / Stripe-backed data. */
export const COMPANY_PRICING_PLANS: PricingPlan[] = [];
export const REP_PRICING_PLANS: PricingPlan[] = [];

function formatPrice(price: number): string {
  if (!Number.isFinite(price)) return '—';
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export function getPlanPriceLabel(plan: PricingPlan): string {
  return formatPrice(plan.price);
}

export function mapApiPlanToPricingPlan(plan: Record<string, unknown>): PricingPlan {
  return {
    id: String(plan.id ?? ''),
    name: String(plan.name ?? ''),
    description: String(plan.description ?? ''),
    price: Number(plan.price),
    currency: 'eur',
    features: Array.isArray(plan.features) ? plan.features.map(String) : [],
    popular: Boolean(plan.popular ?? plan.isPopular),
    ctaLabel: plan.ctaLabel ? String(plan.ctaLabel) : undefined,
  };
}
