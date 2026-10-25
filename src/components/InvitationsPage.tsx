import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Building2, Check, X } from 'lucide-react';
import { Header } from './LandingPage/Header';
import { useAuth } from '../contexts/AuthContext';
import { hardNavigate } from '../lib/appNavigation';
import {
  INVITATIONS_SEEN_KEY,
  fetchPendingInvitations,
  respondToInvitation,
  type PendingInvitation,
} from '../lib/agentInvitations';

/** Only same-site paths are followed after the screen, never an external address. */
function safeNext(value: string | null): string {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/';
}

/** Shown right after signing in when call centres have invited this e-mail address. */
export default function InvitationsPage({ onSignIn }: { onSignIn: () => void }) {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const [items, setItems] = useState<PendingInvitation[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const leave = () => {
    try {
      sessionStorage.setItem(INVITATIONS_SEEN_KEY, '1');
    } catch {
      /* ignore */
    }
    hardNavigate(next);
  };

  useEffect(() => {
    if (!token) return;
    void fetchPendingInvitations(token).then((list) => {
      if (list.length === 0) leave();
      else setItems(list);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const answer = async (item: PendingInvitation, accept: boolean) => {
    if (!token) return;
    setBusyId(item.id);
    setError(null);
    try {
      await respondToInvitation(token, item.id, accept);
      const rest = (items ?? []).filter((i) => i.id !== item.id);
      setItems(rest);
      if (rest.length === 0) leave();
    } catch {
      setError(t('invitations.error', 'This did not work. Please try again.'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-space-dark-950 text-white">
      <Header onSignIn={onSignIn} onGetStarted={() => {}} />
      <div className="flex-1 flex items-center justify-center p-4 py-24">
        <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-2xl">
          <h1 className="text-2xl font-black">{t('invitations.title', 'You have been invited')}</h1>
          <p className="mt-2 text-sm font-medium text-slate-400">
            {t('invitations.intro', 'These call centres invited you to join their team. Accept the ones you know.')}
          </p>

          {items === null ? (
            <div className="mt-8 flex justify-center" role="status">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-harx-500 border-t-transparent" />
            </div>
          ) : (
            <ul className="mt-6 space-y-3">
              {items.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-300">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1 font-bold">
                    {item.companyName || t('invitations.unnamed', 'A call centre')}
                  </span>
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => void answer(item, true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" /> {t('invitations.accept', 'Accept')}
                  </button>
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => void answer(item, false)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/10 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" /> {t('invitations.decline', 'Decline')}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {error ? <p role="alert" className="mt-4 text-sm font-medium text-red-300">{error}</p> : null}

          <div className="mt-6 border-t border-white/10 pt-4 text-right">
            <button type="button" onClick={leave} className="text-sm font-bold text-slate-300 underline-offset-2 hover:text-white hover:underline">
              {t('invitations.later', 'Decide later')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
