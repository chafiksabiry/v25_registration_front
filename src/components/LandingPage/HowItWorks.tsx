import React from 'react';
import { Check, Users, FilePlus2, Sparkles, Tag, Wallet, ShieldCheck, ScanSearch, Globe2, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface HowItWorksProps {
  onGetStarted?: () => void;
}

interface StepContent {
  number: number;
  icon: LucideIcon;
  /** Dégradé de la pastille (classes complètes pour Tailwind). */
  tone: string;
  title: string;
  body: React.ReactNode;
}

/** Carte d'étape compacte : pastille numérotée en dégradé, icône, titre, texte. */
import { spotMove } from '../Taas/spot';

function StepCard({ number, icon: Icon, tone, title, body }: StepContent) {
  return (
    <div onMouseMove={spotMove} className="taas-spot group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/12 bg-white/[0.05] p-6 shadow-xl shadow-black/30 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-white/25" data-testid={`how-step-${number}`}>
      <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${tone}`} />
      <div className="flex items-center justify-between">
        <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tone} text-white shadow-md`}>
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <span className="text-5xl font-black leading-none text-white/10 transition-colors group-hover:text-white/20">{number}</span>
      </div>
      <h3 className="mt-4 text-lg font-extrabold leading-snug text-white">{title}</h3>
      <div className="mt-2 text-sm leading-relaxed text-slate-300">{body}</div>
    </div>
  );
}

export function HowItWorks(_props: HowItWorksProps) {
  const { t } = useTranslation();


  const chip = 'shrink-0 rounded-full bg-harx-500/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-harx-200';

  const steps: StepContent[] = [
    {
      number: 1,
      icon: FilePlus2,
      tone: 'from-harx-500 to-pink-500',
      title: t('howItWorks.step1Title', 'Post your gig'),
      body: <p>{t('howItWorks.step1Desc', 'Define your campaign, your leads, your script, and what a transaction means for you. Our AI generates everything else.')}</p>,
    },
    {
      number: 2,
      icon: Sparkles,
      tone: 'from-violet-500 to-fuchsia-500',
      title: t('howItWorks.step2Title', 'Get matched instantly'),
      body: <p>{t('howItWorks.step2Desc', 'Harx AI matches your gig to the right certified agents from our global network. Language, industry, activity — every dimension scored and verified.')}</p>,
    },
    {
      number: 3,
      icon: Tag,
      tone: 'from-amber-500 to-orange-500',
      title: t('howItWorks.step3Title', 'Name your price'),
      body: <p>{t('howItWorks.step3Desc', 'Set your own compensation levels. You set the amounts, guided by AI benchmarks. harx takes a portion (%) only when your rep earns a transaction.')}</p>,
    },
    {
      number: 4,
      icon: Wallet,
      tone: 'from-emerald-500 to-teal-500',
      title: t('howItWorks.step4Title', "You only pay what it's worth."),
      body: (
        <>
          <p className="mb-3">{t('howItWorks.step4Desc', 'Floor for effort. Commission for results. Bonus for excellence.')}</p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2"><span className={chip}>{t('howItWorks.floor', 'Floor')}</span><span className="text-xs">{t('howItWorks.floorDesc', 'Pay for a serious, argued interaction')}</span></li>
            <li className="flex items-start gap-2"><span className={chip}>{t('howItWorks.commission', 'Commission')}</span><span className="text-xs">{t('howItWorks.commissionDesc', 'Pay when a transaction is confirmed')}</span></li>
            <li className="flex items-start gap-2"><span className={chip}>{t('howItWorks.bonus', 'Bonus')}</span><span className="text-xs">{t('howItWorks.bonusDesc', 'Pay when your target is reached')}</span></li>
          </ul>
        </>
      ),
    },
    {
      number: 5,
      icon: ShieldCheck,
      tone: 'from-sky-500 to-indigo-500',
      title: t('howItWorks.step5Title', 'Your budget is a contract, not an estimate'),
      body: (
        <ul className="space-y-1.5 text-[13px]">
          <li>{t('howItWorks.step5Desc2', 'You decide how much a gig costs — down to the cent.')}</li>
          <li>{t('howItWorks.step5Desc3', 'You define the price of effort; You define the price of performance; You only pay when it happens.')}</li>
          <li>{t('howItWorks.step5Desc4', "Reps take the lion's share; Harx takes a portion; AI verifies everything.")}</li>
          <li>{t('howItWorks.step5Desc5', 'Beyond performance, three simple costs : Your plan. Your numbers. Your minutes.')}</li>
        </ul>
      ),
    },
    {
      number: 6,
      icon: ScanSearch,
      tone: 'from-rose-500 to-red-500',
      title: t('howItWorks.step6Title', 'AI scoring on every call'),
      body: <p>{t('howItWorks.step6Desc', 'Transcribed, analyzed and scored in seconds by AI : Fraud detected, Sentiment measured, Transaction confirmed.')}</p>,
    },
    {
      number: 7,
      icon: Globe2,
      tone: 'from-harx-alt-500 to-purple-500',
      title: t('howItWorks.step7Title', 'Scale globally — 60,000+ certified agents across 70+ countries'),
      body: <p>{t('howItWorks.step7Desc', 'Harx works with human agents today, AI agents tomorrow, and any mix in between.')}</p>,
    },
  ];

  return (
    <div className="pt-16 pb-12">
      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Ouverture : promesse à gauche, photo encadrée et cartes de verre à droite */}
        <div className="mx-auto mb-20 grid max-w-6xl items-center gap-10 lg:grid-cols-[1fr_1.1fr]" data-testid="how-intro">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-4 py-1.5 text-xs font-black uppercase tracking-widest text-white">
              <Sparkles className="h-4 w-4 text-harx-300" aria-hidden="true" />
              {t('howItWorks.kicker', 'How it works')}
            </span>
            <h1 className="mt-5 text-4xl font-black leading-tight text-white md:text-5xl">{t('howItWorks.title', 'How HARX Works')}</h1>
            <ul className="mt-6 grid grid-cols-2 gap-3" data-testid="how-promises">
              {[
                t('howItWorks.noInfra', 'No infrastructure'),
                t('howItWorks.noHiring', 'No hiring'),
                t('howItWorks.noUpfront', 'No upfront cost'),
                t('howItWorks.noComplexity', 'No complexity'),
              ].map((label) => (
                <li key={label} className="flex items-center gap-2.5 rounded-2xl border border-white/12 bg-white/[0.05] px-4 py-3 text-sm font-bold text-white backdrop-blur">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-harx" aria-hidden="true"><Check strokeWidth={4} className="h-3 w-3 text-white" /></span>
                  {label}
                </li>
              ))}
            </ul>
            <p className="mt-6 rounded-2xl border border-harx-400/30 bg-gradient-to-r from-harx-500/20 to-harx-alt-500/10 p-5 text-lg font-bold leading-snug text-white">
              {t('howItWorks.payRule', 'A certified team, a live AI scoring every interaction, and a simple rule: you pay only when it works.')}
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-harx-500/60 via-harx-alt-500/40 to-violet-500/50 opacity-70 blur-xl" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-[1.75rem] ring-1 ring-white/25 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=1400&q=80"
                alt="AI-powered customer service platform"
                className="h-[420px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070711]/70 via-transparent to-transparent" aria-hidden="true" />
              <div className="absolute inset-x-4 bottom-4 grid grid-cols-3 gap-3" data-testid="how-photo-stats">
                {[
                  { icon: Users, value: '60 000+', label: t('howItWorks.statPros', 'professionals') },
                  { icon: Globe2, value: '70+', label: t('howItWorks.statCountries', 'countries') },
                  { icon: ScanSearch, value: '100 %', label: t('howItWorks.statScored', 'calls scored by AI') },
                ].map(({ icon: Icon, value, label }) => (
                  <div key={label} className="rounded-2xl border border-white/20 bg-black/35 p-3 text-center backdrop-blur-md">
                    <Icon className="mx-auto h-5 w-5 text-harx-300" aria-hidden="true" />
                    <p className="mt-1 text-xl font-black text-white">{value}</p>
                    <p className="text-[11px] font-semibold leading-tight text-white/75">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* 7 étapes : 4 cartes puis 3, sans frise */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-12" data-testid="how-steps">
            {steps.map((step) => (
              <div key={step.number} className={step.number <= 4 ? 'lg:col-span-3' : 'lg:col-span-4'}>
                <StepCard {...step} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
