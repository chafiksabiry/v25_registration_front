import { formatMoney, normalizeCurrency, type Currency } from '../../lib/currency';

export type PricingPlan = {
  id: string;
  name: string;
  description: string;
  price: number;
  /** Devise réellement affichée : celle de l'API (EUR si le prix Stripe ne propose pas la devise du pays). */
  currency: Currency;
  features: string[];
  popular?: boolean;
  ctaLabel?: string;
};

/** No hardcoded plan defaults — UI loads only from API / Stripe-backed data. */
export const COMPANY_PRICING_PLANS: PricingPlan[] = [];
export const REP_PRICING_PLANS: PricingPlan[] = [];

export function getPlanPriceLabel(plan: PricingPlan): string {
  return formatMoney(plan.price, plan.currency);
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
    currency: normalizeCurrency(plan.currency),
    features: Array.isArray(plan.features) ? plan.features.map(String) : [],
    popular: Boolean(plan.popular ?? plan.isPopular),
    ctaLabel: plan.ctaLabel ? String(plan.ctaLabel) : undefined,
  };
}
