import React from 'react';
import { ArrowRight, Bot, Clock, Globe, Laptop, PhoneCall, Target, Users2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SpaceSwitch } from '../Taas/SpaceSwitch';
import { RepsIncomeVisual } from '../Taas/RepsIncomeVisual';
import { spotMove } from '../Taas/spot';

interface RepsHeroProps {
  /** Rejoindre HARX (inscription REPS). */
  onJoin: () => void;
}

/** Ouverture de l'espace REPS : promesse à gauche avec les trois composantes de rémunération, illustration animée du revenu à droite. */
export function RepsHero({ onJoin }: RepsHeroProps) {
  const { t } = useTranslation();

  const pay = [
    {
      icon: PhoneCall,
      tone: 'from-rose-500 to-pink-500',
      label: t('taasPages.payFixed', 'Fixed amount per argued call'),
      text: t('forReps.payFloor', 'Paid (floor) for every serious call, even without a transaction.'),
    },
    {
      icon: Bot,
      tone: 'from-fuchsia-500 to-purple-500',
      label: t('taasPages.payCommission', 'Commission per transaction'),
      text: t('forReps.payCommission', 'Paid commission on every transaction confirmed by our AI.'),
    },
    {
      icon: Target,
      tone: 'from-violet-500 to-indigo-500',
      label: t('taasPages.payBonus', 'Performance bonus'),
      text: t('forReps.payTarget', 'Paid when you hit your monthly target.'),
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[#070711] pb-16 pt-28 text-white md:pb-24 md:pt-32" data-testid="reps-hero">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -right-40 -top-20 h-[34rem] w-[34rem] rounded-full bg-fuchsia-600/25 blur-[140px]" />
        <div className="absolute -left-32 top-1/3 h-[30rem] w-[30rem] rounded-full bg-rose-600/25 blur-[140px]" />
        <div className="absolute bottom-0 right-1/3 h-[22rem] w-[22rem] rounded-full bg-violet-500/15 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)', backgroundSize: '56px 56px', maskImage: 'radial-gradient(70% 60% at 50% 40%, #000, transparent)' }} />
      </div>
      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 px-5 md:px-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <SpaceSwitch current="reps" />
          <h1 className="mt-8 text-4xl font-black leading-[1.05] tracking-tight md:text-6xl">
            <span className="taas-shine-text">{t('forReps.heroTitle', 'Earn money. Extra income. Or a full income.')}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg font-semibold leading-relaxed text-white/95 md:text-xl">
            {t('forReps.heroSubtitle', 'No boss. No office. No fixed schedule. Just you, your laptop — and your skills.')}
          </p>
          <p className="mt-3 max-w-xl text-base font-medium text-white/75">
            {t('forReps.heroDesc', 'HARX connects you to companies that need you. And pays you for every effort:')}
          </p>

          <ul className="mt-7 grid max-w-2xl gap-3 sm:grid-cols-3" data-testid="reps-pay-tiles">
            {pay.map(({ icon: Icon, tone, label, text }) => (
              <li key={label} className="taas-spot rounded-2xl border border-white/12 bg-white/[0.05] p-4 text-left backdrop-blur" onMouseMove={spotMove}>
                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tone} shadow-lg`}>
                  <Icon className="h-5 w-5 text-white" aria-hidden="true" />
                </span>
                <h3 className="mt-3 text-sm font-extrabold leading-snug">{label}</h3>
                <p className="mt-1 text-xs font-medium leading-relaxed text-white/70">{text}</p>
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={onJoin} data-testid="taas-reps-cta" className="group inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-harx px-8 text-base font-bold text-white shadow-[0_20px_50px_-15px_rgba(255,77,109,0.9)] transition-transform hover:scale-[1.03]">
              {t('taasWidgets.joinCta', 'Join HARX')}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </button>
            <a
              href="#featured-gigs"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('featured-gigs')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/[0.04] px-6 text-sm font-bold text-white transition-colors hover:bg-white/10"
            >
              {t('taasPages.seeMissions', 'See example missions')}
            </a>
          </div>
        </div>

        <RepsIncomeVisual />
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
    <section className="relative overflow-hidden bg-[#070711] px-4 py-16 text-white" data-testid="reps-benefits">
      <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map(({ title, description, icon: Icon }) => (
          <div key={title} onMouseMove={spotMove} className="taas-spot rounded-3xl border border-white/12 bg-white/[0.05] p-6 shadow-xl shadow-black/30 backdrop-blur transition-transform duration-300 hover:-translate-y-1">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-harx">
              <Icon className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-white">{title}</h3>
            <p className="text-sm text-slate-300">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
