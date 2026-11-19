import React from 'react';
import { Check, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getPlanPriceLabel, type PricingPlan } from './pricingPlansConfig';

type PricingPlansGridProps = {
  plans: PricingPlan[];
  columns?: 3 | 4;
  showCta?: boolean;
  onCtaClick?: () => void;
  /** Pastille de promotion affichée sous le prix (ex. « −50 % pendant 3 mois »). */
  promoLabel?: string;
  /** Offre pas encore ouverte : remplace le bouton par « Bientôt disponible ». */
  comingSoon?: boolean;
};

/** Cartes de forfaits sur fond sombre : forfait recommandé en dégradé et surélevé, prix en grand, liste des inclus. */
export function PricingPlansGrid({ plans, columns = 3, showCta = false, onCtaClick, promoLabel, comingSoon = false }: PricingPlansGridProps) {
  const { t } = useTranslation();
  const cols = columns === 4 ? 'lg:grid-cols-4 md:grid-cols-2' : 'md:grid-cols-3';

  return (
    <div className={`grid items-stretch gap-6 pt-4 ${cols}`} data-testid="pricing-plans">
      {plans.map((plan) => (
        <article
          key={plan.id}
          data-testid={`plan-${plan.id}`}
          className={`relative flex flex-col rounded-3xl p-7 backdrop-blur transition-transform duration-300 hover:-translate-y-1 ${
            plan.popular
              ? 'border border-harx-400/60 bg-gradient-to-b from-harx-500/25 via-harx-600/15 to-harx-alt-500/15 shadow-2xl shadow-harx-500/30 ring-1 ring-harx-300/40 md:-translate-y-3'
              : 'border border-white/12 bg-white/[0.05] shadow-xl shadow-black/30'
          }`}
        >
          {plan.popular ? (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-harx px-4 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-lg shadow-harx-500/40">
              {t('pricing.mostPopular', 'Most popular')}
            </span>
          ) : null}

          <header>
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-harx-300">{plan.name}</h3>
            <p className="mt-2 min-h-[3rem] text-sm font-medium leading-snug text-white/70">{plan.description}</p>
          </header>

          <div className="mt-5">
            <p className="flex items-end gap-2">
              <span className="text-5xl font-black leading-none tracking-tight text-white">{getPlanPriceLabel(plan)}</span>
              <span className="pb-1 text-sm font-semibold text-white/60">{t('pricing.perMonth', 'per month')}</span>
            </p>
            <div className="mt-3 min-h-[1.75rem]">
              {promoLabel ? (
                <span className="inline-flex rounded-full bg-harx-500/25 px-3 py-1 text-xs font-black text-harx-200 ring-1 ring-harx-300/40" data-testid="plan-promo">{promoLabel}</span>
              ) : null}
            </div>
          </div>

          {showCta && onCtaClick ? (
            <button type="button" onClick={onCtaClick} className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-xl bg-gradient-harx px-4 text-sm font-bold text-white shadow-lg shadow-harx-500/30 transition-transform hover:scale-[1.02]">
              {plan.ctaLabel ? t(`pricing.${plan.ctaLabel}`, plan.ctaLabel) : t('pricing.startTrial', 'Start trial')}
            </button>
          ) : comingSoon ? (
            <span className="mt-4 inline-flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-bold text-white/80" aria-disabled="true" data-testid="plan-coming-soon">
              <Lock className="h-4 w-4" aria-hidden="true" />
              {t('choicePage.comingSoon', 'Coming soon')}
            </span>
          ) : null}

          <div className="mt-6 flex-1 border-t border-white/10 pt-5">
            <p className="text-xs font-black uppercase tracking-wider text-white/50">{t('pricing.thisIncludes', 'This includes:')}</p>
            <ul className="mt-3 space-y-2.5">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm font-medium leading-snug text-white/90">
                  <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gradient-harx" aria-hidden="true">
                    <Check strokeWidth={4} className="h-2.5 w-2.5 text-white" />
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>
      ))}
    </div>
  );
}
