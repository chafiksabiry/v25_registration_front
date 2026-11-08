import React, { useState } from 'react';
import { ArrowRight, Calculator, Rocket, UserPlus, Wallet, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EXAMPLE_GIGS, estimateEarnings } from '../../config/exampleGigs';

const REP_STEPS: Array<{ icon: LucideIcon; title: string; text: string }> = [
  { icon: UserPlus, title: 'taasWidgets.repStep1Title', text: 'taasWidgets.repStep1Text' },
  { icon: Rocket, title: 'taasWidgets.repStep2Title', text: 'taasWidgets.repStep2Text' },
  { icon: Wallet, title: 'taasWidgets.repStep3Title', text: 'taasWidgets.repStep3Text' },
];

function RepsSteps() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-5xl text-center">
      <h2 className="text-3xl font-black text-white md:text-4xl">{t('taasWidgets.repStepsTitle', 'Start in three steps')}</h2>
      <ol className="mt-10 grid gap-6 md:grid-cols-3" data-testid="reps-steps">
        {REP_STEPS.map(({ icon: Icon, title, text }, i) => (
          <li key={title} className="relative rounded-3xl border border-white/12 bg-white/[0.05] p-7 text-left shadow-xl shadow-black/30 backdrop-blur">
            <span className="absolute -top-4 left-7 inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-harx text-base font-black text-white shadow-md">{i + 1}</span>
            <span className="mt-2 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-harx-500/20 text-harx-300"><Icon className="h-6 w-6" aria-hidden="true" /></span>
            <h3 className="mt-4 text-xl font-bold text-white">{t(title)}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{t(text)}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Estimation de gains selon le modèle HARX : fixe par appel argumenté, commission par transaction, bonus de performance. */
function EarningsSimulator() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.toLowerCase().startsWith('en') ? 'en' : 'fr';
  const [gigId, setGigId] = useState(EXAMPLE_GIGS[0].id);
  const [calls, setCalls] = useState(200);
  const [tx, setTx] = useState(20);
  const [target, setTarget] = useState(false);
  const gig = EXAMPLE_GIGS.find((g) => g.id === gigId) ?? EXAMPLE_GIGS[0];
  const est = estimateEarnings(gig, calls, tx, target);
  const fmt = (n: number) => new Intl.NumberFormat(lang === 'en' ? 'en-GB' : 'fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2, minimumFractionDigits: 0 }).format(n);
  return (
    <div className="mx-auto mt-16 max-w-3xl rounded-3xl border border-white/12 bg-white/[0.05] p-8 text-white shadow-xl shadow-black/30 backdrop-blur" data-testid="earnings-simulator">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-harx-500/20 text-harx-300"><Calculator className="h-5 w-5" aria-hidden="true" /></span>
        <h3 className="text-xl font-black text-white">{t('taasWidgets.simTitle', 'Estimate your earnings')}</h3>
      </div>
      <label className="mt-6 block text-sm font-semibold text-slate-200" htmlFor="sim-gig">{t('taasWidgets.simMission', 'Example mission')}</label>
      <select id="sim-gig" value={gigId} onChange={(e) => setGigId(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-white/20 bg-slate-900 px-3 text-sm font-semibold text-white focus:border-harx-400 focus:outline-none focus:ring-2 focus:ring-harx-400/40" data-testid="sim-gig">
        {EXAMPLE_GIGS.map((g) => <option key={g.id} value={g.id}>{g[lang].title}</option>)}
      </select>
      <div className="mt-5 grid gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-slate-200" htmlFor="sim-calls">{t('taasWidgets.simCalls', 'Argued calls per month')} : <strong className="text-harx-300">{calls}</strong></label>
          <input id="sim-calls" type="range" min={0} max={1000} step={10} value={calls} onChange={(e) => setCalls(Number(e.target.value))} className="mt-2 w-full accent-harx-500" data-testid="sim-calls" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-200" htmlFor="sim-tx">{t('taasWidgets.simLabel', 'Confirmed transactions per month')} : <strong className="text-harx-300">{tx}</strong></label>
          <input id="sim-tx" type="range" min={0} max={100} value={tx} onChange={(e) => setTx(Number(e.target.value))} className="mt-2 w-full accent-harx-500" data-testid="sim-range" />
        </div>
      </div>
      <label className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-200">
        <input type="checkbox" checked={target} onChange={(e) => setTarget(e.target.checked)} className="h-4 w-4 accent-harx-500" data-testid="sim-target" />
        {t('taasWidgets.simTarget', 'Performance target reached')}
      </label>
      <dl className="mt-6 grid gap-2 text-sm font-semibold text-slate-300" data-testid="sim-breakdown">
        <div className="flex justify-between"><dt>{t('taasWidgets.simFixed', 'Fixed amount per argued call')}</dt><dd data-testid="sim-fixed">{fmt(est.fixed)}</dd></div>
        <div className="flex justify-between"><dt>{t('taasWidgets.simCommission', 'Commission per transaction')}</dt><dd data-testid="sim-commission">{fmt(est.commission)}</dd></div>
        <div className="flex justify-between"><dt>{t('taasWidgets.simBonus', 'Performance bonus')}</dt><dd data-testid="sim-bonus">{fmt(est.bonus)}</dd></div>
      </dl>
      <p className="mt-4 text-4xl font-black text-white" data-testid="sim-total">{fmt(est.total)}</p>
      <p className="mt-1 text-xs font-medium text-slate-400">{t('taasWidgets.simNote', 'Indicative estimate')}</p>
    </div>
  );
}

/** Bande d'adhésion : appel à rejoindre HARX. */
function JoinBand({ onJoin }: { onJoin: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="mx-auto mt-16 max-w-5xl rounded-3xl bg-gradient-to-br from-harx-500 to-harx-alt-500 p-8 text-center text-white shadow-xl shadow-harx-500/25 md:p-12" data-testid="reps-join">
      <h3 className="text-2xl font-black md:text-3xl">{t('taasWidgets.joinTitle', 'Ready to take your first mission?')}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm font-medium text-white/90">{t('taasWidgets.joinText', 'Create your profile and apply to the missions that suit you.')}</p>
      <button type="button" onClick={onJoin} data-testid="reps-join-cta" className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-white px-7 text-sm font-bold text-harx-700 transition-transform hover:scale-[1.03]">
        {t('taasWidgets.joinCta', 'Join HARX')}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

/** Bloc d'adhésion REPS : étapes, estimation de gains (modèle HARX, missions types) et bouton. */
export function RepsJoinSection({ onJoin }: { onJoin: () => void }) {
  return (
    <section className="relative overflow-hidden bg-[#0a0a18] px-4 py-20 text-white" data-testid="reps-join-section">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true"><div className="absolute -left-32 top-0 h-[26rem] w-[26rem] rounded-full bg-fuchsia-600/20 blur-[120px]" /><div className="absolute -right-32 bottom-0 h-[24rem] w-[24rem] rounded-full bg-rose-600/20 blur-[120px]" /></div>
      <div className="relative">
        <RepsSteps />
        <EarningsSimulator />
        <JoinBand onJoin={onJoin} />
      </div>
    </section>
  );
}
