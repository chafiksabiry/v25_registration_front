import React, { useState } from 'react';
import { ArrowRight, Bell, CheckCircle2, ClipboardCheck, Headphones, Globe, MessageSquareText, PhoneCall, Search, Target, Wallet, Clock, Coins, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { newsletter } from '../../lib/api';

/** Source enregistrée avec l'adresse : permet de prévenir ces personnes à l'ouverture de « Publier un gig ». */
export const TAAS_LAUNCH_INTEREST = 'taas_company_launch';

const STEPS: Array<{ n: number; icon: LucideIcon; title: string; text: string }> = [
  { n: 1, icon: Target, title: 'taasPage.step1Title', text: 'taasPage.step1Text' },
  { n: 2, icon: Headphones, title: 'taasPage.step2Title', text: 'taasPage.step2Text' },
  { n: 3, icon: Wallet, title: 'taasPage.step3Title', text: 'taasPage.step3Text' },
];

const EXAMPLES: Array<{ icon: LucideIcon; title: string; text: string }> = [
  { icon: PhoneCall, title: 'taasPage.ex1Title', text: 'taasPage.ex1Text' },
  { icon: ClipboardCheck, title: 'taasPage.ex2Title', text: 'taasPage.ex2Text' },
  { icon: Search, title: 'taasPage.ex3Title', text: 'taasPage.ex3Text' },
  { icon: MessageSquareText, title: 'taasPage.ex4Title', text: 'taasPage.ex4Text' },
];

const PRO_POINTS: Array<{ icon: LucideIcon; text: string }> = [
  { icon: Clock, text: 'taasPage.pro1' },
  { icon: Coins, text: 'taasPage.pro2' },
  { icon: Globe, text: 'taasPage.pro3' },
];

/** Fin de la démonstration : l'entreprise laisse son adresse pour être prévenue de l'ouverture de « Publier un gig ». */
function NotifyForm() {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error' | 'required'>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setState('required');
      return;
    }
    setState('sending');
    try {
      const result = await newsletter.subscribe({
        email: trimmed,
        locale: i18n.language?.split('-')[0] || 'fr',
        source: TAAS_LAUNCH_INTEREST,
      });
      if (!result?.success) throw new Error('subscribe failed');
      setState('done');
    } catch {
      setState('error');
    }
  };

  return (
    <div id="prevenu" className="scroll-mt-28 mx-auto mt-14 max-w-2xl rounded-3xl bg-gradient-to-br from-harx-500 to-harx-alt-500 p-8 text-center text-white shadow-xl shadow-harx-500/25" data-testid="taas-notify">
      <span className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/20"><Bell className="h-5 w-5" aria-hidden="true" /></span>
      <h3 className="text-2xl font-black">{t('taasPage.notifyTitle')}</h3>
      <p className="mt-2 text-sm font-medium text-white/90">{t('taasPage.notifyText')}</p>
      {state === 'done' ? (
        <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-harx-600" role="status" data-testid="taas-notify-done">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> {t('taasPage.notifyDone')}
        </p>
      ) : (
        <form className="mt-5 flex flex-col gap-2 sm:flex-row" onSubmit={submit} noValidate>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('taasPage.notifyPlaceholder') as string}
            aria-label={t('taasPage.notifyPlaceholder') as string}
            autoComplete="email"
            data-testid="taas-notify-email"
            className="h-12 flex-1 rounded-xl border-0 bg-white px-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-white/40"
          />
          <button
            type="submit"
            disabled={state === 'sending'}
            data-testid="taas-notify-submit"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-bold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {state === 'sending' ? t('taasPage.notifySending') : t('taasPage.notifyButton')}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>
      )}
      {state === 'required' && <p className="mt-3 text-sm font-semibold" role="alert">{t('taasPage.notifyRequired')}</p>}
      {state === 'error' && <p className="mt-3 text-sm font-semibold" role="alert" data-testid="taas-notify-error">{t('taasPage.notifyError')}</p>}
    </div>
  );
}

/** Comment ça marche : trois étapes, puis l'inscription à l'ouverture (fin de la démonstration). */
export function TaasHow() {
  const { t } = useTranslation();
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-3xl font-black md:text-5xl">{t('taasPage.howTitle')}</h2>
        <p className="mx-auto mt-3 max-w-xl text-lg text-slate-500">{t('taasPage.howSub')}</p>
        <ol className="mt-12 grid gap-6 md:grid-cols-3" data-testid="taas-steps">
          {STEPS.map(({ n, icon: Icon, title, text }) => (
            <li key={n} className="relative rounded-3xl border border-slate-200 bg-white p-7 text-left shadow-lg shadow-slate-200/60">
              <span className="absolute -top-4 left-7 inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-harx text-base font-black text-white shadow-md">{n}</span>
              <span className="mt-2 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-harx-50 text-harx-600"><Icon className="h-6 w-6" aria-hidden="true" /></span>
              <h3 className="mt-4 text-xl font-bold">{t(title)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{t(text)}</p>
            </li>
          ))}
        </ol>
        <NotifyForm />
      </div>
    </div>
  );
}

/** Quelques résultats concrets que l'entreprise peut confier. */
export function TaasExamples() {
  const { t } = useTranslation();
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-3xl font-black md:text-4xl">{t('taasPage.examplesTitle')}</h2>
        <p className="mx-auto mt-3 max-w-xl text-lg text-slate-500">{t('taasPage.examplesSub')}</p>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" data-testid="taas-examples">
          {EXAMPLES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-md shadow-slate-200/50">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-harx-50 text-harx-600"><Icon className="h-5 w-5" aria-hidden="true" /></span>
              <h3 className="mt-3 text-base font-bold">{t(title)}</h3>
              <p className="mt-1 text-sm text-slate-600">{t(text)}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Bloc pour les professionnels du service client : le parcours « Trouver des gigs » est ouvert. */
export function TaasForPros({ onFindGigs }: { onFindGigs: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="mx-auto grid max-w-5xl items-center gap-8 rounded-3xl bg-gradient-to-br from-harx-700 to-harx-alt-600 p-8 text-white shadow-xl md:grid-cols-[1.3fr_1fr] md:p-12">
        <div>
          <h2 className="text-3xl font-black md:text-4xl">{t('taasPage.prosTitle')}</h2>
          <p className="mt-3 text-base font-medium text-white/90">{t('taasPage.prosText')}</p>
          <button
            type="button"
            onClick={onFindGigs}
            data-testid="taas-find-gigs"
            className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-harx-700 transition-transform hover:scale-[1.03]"
          >
            {t('taasPage.prosCta')}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <ul className="space-y-3">
          {PRO_POINTS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3 rounded-2xl bg-white/10 p-4 text-sm font-semibold">
              <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <span>{t(text)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
