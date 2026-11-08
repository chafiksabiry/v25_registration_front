import React, { useState } from 'react';
import { ArrowRight, Calculator, Coins, FileText, Rocket, UserPlus, Wallet, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { exampleAvgTransaction } from '../../config/exampleGigs';

const REP_STEPS: Array<{ icon: LucideIcon; title: string; text: string }> = [
  { icon: UserPlus, title: 'taasWidgets.repStep1Title', text: 'taasWidgets.repStep1Text' },
  { icon: Rocket, title: 'taasWidgets.repStep2Title', text: 'taasWidgets.repStep2Text' },
  { icon: Wallet, title: 'taasWidgets.repStep3Title', text: 'taasWidgets.repStep3Text' },
];

function RepsSteps() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-5xl text-center">
      <h2 className="text-3xl font-black md:text-4xl">{t('taasWidgets.repStepsTitle', 'Start in three steps')}</h2>
      <ol className="mt-10 grid gap-6 md:grid-cols-3" data-testid="reps-steps">
        {REP_STEPS.map(({ icon: Icon, title, text }, i) => (
          <li key={title} className="relative rounded-3xl border border-slate-200 bg-white p-7 text-left shadow-lg shadow-slate-200/60">
            <span className="absolute -top-4 left-7 inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-harx text-base font-black text-white shadow-md">{i + 1}</span>
            <span className="mt-2 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-harx-50 text-harx-600"><Icon className="h-6 w-6" aria-hidden="true" /></span>
            <h3 className="mt-4 text-xl font-bold">{t(title)}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{t(text)}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Estimation de gains : transactions confirmées par mois × commission moyenne par transaction des missions types. */
function EarningsSimulator({ avgTransaction }: { avgTransaction: number }) {
  const { t, i18n } = useTranslation();
  const [count, setCount] = useState(20);
  const total = count * avgTransaction;
  const fmt = (n: number) => new Intl.NumberFormat(i18n.language?.startsWith('en') ? 'en-GB' : 'fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
  return (
    <div className="mx-auto mt-16 max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/60" data-testid="earnings-simulator">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-harx-50 text-harx-600"><Calculator className="h-5 w-5" aria-hidden="true" /></span>
        <h3 className="text-xl font-black">{t('taasWidgets.simTitle', 'Estimate your earnings')}</h3>
      </div>
      <label className="mt-6 block text-sm font-semibold text-slate-700" htmlFor="sim-tx">
        {t('taasWidgets.simLabel', 'Confirmed transactions per month')} : <strong className="text-harx-600">{count}</strong>
      </label>
      <input id="sim-tx" type="range" min={1} max={100} value={count} onChange={(e) => setCount(Number(e.target.value))} className="mt-2 w-full accent-harx-500" data-testid="sim-range" />
      <p className="mt-5 text-4xl font-black text-slate-900" data-testid="sim-total">{fmt(total)}</p>
      <p className="mt-1 text-xs font-medium text-slate-500">
        {t('taasWidgets.simNote', 'Indicative estimate based on the average commission per transaction of the missions shown above. Not a guaranteed income.')}
      </p>
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

/** Bloc d'adhésion REPS : étapes, estimation de gains (sur les missions types) et bouton. */
export function RepsJoinSection({ onJoin }: { onJoin: () => void }) {
  const avgTransaction = exampleAvgTransaction();
  return (
    <section className="bg-white px-4 py-20 text-slate-900" data-testid="reps-join-section">
      <RepsSteps />
      {avgTransaction > 0 ? <EarningsSimulator avgTransaction={avgTransaction} /> : null}
      <JoinBand onJoin={onJoin} />
    </section>
  );
}

/** Onglet COMPANY : budget maximum = résultats voulus × prix par résultat (calcul sur les saisies du visiteur). */
export function BudgetSimulator() {
  const { t, i18n } = useTranslation();
  const [results, setResults] = useState(100);
  const [price, setPrice] = useState(10);
  const fmt = (n: number) => new Intl.NumberFormat(i18n.language?.startsWith('en') ? 'en-GB' : 'fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
  return (
    <section className="bg-slate-50 px-4 py-20 text-slate-900" data-testid="budget-simulator">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/60">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-harx-50 text-harx-600"><Coins className="h-5 w-5" aria-hidden="true" /></span>
          <h2 className="text-2xl font-black">{t('taasWidgets.budgetTitle', 'Simulate your budget')}</h2>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-slate-700" htmlFor="bud-results">
              {t('taasWidgets.budgetResults', 'Results wanted per month')} : <strong className="text-harx-600">{results}</strong>
            </label>
            <input id="bud-results" type="range" min={10} max={1000} step={10} value={results} onChange={(e) => setResults(Number(e.target.value))} className="mt-2 w-full accent-harx-500" data-testid="bud-results" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700" htmlFor="bud-price">{t('taasWidgets.budgetPrice', 'Price you set per result (€)')}</label>
            <input id="bud-price" type="number" min={1} max={10000} value={price} onChange={(e) => setPrice(Math.max(0, Number(e.target.value) || 0))} className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm font-semibold focus:border-harx-500 focus:outline-none focus:ring-2 focus:ring-harx-200" data-testid="bud-price" />
          </div>
        </div>
        <p className="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-600"><FileText className="h-4 w-4" aria-hidden="true" />{t('taasWidgets.budgetMax', 'Maximum monthly budget')}</p>
        <p className="mt-1 text-4xl font-black text-slate-900" data-testid="bud-total">{fmt(results * price)}</p>
        <p className="mt-1 text-xs font-medium text-slate-500">{t('taasWidgets.budgetNote', 'You only pay for the results you approve.')}</p>
      </div>
    </section>
  );
}
