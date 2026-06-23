import React from 'react';
import { Check } from 'lucide-react';
import { getPlanPriceLabel, type PricingPlan } from './pricingPlansConfig';

type PricingPlansGridProps = {
  plans: PricingPlan[];
  columns?: 3 | 4;
  showCta?: boolean;
  onCtaClick?: () => void;
};

export function PricingPlansGrid({
  plans,
  columns = 3,
  showCta = false,
  onCtaClick,
}: PricingPlansGridProps) {
  const gridClass =
    columns === 4
      ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'
      : 'grid-cols-1 md:grid-cols-3';

  return (
    <div className="w-full overflow-x-auto pb-1">
      <div className={`mx-auto grid min-w-0 gap-4 ${gridClass} lg:gap-5`}>
        {plans.map((plan) => (
          <article
            key={plan.id}
            className={`flex min-w-[15.5rem] flex-col rounded-xl border bg-white p-6 shadow-sm ${
              plan.popular
                ? 'border-slate-300 bg-slate-50/80 shadow-md ring-1 ring-slate-200'
                : 'border-slate-200'
            }`}
          >
            {plan.popular && (
              <p className="mb-3 text-center text-xs font-medium text-slate-500">Most popular</p>
            )}

            <header className="mb-4">
              <h3 className="text-lg font-bold tracking-wide text-slate-900">{plan.name}</h3>
              <p className="mt-2 min-h-[2.75rem] text-sm leading-snug text-slate-500">
                {plan.description}
              </p>
            </header>

            <div className="mb-5 flex items-end gap-1.5">
              <span className="text-4xl font-bold tracking-tight text-slate-900">
                {getPlanPriceLabel(plan)}
              </span>
              <span className="pb-1 text-sm text-slate-500">per month</span>
            </div>

            {showCta && onCtaClick && (
              <button
                type="button"
                onClick={onCtaClick}
                className="mb-6 w-full rounded-md bg-[#ff5722] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#f4511e]"
              >
                {plan.ctaLabel ?? 'Start trial'}
              </button>
            )}

            <div className={showCta ? 'mt-auto' : ''}>
              <p className="mb-3 text-sm font-medium text-slate-700">This includes:</p>
              <ul className="space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" strokeWidth={2.5} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
