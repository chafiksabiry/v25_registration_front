import React from 'react';
import { ArrowRight, Bot, Building2, Clock, Globe, Laptop, PhoneCall, Target, Users2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TAAS_COMPANY } from '../../lib/taasPaths';

interface RepsHeroProps {
  /** Rejoindre HARX (inscription REPS). */
  onJoin: () => void;
}

/** Ouverture de l'espace REPS : photo, promesse et les trois composantes de rémunération HARX en tuiles. */
export function RepsHero({ onJoin }: RepsHeroProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const pay = [
    {
      icon: PhoneCall,
      tone: 'from-harx-500 to-pink-500',
      label: t('taasPages.payFixed', 'Fixed amount per argued call'),
      text: t('forReps.payFloor', 'Paid (floor) for every serious call, even without a transaction.'),
    },
    {
      icon: Bot,
      tone: 'from-harx-alt-500 to-fuchsia-500',
      label: t('taasPages.payCommission', 'Commission per transaction'),
      text: t('forReps.payCommission', 'Paid commission on every transaction confirmed by our AI.'),
    },
    {
      icon: Target,
      tone: 'from-violet-500 to-purple-500',
      label: t('taasPages.payBonus', 'Performance bonus'),
      text: t('forReps.payTarget', 'Paid when you hit your monthly target.'),
    },
  ];

  return (
    <section className="relative overflow-hidden bg-space-dark-default pt-20 text-white" data-testid="reps-hero">
      <img
        src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1920&q=80"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-harx-950/80 via-harx-950/70 to-space-dark-default" />
      <div className="container relative z-10 mx-auto px-4 pb-20 pt-12">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest backdrop-blur">
            {t('choicePage.repTag', 'REPS')}
          </span>
          <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight md:text-6xl">
            <span className="bg-gradient-harx bg-clip-text text-transparent">{t('forReps.heroTitle', 'Earn money. Extra income. Or a full income.')}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg font-semibold text-white/95 md:text-xl">
            {t('forReps.heroSubtitle', 'No boss. No office. No fixed schedule. Just you, your laptop — and your skills.')}
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-base font-medium text-white/80">
            {t('forReps.heroDesc', 'HARX connects you to companies that need you. And pays you for every effort:')}
          </p>
        </div>

        <ul className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-3" data-testid="reps-pay-tiles">
          {pay.map(({ icon: Icon, tone, label, text }) => (
            <li key={label} className="rounded-3xl border border-white/15 bg-white/[0.08] p-6 text-left shadow-xl shadow-black/30 backdrop-blur-md transition-transform duration-300 hover:-translate-y-1">
              <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tone} shadow-lg`}>
                <Icon className="h-6 w-6 text-white" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-extrabold leading-snug">{label}</h3>
              <p className="mt-1.5 text-sm font-medium leading-relaxed text-white/80">{text}</p>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
            className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/25 px-6 text-sm font-bold text-white transition-colors hover:bg-white/10"
          >
            {t('taasPages.seeMissions', 'See example missions')}
          </a>
        </div>
        <p className="mt-6 text-center text-sm font-semibold text-white/60">
          {t('taasPages.areCompany', 'You are a company?')}{' '}
          <a
            href={TAAS_COMPANY}
            data-testid="taas-cross-link"
            onClick={(e) => {
              e.preventDefault();
              navigate(TAAS_COMPANY);
            }}
            className="inline-flex items-center gap-1 font-bold text-harx-300 underline underline-offset-4 hover:text-white"
          >
            <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
            {t('taasPages.goCompany', 'Go to the Company space')}
          </a>
        </p>
      </div>
    </section>
  );
}

/** Quatre atouts du travail avec HARX. */
export function RepsBenefits() {
  const { t } = useTranslation();
  const benefits = [
    { title: t('forReps.benefit1Title', 'Flexible Work'), description: t('forReps.benefit1Desc', 'Choose your hours and work from anywhere in the world.'), icon: Clock },
    { title: t('forReps.benefit2Title', 'Growth Opportunities'), description: t('forReps.benefit2Desc', 'Continuous learning and career advancement possibilities.'), icon: Users2 },
    { title: t('forReps.benefit3Title', 'Global Network'), description: t('forReps.benefit3Desc', 'Connect with clients and colleagues worldwide.'), icon: Globe },
    { title: t('forReps.benefit4Title', 'Advanced Tools'), description: t('forReps.benefit4Desc', 'Use our AI-powered platform to maximize your success.'), icon: Laptop },
  ];
  return (
    <section className="bg-gradient-to-b from-harx-50 to-white px-4 py-16 text-slate-900" data-testid="reps-benefits">
      <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map(({ title, description, icon: Icon }) => (
          <div key={title} className="rounded-2xl bg-white p-6 shadow-lg transition-transform duration-300 hover:-translate-y-1">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-harx">
              <Icon className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <h3 className="mb-2 text-lg font-bold">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
