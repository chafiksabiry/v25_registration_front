import React, { useEffect, useState } from 'react';
import { Globe2, PhoneCall, Target, Bot, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/** Hauteurs (en %) des trois couches de revenu, mois après mois : purement illustratif, aucune valeur chiffrée. */
const MONTHS = [
  { fixed: 22, commission: 6, bonus: 0 },
  { fixed: 26, commission: 12, bonus: 0 },
  { fixed: 28, commission: 20, bonus: 6 },
  { fixed: 30, commission: 26, bonus: 10 },
  { fixed: 32, commission: 34, bonus: 16 },
  { fixed: 34, commission: 42, bonus: 22 },
];

const EVENTS = [
  { key: 'evCall', Icon: PhoneCall, tone: 'from-rose-500 to-pink-500', layer: 'fixed' },
  { key: 'evSale', Icon: Bot, tone: 'from-fuchsia-500 to-purple-500', layer: 'commission' },
  { key: 'evGoal', Icon: Target, tone: 'from-violet-500 to-indigo-500', layer: 'bonus' },
] as const;

/**
 * Illustration animée du modèle de rémunération REPS : un revenu qui se construit en trois couches
 * (fixe par appel argumenté, commission à la transaction, bonus de performance). Illustration sans montants.
 */
export function RepsIncomeVisual() {
  const { t } = useTranslation();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setTick(MONTHS.length + 3);
      return;
    }
    const id = window.setInterval(() => setTick((n) => (n + 1) % (MONTHS.length + 5)), 1100);
    return () => window.clearInterval(id);
  }, []);

  const shown = Math.min(tick, MONTHS.length);
  const evIdx = tick % EVENTS.length;

  return (
    <div className="relative mx-auto w-full max-w-[28rem]" data-testid="reps-income-visual" aria-label={t('taasVisual.illustration', 'Illustration')}>
      <div className="pointer-events-none absolute -inset-10 rounded-full bg-gradient-to-br from-fuchsia-500/30 via-rose-500/20 to-violet-500/25 blur-3xl" aria-hidden="true" />

      <div className="taas-float relative rounded-[1.75rem] border border-white/20 bg-gradient-to-b from-white/[0.14] to-white/[0.05] p-6 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <p className="text-sm font-black tracking-wide text-white">{t('taasVisual.repsTitle', 'Your income')}</p>
          <span className="rounded-full border border-white/25 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white/70">{t('taasVisual.illustration', 'Illustration')}</span>
        </div>

        {/* Histogramme empilé */}
        <div className="mt-5 flex h-48 items-end gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 pb-4 pt-6">
          {MONTHS.map((m, i) => {
            const on = i < shown;
            return (
              <div key={i} className="flex h-full flex-1 flex-col justify-end" aria-hidden="true">
                <div className="flex flex-col-reverse overflow-hidden rounded-lg transition-all duration-700 ease-out" style={{ height: on ? `${m.fixed + m.commission + m.bonus}%` : '4%', opacity: on ? 1 : 0.25 }}>
                  <span className="bg-gradient-to-t from-rose-500 to-pink-500" style={{ flexGrow: m.fixed }} />
                  <span className="bg-gradient-to-t from-fuchsia-500 to-purple-500" style={{ flexGrow: m.commission }} />
                  <span className="bg-gradient-to-t from-violet-500 to-indigo-400" style={{ flexGrow: m.bonus }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex justify-between px-4 text-[10px] font-bold uppercase tracking-wider text-white/45" aria-hidden="true">
          <span>{t('taasVisual.repsMonth', 'Month')} 1</span>
          <span>{MONTHS.length}</span>
        </div>

        {/* Événement qui s'ajoute */}
        <ul className="mt-4 space-y-2">
          {EVENTS.map(({ key, Icon, tone }, i) => {
            const active = shown >= MONTHS.length ? true : i === evIdx;
            return (
              <li key={key} className={`flex items-center gap-3 rounded-xl px-3 py-2 transition-all duration-500 ${active ? 'bg-white/12 opacity-100' : 'bg-white/[0.03] opacity-55'}`}>
                <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${tone} text-white`}><Icon className="h-4 w-4" aria-hidden="true" /></span>
                <span className="text-sm font-bold text-white">{t(`taasVisual.${key}`)}</span>
                <span className={`ml-auto rounded-md px-2 py-0.5 text-xs font-black transition-opacity duration-500 ${active ? 'bg-emerald-400/90 text-slate-900 opacity-100' : 'opacity-0'}`}>+</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="taas-float taas-float--slow absolute -left-4 -top-5 hidden items-center gap-2 rounded-2xl border border-white/20 bg-[#0d0d1c]/80 px-3.5 py-2 shadow-xl backdrop-blur-md sm:flex md:-left-10">
        <Globe2 className="h-5 w-5 text-sky-300" aria-hidden="true" />
        <span className="text-xs font-extrabold text-white">{t('taasVisual.anywhere', 'From anywhere')}</span>
      </div>
      <div className="taas-float absolute -bottom-5 -right-3 hidden items-center gap-2 rounded-2xl border border-white/20 bg-[#0d0d1c]/80 px-3.5 py-2 shadow-xl backdrop-blur-md sm:flex md:-right-8">
        <Clock className="h-5 w-5 text-amber-300" aria-hidden="true" />
        <span className="text-xs font-extrabold text-white">{t('taasVisual.yourHours', 'Your own hours')}</span>
      </div>
    </div>
  );
}
