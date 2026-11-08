import React, { useEffect, useState } from 'react';
import { BadgeCheck, Bot, CheckCircle2, Sparkles, UserRound, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const STEPS = ['step1', 'step2', 'step3', 'step4', 'step5'] as const;

/**
 * Illustration animée du principe TAAS : un résultat est défini, pris en charge par des professionnels humains ou IA,
 * évalué par l'IA, approuvé, puis seulement alors payé. C'est une illustration (mention visible), pas une donnée réelle.
 */
export function ResultFlowVisual({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setStep(STEPS.length - 1);
      return;
    }
    const id = window.setInterval(() => setStep((s) => (s + 1) % (STEPS.length + 1)), 1900);
    return () => window.clearInterval(id);
  }, []);

  const at = (n: number) => step >= n;

  return (
    <div className="relative mx-auto w-full max-w-[28rem]" data-testid="result-flow" aria-label={t('taasVisual.illustration', 'Illustration')}>
      <div className="pointer-events-none absolute -inset-10 rounded-full bg-gradient-to-br from-rose-500/30 via-fuchsia-500/20 to-amber-400/20 blur-3xl" aria-hidden="true" />

      {/* Carte principale */}
      <div className="taas-float relative rounded-[1.75rem] border border-white/20 bg-gradient-to-b from-white/[0.14] to-white/[0.05] p-6 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <p className="text-sm font-black tracking-wide text-white">{t('taasVisual.gigTitle', 'Your gig')}</p>
          <span className="rounded-full border border-white/25 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white/70">{t('taasVisual.illustration', 'Illustration')}</span>
        </div>

        <div className={`mt-5 rounded-2xl border border-white/15 bg-black/25 p-4 ${compact ? 'hidden' : ''}`}>
          <p className="text-[11px] font-bold uppercase tracking-wider text-white/55">{t('taasVisual.resultLabel', 'Expected result')}</p>
          <p className="mt-1 flex items-center gap-2 text-lg font-extrabold text-white">
            <Sparkles className="h-5 w-5 text-amber-300" aria-hidden="true" />
            {t('taasVisual.resultValue', 'Confirmed appointment')}
          </p>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="font-semibold text-white/65">{t('taasVisual.priceLabel', 'Price you set')}</span>
            <span className="rounded-lg bg-white/10 px-3 py-1 font-black text-white">€ ••</span>
          </div>
        </div>

        {/* Progression */}
        <ol className="mt-5 space-y-2.5">
          {STEPS.map((key, i) => {
            const done = at(i + 1);
            const current = step === i;
            return (
              <li key={key} className={`flex items-center gap-3 rounded-xl px-3 py-2 transition-all duration-500 ${done ? 'bg-white/10' : 'bg-white/[0.03] opacity-60'}`}>
                <span
                  className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-500 ${done ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white' : 'bg-white/10 text-white/50'} ${current ? 'ring-4 ring-emerald-400/30' : ''}`}
                >
                  {done ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : <span className="text-xs font-black">{i + 1}</span>}
                </span>
                <span className={`text-sm font-bold ${done ? 'text-white' : 'text-white/60'}`}>{t(`taasVisual.${key}`)}</span>
                {key === 'step2' ? (
                  <span className="ml-auto flex items-center gap-1.5" aria-hidden="true">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-400/25 text-sky-200"><UserRound className="h-3.5 w-3.5" /></span>
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-violet-400/25 text-violet-200"><Bot className="h-3.5 w-3.5" /></span>
                  </span>
                ) : null}
                {key === 'step4' ? (
                  <span className={`ml-auto inline-flex h-5 w-9 items-center rounded-full p-0.5 transition-colors duration-500 ${at(4) ? 'bg-emerald-400' : 'bg-white/20'}`} aria-hidden="true">
                    <span className={`h-4 w-4 rounded-full bg-white shadow transition-transform duration-500 ${at(4) ? 'translate-x-4' : ''}`} />
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>

        <div className={`mt-4 flex items-center gap-3 rounded-xl p-3 transition-all duration-700 ${at(5) ? 'bg-gradient-to-r from-emerald-500/30 to-teal-500/20 opacity-100' : 'bg-white/[0.03] opacity-40'}`} style={at(5) ? { animation: 'taas-pulse-ring 1.8s ease-out' } : undefined}>
          <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${at(5) ? 'bg-emerald-400 text-slate-900' : 'bg-white/10 text-white/50'}`}><Wallet className="h-5 w-5" aria-hidden="true" /></span>
          <p className="text-sm font-bold text-white">{t('taasVisual.paidNote', 'You only pay on approval')}</p>
        </div>
      </div>

      {/* Puces flottantes */}
      <div className={`taas-float taas-float--slow absolute -left-4 -top-5 hidden items-center gap-2 rounded-2xl border border-white/20 bg-[#0d0d1c]/80 px-3.5 py-2 shadow-xl backdrop-blur-md ${compact ? '' : 'sm:flex md:-left-10'}`}>
        <BadgeCheck className="h-5 w-5 text-sky-300" aria-hidden="true" />
        <span className="text-xs font-extrabold text-white">{t('taasVisual.humanAi', 'Humans or AI')}</span>
      </div>
    </div>
  );
}
