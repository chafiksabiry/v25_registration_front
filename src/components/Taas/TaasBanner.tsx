import React from 'react';
import { ArrowRight, Building2, Headphones, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { isRoleComingSoon } from '../../config/offers';
import { TAAS_COMPANY, TAAS_REPS } from '../../lib/taasPaths';

interface TaasBannerProps {
  kind: 'company' | 'reps';
  /** Inscription professionnelle (REPS). */
  onJoin?: () => void;
}

const bookDemo = () => {
  window.open('https://harxtechnologies.zohobookings.com/#/WebsiteBooking', '_blank');
};

/** Ouverture de chaque espace : le message de la page, l'action principale, et le lien vers l'autre espace. */
export function TaasBanner({ kind, onJoin }: TaasBannerProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const company = kind === 'company';
  const soon = company && isRoleComingSoon('company');
  const Icon = company ? Building2 : Headphones;
  const other = company ? TAAS_REPS : TAAS_COMPANY;

  return (
    <section className="relative overflow-hidden bg-space-dark-default pb-16 pt-32 text-white" data-testid={`taas-banner-${kind}`}>
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className={`absolute -left-24 top-0 h-96 w-96 rounded-full blur-[120px] ${company ? 'bg-harx-500/20' : 'bg-harx-alt-500/20'}`} />
        <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px]" />
      </div>
      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-4 py-1.5 text-xs font-black uppercase tracking-widest">
            <Icon className="h-4 w-4 text-harx-400" aria-hidden="true" />
            {company ? t('choicePage.companyTag', 'COMPANY') : t('choicePage.repTag', 'REPS')}
          </span>
          <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight md:text-6xl">
            <span className="bg-gradient-harx bg-clip-text text-transparent">{company ? t('taasPages.companyTitle', 'Pay for results') : t('taasPages.repsTitle', 'Your expertise, paid for results')}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg font-medium text-slate-300">
            {company ? t('taasPages.companySub', 'You define the result and its price. You only pay for what you approve.') : t('taasPages.repsSub', 'Choose your missions, work from anywhere, and get paid for every result.')}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {company ? (
              <>
                <span
                  className="inline-flex h-12 cursor-not-allowed items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 text-sm font-bold text-slate-200"
                  aria-disabled={soon || undefined}
                  data-testid="taas-company-cta"
                >
                  <Lock className="h-4 w-4" aria-hidden="true" />
                  {t('choicePage.companyTitle', 'Post a Gig')} · {t('choicePage.comingSoon', 'Coming soon')}
                </span>
                <button type="button" onClick={bookDemo} className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/20 px-6 text-sm font-bold text-white transition-colors hover:bg-white/10">
                  {t('hero.bookDemo', 'Book a Demo')}
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={onJoin} data-testid="taas-reps-cta" className="inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-harx px-7 text-sm font-bold text-white shadow-lg shadow-harx-500/30 transition-transform hover:scale-[1.03]">
                  {t('taasWidgets.joinCta', 'Join HARX')}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
                <a
                  href="#featured-gigs"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('featured-gigs')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/20 px-6 text-sm font-bold text-white transition-colors hover:bg-white/10"
                >
                  {t('taasPages.seeMissions', 'See example missions')}
                </a>
              </>
            )}
          </div>
          <p className="mt-6 text-sm font-semibold text-slate-400">
            {company ? t('taasPages.areRep', 'You are a professional?') : t('taasPages.areCompany', 'You are a company?')}{' '}
            <a
              href={other}
              data-testid="taas-cross-link"
              onClick={(e) => {
                e.preventDefault();
                navigate(other);
              }}
              className="font-bold text-harx-300 underline underline-offset-4 hover:text-white"
            >
              {company ? t('taasPages.goReps', 'Go to the REPS space') : t('taasPages.goCompany', 'Go to the Company space')}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
