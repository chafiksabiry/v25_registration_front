import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { jwtDecode } from 'jwt-decode';
import { AlertCircle, ArrowRight, Check, Loader2 } from 'lucide-react';
import { auth } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { getPostLoginRedirectUrl, syncSessionUserIdCookie } from '../lib/authRedirect';
import { hardNavigate } from '../lib/appNavigation';
import { buildAuthPageTitle } from '../lib/tracking/registrationSections';
import { usePageTitle } from '../lib/tracking/usePageTitle';
import { ReactivateShell } from './reactivate/ReactivateShell';
import { REACTIVATE_COPY, reactivateLangFor } from './reactivate/reactivateCopy';
import { HARX_BRAND } from '../lib/harxBrand';

type Status = 'loading' | 'invalid' | 'expired' | 'request' | 'sent';

/**
 * Landing page of the re-engagement flow for migrated HARX v1 reps.
 * - /auth/reactivate?t=<token>: exchanges the one-click token for a session and resumes onboarding.
 * - /auth/reactivate (no token, the address used in the campaign e-mail): the REP types their
 *   address and the personal one-click link is e-mailed to it.
 */
export default function ReactivateAccount() {
  const { i18n } = useTranslation();
  const lang = reactivateLangFor(i18n.language);
  const copy = REACTIVATE_COPY[lang];
  const { setToken } = useAuth();
  const [status, setStatus] = useState<Status>('loading');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [requestError, setRequestError] = useState(false);
  const started = useRef(false);

  usePageTitle(buildAuthPageTitle('Reprise du compte'));

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const params = new URLSearchParams(window.location.search);
    const linkToken = params.get('t') ?? '';
    // Keep the secret out of the address bar, history and Referer headers.
    window.history.replaceState(null, '', window.location.pathname);
    if (!linkToken) {
      setStatus('request');
      return;
    }

    (async () => {
      try {
        const { token } = await auth.reengageLogin(linkToken);
        const { userId } = jwtDecode<{ userId: string }>(token);
        setToken(token, true);
        syncSessionUserIdCookie(token);
        const dest = await getPostLoginRedirectUrl(userId, token);
        hardNavigate(dest || '/auth/signin');
      } catch (err: unknown) {
        const code = (err as { response?: { data?: { code?: string } } })?.response?.data?.code;
        setStatus(code === 'LINK_EXPIRED' ? 'expired' : 'invalid');
      }
    })();
  }, [setToken]);

  const submitRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    if (sending || !email.trim()) return;
    setSending(true);
    setRequestError(false);
    try {
      await auth.reengageRequest(email.trim());
      setStatus('sent');
    } catch {
      setRequestError(true);
    } finally {
      setSending(false);
    }
  };

  const offerBg = `linear-gradient(135deg, ${HARX_BRAND.red} 0%, ${HARX_BRAND.magenta} 100%)`;
  const cardClass = 'rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8';
  const primaryButton =
    'w-full rounded-xl px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:brightness-110 disabled:opacity-60';

  if (status === 'request' || status === 'sent') {
    return (
      <ReactivateShell lang={lang}>
        <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section aria-labelledby="reactivate-title">
            <p className="mb-2 text-xs font-bold tracking-[0.2em]" style={{ color: HARX_BRAND.magenta }}>
              {copy.eyebrow}
            </p>
            <h1 id="reactivate-title" className="mb-4 text-3xl font-extrabold text-white sm:text-4xl">
              {copy.title}
            </h1>
            <p className="mb-1 text-slate-300">{copy.hello}</p>
            <p className="mb-5 text-slate-300">{copy.intro}</p>
            <h2 className="mb-1 text-base font-bold text-white">{copy.whyTitle}</h2>
            <p className="mb-6 text-slate-300">{copy.why}</p>

            <div
              data-testid="reactivate-offer"
              className="mb-6 rounded-2xl border bg-slate-900/70 p-5"
              style={{ borderColor: `${HARX_BRAND.magenta}66` }}
            >
              <p className="text-xs font-bold tracking-[0.2em]" style={{ color: HARX_BRAND.magenta }}>
                {copy.offerLabel}
              </p>
              <p className="my-1 text-3xl font-extrabold text-white">{copy.offerHeadline}</p>
              <p className="mb-3 text-sm font-semibold text-slate-300">{copy.offerPlan}</p>
              <p
                className="inline-block rounded-lg border px-3 py-1 text-sm font-extrabold tracking-wide text-white"
                style={{ borderColor: HARX_BRAND.magenta, backgroundColor: `${HARX_BRAND.magenta}26` }}
              >
                {copy.offerCode}
              </p>
              <p className="mt-2 text-xs text-slate-400">{copy.offerValid}</p>
            </div>

            <h2 className="mb-3 text-xs font-bold tracking-[0.2em] text-slate-400">{copy.stepsTitle}</h2>
            <ol className="mb-4 space-y-2" data-testid="reactivate-steps">
              {copy.steps.map((step, index) => (
                <li key={step} className="flex items-start gap-3 text-slate-200">
                  <span
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: HARX_BRAND.magenta }}
                  >
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <p className="flex items-center gap-2 text-sm text-slate-400">
              <Check className="h-4 w-4 text-emerald-400" />
              {copy.noCard}
            </p>
          </section>

          <section
            className="order-first rounded-2xl p-[2px] lg:order-none lg:sticky lg:top-6"
            style={{ backgroundImage: offerBg, boxShadow: '0 0 40px -8px rgba(230, 24, 141, 0.55)' }}
            aria-live="polite"
          >
            <div className="rounded-[14px] bg-slate-900 p-6 sm:p-8">
            {status === 'sent' ? (
              <div className="text-center">
                <h2 className="mb-2 text-lg font-bold text-white">{copy.sentTitle}</h2>
                <p className="mb-6 text-sm text-slate-300">{copy.sentText}</p>
                <button
                  type="button"
                  onClick={() => setStatus('request')}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-white"
                >
                  {copy.sendAgain}
                </button>
              </div>
            ) : (
              <form onSubmit={submitRequest} className="text-left">
                <h2 className="mb-2 text-xl font-extrabold text-white">{copy.formTitle}</h2>
                <p className="mb-5 text-sm text-slate-300">{copy.formIntro}</p>
                <label htmlFor="reactivate-email" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {copy.emailLabel}
                </label>
                <input
                  id="reactivate-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={copy.emailPlaceholder}
                  className="mb-4 w-full rounded-xl border-2 border-slate-600 bg-slate-950 px-4 py-3.5 text-base text-white outline-none focus:border-pink-400"
                />
                {requestError && (
                  <p className="mb-4 flex items-center gap-2 text-sm text-amber-400">
                    <AlertCircle className="h-4 w-4" />
                    {copy.requestError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={sending}
                  className={`${primaryButton} flex items-center justify-center gap-2 py-4 text-base`}
                  style={{ backgroundImage: offerBg }}
                >
                  {sending ? copy.sending : copy.send}
                  {!sending && <ArrowRight className="h-5 w-5" aria-hidden="true" />}
                </button>
              </form>
            )}
            </div>
          </section>
        </div>
      </ReactivateShell>
    );
  }

  return (
    <ReactivateShell lang={lang}>
      <div className="flex justify-center">
        {status === 'loading' ? (
          <div className="flex flex-col items-center gap-4 py-16 text-slate-300">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>{copy.loading}</p>
          </div>
        ) : (
          <div className={`${cardClass} max-w-md text-center`}>
            <AlertCircle className="mx-auto mb-4 h-8 w-8 text-amber-400" />
            <h1 className="mb-2 text-lg font-semibold text-white">
              {status === 'expired' ? copy.expiredTitle : copy.invalidTitle}
            </h1>
            <p className="mb-6 text-sm text-slate-300">{copy.help}</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => setStatus('request')}
                className="rounded-xl px-4 py-2 text-sm font-bold text-white"
                style={{ backgroundImage: offerBg }}
              >
                {copy.send}
              </button>
              <Link to="/auth/signin" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900">
                {copy.signIn}
              </Link>
              <Link to="/auth/recovery" className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-white">
                {copy.forgot}
              </Link>
            </div>
          </div>
        )}
      </div>
    </ReactivateShell>
  );
}
