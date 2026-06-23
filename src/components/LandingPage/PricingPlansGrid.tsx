import React from 'react';
import { Check } from 'lucide-react';
import { getPlanPriceLabel, type PricingPlan } from './pricingPlansConfig';

type PricingPlansGridProps = {
  plans: PricingPlan[];
  columns?: 3 | 4;
  showCta?: boolean;
  onCtaClick?: () => void;
};

function FeatureCheck() {
  return (
    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-300/70">
      <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
    </span>
  );
}

export function PricingPlansGrid({
  plans,
  columns = 3,
  showCta = false,
  onCtaClick,
}: PricingPlansGridProps) {
  const gridClass =
    columns === 4
      ? 'min-w-[72rem] grid-cols-4 xl:min-w-0 xl:w-full'
      : 'min-w-[56rem] grid-cols-3 md:min-w-0 md:w-full';

  const descriptionMinHeight = columns === 4 ? 'min-h-[5.25rem]' : 'min-h-[2.75rem]';

  return (
    <div className="w-full overflow-x-auto pb-1">
      <div className={`mx-auto grid items-stretch gap-0 ${gridClass}`}>
        {plans.map((plan) => (
          <article
            key={plan.id}
            className={`flex h-full flex-col px-3 py-2 sm:px-4 ${
              plan.popular ? 'rounded-2xl bg-[#f0f1f3] py-4' : ''
            }`}
          >
            {plan.popular && (
              <p className="mb-4 text-center text-xs font-medium text-slate-500">Most popular</p>
            )}

            <div className={`flex h-full flex-col ${plan.popular ? 'px-2' : ''}`}>
              <header className="mb-5">
                <h3 className="text-[15px] font-bold uppercase tracking-[0.02em] text-slate-900">
                  {plan.name}
                </h3>
                <p
                  className={`mt-2 text-sm leading-5 text-slate-500 ${descriptionMinHeight}`}
                >
                  {plan.description}
                </p>
              </header>

              <div className="mb-5 flex items-end gap-1">
                <span className="text-[2.5rem] font-bold leading-none tracking-tight text-slate-900">
                  {getPlanPriceLabel(plan)}
                </span>
                <span className="pb-1 text-sm text-slate-500">per month</span>
              </div>

              {showCta && onCtaClick ? (
                <button
                  type="button"
                  onClick={onCtaClick}
                  className="mb-8 w-full rounded-full bg-[#e56a2f] px-4 py-3 text-[15px] font-medium text-white transition-colors hover:bg-[#d45f28]"
                >
                  {plan.ctaLabel ?? 'Start trial'}
                </button>
              ) : (
                <div className="mb-6" aria-hidden="true" />
              )}

              <div className="mt-auto">
                <p className="mb-3 text-sm text-slate-700">This includes:</p>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm leading-5 text-slate-600">
                      <FeatureCheck />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
