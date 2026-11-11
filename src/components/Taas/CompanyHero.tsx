import React from 'react';
import { spotMove } from './spot';
import { ArrowRight, Globe2, Lock, ShieldCheck, Users2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { isRoleComingSoon } from '../../config/offers';
import { SpaceSwitch } from './SpaceSwitch';
import { ResultFlowVisual } from './ResultFlowVisual';

const bookDemo = () => {
  window.open('https://harxtechnologies.zohobookings.com/#/WebsiteBooking', '_blank');
};

/** Ouverture de la page COMPANY : promesse en grand à gauche, illustration animée du principe « payer le résultat » à droite. */
export function CompanyHero() {
  const { t } = useTranslation();
  const soon = isRoleComingSoon('company');
  const stats = [
    { icon: Users2, value: '60 000+', label: t('taasPages.statPros', 'customer service professionals') },
    { icon: Globe2, value: '70+', label: t('taasPages.statCountries', 'countries covered') },
    { icon: ShieldCheck, value: 'RGPD', label: t('taasPages.statGdpr', 'compliant, encrypted data') },
  ];
  return (
    <section className="relative overflow-hidden bg-[#070711] pb-16 pt-28 text-white md:pb-24 md:pt-32" data-testid="taas-banner-company">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-40 -top-20 h-[34rem] w-[34rem] rounded-full bg-rose-600/25 blur-[140px]" />
        <div className="absolute -right-32 top-1/3 h-[30rem] w-[30rem] rounded-full bg-fuchsia-600/25 blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 h-[22rem] w-[22rem] rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)', backgroundSize: '56px 56px', maskImage: 'radial-gradient(70% 60% at 50% 40%, #000, transparent)' }} />
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 px-5 md:px-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <SpaceSwitch current="company" />
          <h1 className="mt-8 text-5xl font-black leading-[1.02] tracking-tight md:text-7xl">
            <span className="taas-shine-text">{t('taasPages.companyTitle', 'Pay for results')}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg font-medium leading-relaxed text-slate-300 md:text-xl">{t('taasPages.companySub', 'You define the result and its price. You only pay for what you approve.')}</p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={bookDemo} className="group inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-harx px-8 text-base font-bold text-white shadow-[0_20px_50px_-15px_rgba(255,77,109,0.9)] transition-transform hover:scale-[1.03]">
              {t('hero.bookDemo', 'Book a Demo')}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </button>
            <span className="inline-flex h-14 cursor-not-allowed items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/[0.06] px-6 text-sm font-bold text-white/85" aria-disabled={soon || undefined} data-testid="taas-company-cta">
              <Lock className="h-4 w-4" aria-hidden="true" />
              {t('choicePage.companyTitle', 'Post a Gig')} · {t('choicePage.comingSoon', 'Coming soon')}
            </span>
          </div>

          <ul className="mt-12 grid max-w-xl grid-cols-3 gap-3" data-testid="company-stats">
            {stats.map(({ icon: Icon, value, label }) => (
              <li key={label} className="taas-spot rounded-2xl border border-white/12 bg-white/[0.05] px-3 py-4 text-center backdrop-blur" onMouseMove={spotMove}>
                <Icon className="mx-auto h-5 w-5 text-harx-300" aria-hidden="true" />
                <p className="mt-1.5 whitespace-nowrap text-lg font-black sm:text-xl md:text-2xl">{value}</p>
                <p className="mt-0.5 text-[11px] font-semibold leading-snug text-slate-300">{label}</p>
              </li>
            ))}
          </ul>
        </div>

        <ResultFlowVisual />
      </div>
    </section>
  );
}
