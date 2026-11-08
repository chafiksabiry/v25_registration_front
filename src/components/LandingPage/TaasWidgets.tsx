import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Calculator, Coins, FileText, Layers, Languages, Rocket, Sparkles, UserPlus, Wallet, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { gigsApi, type Gig } from '../../services/gigsApi';

/** Part de la commission affichée au professionnel : même coefficient que sur les cartes des missions. */
export const REP_SHARE = 0.7;

export interface GigStats {
  count: number;
  categories: number;
  languages: number;
  /** Commission moyenne par transaction (part du professionnel), 0 si aucune mission n'en déclare. */
  avgTransaction: number;
}

/** Chiffres tirés uniquement des missions réellement renvoyées par le serveur. */
export function gigStats(gigs: Gig[]): GigStats {
  const tx = gigs.map((g) => g.commission?.commission_per_transaction ?? 0).filter((n) => n > 0);
  const avg = tx.length ? (tx.reduce((a, b) => a + b, 0) / tx.length) * REP_SHARE : 0;
  return {
    count: gigs.length,
    categories: new Set(gigs.map((g) => g.category).filter(Boolean)).size,
    languages: new Set(gigs.map((g) => g.language).filter(Boolean)).size,
    avgTransaction: avg,
  };
}

function useActiveGigs(): Gig[] | null {
  const [gigs, setGigs] = useState<Gig[] | null>(null);
  useEffect(() => {
    let alive = true;
    gigsApi
      .fetchActiveGigs()
      .then((list) => alive && setGigs(list))
      .catch(() => alive && setGigs([]));
    return () => {
      alive = false;
    };
  }, []);
  return gigs;
}

/** Compteur animé (désactivé avec prefers-reduced-motion) qui démarre quand il devient visible. */
function CountUp({ to, decimals = 0 }: { to: number; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof IntersectionObserver === 'undefined') {
      setValue(to);
      return;
    }
    let raf = 0;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / 1100);
          setValue(to * (1 - Math.pow(1 - p, 3)));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to]);
  return <span ref={ref}>{value.toFixed(decimals)}</span>;
}

/** Bandeau de chiffres réels sous les onglets (onglet REPS). Masqué s'il n'y a aucune mission. */
export function RepsStatsStrip() {
  const { t } = useTranslation();
  const gigs = useActiveGigs();
  const stats = useMemo(() => (gigs ? gigStats(gigs) : null), [gigs]);
  if (!stats || stats.count === 0) return null;
  const tiles: Array<{ icon: LucideIcon; value: number; label: string }> = [
    { icon: Rocket, value: stats.count, label: t('taasWidgets.statGigs', 'missions available') },
    ...(stats.categories > 0 ? [{ icon: Layers, value: stats.categories, label: t('taasWidgets.statCategories', 'business areas') }] : []),
    ...(stats.languages > 0 ? [{ icon: Languages, value: stats.languages, label: t('taasWidgets.statLanguages', 'languages requested') }] : []),
  ];
  return (
    <div className="bg-space-dark-default px-4 pb-2 pt-10 text-white" data-testid="reps-stats">
      <div className="mx-auto max-w-4xl text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-1.5 text-sm font-semibold text-slate-200">
          <Sparkles className="h-4 w-4 text-harx-400" aria-hidden="true" />
          {t('taasWidgets.repsKicker', 'Real missions, open now')}
        </p>
        <div className={`mt-6 grid gap-4 ${tiles.length === 1 ? 'grid-cols-1' : tiles.length === 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'}`}>
          {tiles.map(({ icon: Icon, value, label }) => (
            <div key={label} className="glass-card-premium rounded-2xl px-6 py-5">
              <Icon className="mx-auto h-6 w-6 text-harx-400" aria-hidden="true" />
              <p className="mt-2 text-4xl font-black tracking-tight"><CountUp to={value} /></p>
              <p className="mt-1 text-sm font-semibold text-slate-300">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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

/** Estimation de gains : transactions confirmées par mois × commission moyenne des missions affichées. */
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

/** Bloc d'adhésion REPS : étapes, estimation de gains (si les missions déclarent une commission) et bouton. */
export function RepsJoinSection({ onJoin }: { onJoin: () => void }) {
  const gigs = useActiveGigs();
  const stats = useMemo(() => (gigs ? gigStats(gigs) : null), [gigs]);
  return (
    <section className="bg-white px-4 py-20 text-slate-900" data-testid="reps-join-section">
      <RepsSteps />
      {stats && stats.avgTransaction > 0 ? <EarningsSimulator avgTransaction={stats.avgTransaction} /> : null}
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
