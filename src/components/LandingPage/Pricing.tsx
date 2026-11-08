import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Headphones, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { publicPlansApi } from '../../lib/api';
import { Button } from './Button';
import { PricingPlansGrid } from './PricingPlansGrid';
import {
  mapApiPlanToPricingPlan,
  type PricingPlan,
} from './pricingPlansConfig';

interface PricingProps {
  onGetStarted: () => void;
}

type PricingAudience = 'company' | 'rep';

export function Pricing({ onGetStarted }: PricingProps) {
  const navigate = useNavigate();
  const [audience, setAudience] = useState<PricingAudience>('company');
  const [companyPlans, setCompanyPlans] = useState<PricingPlan[]>([]);
  const [repPlans, setRepPlans] = useState<PricingPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    setPlansLoading(true);
    Promise.all([publicPlansApi.companyPlans(), publicPlansApi.repPlans()])
      .then(([companyResponse, repResponse]) => {
        const company =
          companyResponse?.data?.plans ??
          companyResponse?.data?.data?.plans ??
          companyResponse?.plans;
        const rep =
          repResponse?.data?.plans ??
          repResponse?.data?.data?.plans ??
          repResponse?.plans;
        if (Array.isArray(company) && company.length) {
          setCompanyPlans(company.map(mapApiPlanToPricingPlan));
        } else {
          setCompanyPlans([]);
        }
        if (Array.isArray(rep) && rep.length) {
          setRepPlans(rep.map(mapApiPlanToPricingPlan));
        } else {
          setRepPlans([]);
        }
      })
      .catch(() => {
        setCompanyPlans([]);
        setRepPlans([]);
      })
      .finally(() => setPlansLoading(false));
  }, []);

  const handleRepRegister = useCallback(() => {
    localStorage.setItem('pendingUserType', 'rep');
    navigate('/auth/register-rep', { state: { returnTo: '/taas/company', scrollTo: 'pricing' } });
  }, [navigate]);

  const bookDemo = () => {
    window.open('https://harxtechnologies.zohobookings.com/#/WebsiteBooking', '_blank');
  };

  return (
    <div className="mx-auto max-w-[90rem]" data-testid="pricing-card">
      <div className="relative">
        <div className="mx-auto mb-6 max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-white">
            <Sparkles className="h-4 w-4 text-harx-300" aria-hidden="true" />
            {t('pricing.limitedTime', 'Limited Time Offer')}
          </span>
          <h2 className="mt-5 text-4xl font-black tracking-tight text-white md:text-5xl">{t('pricing.title', 'Subscription Plans')}</h2>
          <p className="mt-3 text-lg font-medium text-white/80">{t('pricing.discount', 'Get 50% off company plans when you subscribe today!')}</p>
          <p className="mt-1 text-xs font-semibold text-white/50">{t('pricing.validity', '*Offer valid for the first 3 months')}</p>

          <div className="mt-7 flex justify-center">
            <div className="pricing-audience-toggle" role="tablist" aria-label="Choose your profile">
              <div className={`pricing-audience-toggle-slider ${audience === 'rep' ? 'pricing-audience-toggle-slider--rep' : ''}`} aria-hidden="true" />
              <button type="button" role="tab" aria-selected={audience === 'company'} onClick={() => setAudience('company')} className={`pricing-audience-btn ${audience === 'company' ? 'pricing-audience-btn--active' : ''}`}>
                <Building2 className="pricing-audience-icon h-3.5 w-3.5 md:h-4 md:w-4" />
                {t('pricing.companyBtn', 'Company · Post a Gig')}
              </button>
              <button type="button" role="tab" aria-selected={audience === 'rep'} onClick={() => setAudience('rep')} className={`pricing-audience-btn ${audience === 'rep' ? 'pricing-audience-btn--active' : ''}`}>
                <Headphones className="pricing-audience-icon h-3.5 w-3.5 md:h-4 md:w-4" />
                {t('pricing.repBtn', 'Rep · Find Gigs')}
              </button>
            </div>
          </div>

          <p key={audience} className="pricing-audience-hint mt-4 text-sm text-white/65">
            {audience === 'company' ? (
              <>
                <span className="font-semibold text-white">{t('pricing.companyHintTitle', 'Are you a company?')}</span>{' '}
                {t('pricing.companyHintDesc', 'Post gigs, recruit REPs, and scale.')}
                {' · '}
                <button type="button" onClick={() => setAudience('rep')} className="font-semibold text-harx-300 underline-offset-2 hover:underline">
                  {t('pricing.repHintTitle', 'Want to become a Rep?')}
                </button>
              </>
            ) : (
              <>
                <span className="font-semibold text-white">{t('pricing.repHintTitle', 'Want to become a Rep?')}</span>{' '}
                {t('pricing.repHintDesc', 'Find gigs, work remotely, and grow your earnings.')}
                {' · '}
                <button type="button" onClick={() => setAudience('company')} className="font-semibold text-harx-300 underline-offset-2 hover:underline">
                  {t('pricing.companyHintTitle', 'Are you a company?')}
                </button>
              </>
            )}
          </p>
        </div>

        <div className="mx-auto mb-10 w-full px-1 sm:px-0">
          {plansLoading ? (
            <p className="py-10 text-center text-sm font-medium text-white/60">{t('pricing.loading', 'Loading plans…')}</p>
          ) : audience === 'company' ? (
            <div key="company-pricing" className="pricing-panel">
              {companyPlans.length === 0 ? (
                <p className="py-10 text-center text-sm font-medium text-white/60">{t('pricing.empty', 'No plans available yet.')}</p>
              ) : (
                // AUTH-14 : l'inscription entreprise est « Bientôt disponible » sur toute la plateforme — pas de bouton d'achat.
                <PricingPlansGrid plans={companyPlans} columns={3} comingSoon promoLabel={t('pricing.promoPill', '−50% for 3 months')} />
              )}
            </div>
          ) : (
            <div key="rep-pricing" className="pricing-panel">
              {repPlans.length === 0 ? (
                <p className="py-10 text-center text-sm font-medium text-white/60">{t('pricing.empty', 'No plans available yet.')}</p>
              ) : (
                <PricingPlansGrid plans={repPlans} columns={4} showCta onCtaClick={handleRepRegister} />
              )}
            </div>
          )}
        </div>

        <div className="pb-2 text-center">
          <h3 className="mb-5 text-xl font-bold text-white md:text-2xl">{t('pricing.ready', 'Ready to Transform Your Operations?')}</h3>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Button variant="gradient" size="xl" onClick={onGetStarted} className="group min-w-[220px] shadow-lg md:min-w-[240px]">
              <span className="flex items-center justify-center">
                {t('pricing.getStarted', 'Get Started')}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
            <button type="button" onClick={bookDemo} className="inline-flex h-14 min-w-[220px] items-center justify-center gap-2 rounded-xl border border-white/30 px-6 text-base font-bold text-white transition-colors hover:bg-white/10 md:min-w-[240px]">
              {t('pricing.bookDemo', 'Book a Demo')}
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
