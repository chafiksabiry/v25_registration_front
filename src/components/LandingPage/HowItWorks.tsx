import React from 'react';
import { ArrowRight, Users, Brain, FilePlus2, Sparkles, Tag, Wallet, ShieldCheck, ScanSearch, Globe2, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';

interface HowItWorksProps {
  onGetStarted: () => void;
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
function StepCard({ number, icon: Icon, tone, title, body }: StepContent) {
  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl" data-testid={`how-step-${number}`}>
      <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${tone}`} />
      <div className="flex items-center justify-between">
        <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tone} text-white shadow-md`}>
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <span className="text-5xl font-black leading-none text-slate-100 transition-colors group-hover:text-slate-200">{number}</span>
      </div>
      <h3 className="mt-4 text-lg font-extrabold leading-snug text-slate-900">{title}</h3>
      <div className="mt-2 text-sm leading-relaxed text-slate-600">{body}</div>
    </div>
  );
}

export function HowItWorks({ onGetStarted }: HowItWorksProps) {
  const { t } = useTranslation();

  const bookDemo = () => {
    window.open('https://harxtechnologies.zohobookings.com/#/WebsiteBooking', '_blank');
  };

  const chip = 'shrink-0 rounded-full bg-harx-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-harx-600';

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
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {t('howItWorks.title', 'How HARX Works')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('howItWorks.subtitle', 'No infrastructure. No hiring. No upfront cost. No complexity. Just a certified team, a live AI scoring every interaction, and a simple rule : you pay only when it works.')}
          </p>
        </div>

        {/* Platform Preview */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5">
            <img
              src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=1920&q=80"
              alt="AI-powered customer service platform"
              className="w-full h-[440px] object-cover"
            />

            {/* Floating Stats Cards */}
            <div className="absolute top-8 right-8 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <Brain className="h-6 w-6 text-harx-500" />
                <div>
                  <div className="font-semibold">{t('howItWorks.aiResponseTime', 'AI Response Time')}</div>
                  <div className="text-2xl font-bold text-harx-500">0.3s</div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-harx-500" />
                <div>
                  <div className="font-semibold">{t('howItWorks.activeAgents', 'Active Agents')}</div>
                  <div className="text-2xl font-bold text-harx-500">60,000+</div>
                </div>
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

          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold mb-6 whitespace-pre-line">
              {t('howItWorks.ctaTitle', 'You have leads. We have agents. You pay per result.\nHARX the Transaction as a Service™ Platform powered by AI')}
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                variant="gradient"
                onClick={onGetStarted}
                className="group"
              >
                {t('howItWorks.getStarted', 'Get Started')}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={bookDemo}
                className="group"
              >
                {t('howItWorks.bookDemo', 'Book a Demo')}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
