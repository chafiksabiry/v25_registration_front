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
    <span className="pricing-plan-check" aria-hidden="true">
      <Check strokeWidth={3} />
    </span>
  );
}

export function PricingPlansGrid({
  plans,
  columns = 3,
  showCta = false,
  onCtaClick,
}: PricingPlansGridProps) {
  const gridClass = columns === 4 ? 'pricing-plans-grid--4' : 'pricing-plans-grid--3';
  const descClass = columns === 4 ? 'pricing-plan-desc--rep' : 'pricing-plan-desc--company';

  return (
    <div className="pricing-plans-scroll">
      <div className={`pricing-plans-grid ${gridClass}`}>
        {plans.map((plan) => (
          <article
            key={plan.id}
            className={`pricing-plan-card ${plan.popular ? 'pricing-plan-card--popular' : ''}`}
          >
            {plan.popular && <p className="pricing-plan-badge">Most popular</p>}

            <header>
              <h3 className="pricing-plan-title">{plan.name}</h3>
              <p className={`pricing-plan-desc ${descClass}`}>{plan.description}</p>
            </header>

            <div className="pricing-plan-price-row">
              <span className="pricing-plan-price">{getPlanPriceLabel(plan)}</span>
              <span className="pricing-plan-interval">per month</span>
            </div>

            {showCta && onCtaClick ? (
              <button type="button" onClick={onCtaClick} className="pricing-plan-cta">
                {plan.ctaLabel ?? 'Start trial'}
              </button>
            ) : (
              <div className="pricing-plan-cta-spacer" aria-hidden="true" />
            )}

            <div>
              <p className="pricing-plan-features-title">This includes:</p>
              <ul className="pricing-plan-features">
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <FeatureCheck />
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
