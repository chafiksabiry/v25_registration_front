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
  // Keep exact cents (e.g. 29.99) — never drop decimals / round to integer.
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(Number(price).toFixed(2)));
}

export function getPlanPriceLabel(plan: PricingPlan): string {
  return formatPrice(plan.price);
}

export function mapApiPlanToPricingPlan(plan: Record<string, unknown>): PricingPlan {
  const priceCents = Number(plan.priceCents);
  const price = Number.isFinite(priceCents)
    ? Number((priceCents / 100).toFixed(2))
    : Number(Number(plan.price).toFixed(2));
  return {
    id: String(plan.id ?? ''),
    name: String(plan.name ?? ''),
    description: String(plan.description ?? ''),
    price,
    currency: 'eur',
    features: Array.isArray(plan.features) ? plan.features.map(String) : [],
    popular: Boolean(plan.popular ?? plan.isPopular),
    ctaLabel: plan.ctaLabel ? String(plan.ctaLabel) : undefined,
  };
}
