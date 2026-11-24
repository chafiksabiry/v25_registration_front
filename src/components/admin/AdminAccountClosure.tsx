import React, { useState } from 'react';
import {
  AlertTriangle,
  Ban,
  CreditCard,
  Database,
  Info,
  Lock,
  Mail,
  Phone,
  PhoneOff,
  RotateCcw,
  Trash2,
  UserCheck,
  UserX,
  X,
} from 'lucide-react';
import { adminApi } from '../../lib/api';
import {
  closureErrorMessage,
  confirmEmailMatches,
  disabledDetail,
  disabledTitle,
  displayNumber,
  isAccountDisabled,
  type AccountStatusFields,
} from './accountClosureUtils';

type ClosureUser = AccountStatusFields & { _id: string; email: string };

/** Bandeau du compte désactivé (maquette A2b), en haut de la fiche. */
export function DisabledAccountBanner({ user, onChanged }: { user: ClosureUser; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!isAccountDisabled(user)) return null;
  const reactivate = async () => {
    setBusy(true);
    setError(null);
    try {
      await adminApi.setUserStatus(user._id, { disabled: false });
      onChanged();
    } catch (e) {
      setError(closureErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/90 px-5 py-4" data-testid="account-disabled-banner">
      <span className="mt-0.5 text-red-600"><Ban size={20} /></span>
      <div className="flex-1">
        <p className="font-black text-red-700">{disabledTitle(user)}</p>
        <p className="text-sm text-red-700/80 mt-0.5">{disabledDetail(user)}</p>
        {error ? <p className="text-sm font-bold text-red-700 mt-1" role="alert">{error}</p> : null}
      </div>
      <button type="button" className="admin-btn-harx" disabled={busy} onClick={reactivate}>
        <UserCheck size={16} /> Réactiver le compte
      </button>
    </div>
  );
}

/**
 * Bloc « Accès et suppression du compte » (maquettes A2, A2b) et fenêtre de confirmation de la suppression (A3).
 * `numbers` : numéros des lignes du compte (remis en stock à la suppression). `name` : nom affiché dans la confirmation.
 */
export default function AdminAccountClosure({
  user,
  name,
  numbers,
  onChanged,
  onDeleted,
}: {
  user: ClosureUser;
  name: string;
  numbers: string[];
  onChanged: () => void;
  onDeleted: () => void;
}) {
  const disabled = isAccountDisabled(user);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const shownNumbers = numbers.map(displayNumber).join(', ');

  const setStatus = async (next: boolean) => {
    setBusy(true);
    setError(null);
    try {
      await adminApi.setUserStatus(user._id, next ? { disabled: true, reason: reason.trim() || undefined } : { disabled: false });
      setReason('');
      onChanged();
    } catch (e) {
      setError(closureErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="admin-section space-y-4 !border-red-200 ring-2 ring-red-100" data-testid="account-closure">
      <div className="pl-3">
        <h2 className="admin-section-title !text-red-700">Accès et suppression du compte</h2>
      </div>
      {error ? <p className="pl-3 text-sm font-bold text-red-600" role="alert">{error}</p> : null}
      <div className="pl-3 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
          <p className="flex items-center gap-2 font-black text-slate-900">
            {disabled ? <UserCheck size={18} className="text-amber-600" /> : <UserX size={18} className="text-amber-600" />}
            {disabled ? 'Réactiver le compte' : 'Désactiver le compte'}
            <span className="text-[11px] font-bold text-amber-700 bg-amber-100 rounded-full px-2 py-0.5">Réversible</span>
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
            <li className="flex gap-2"><Lock size={16} className="mt-0.5 shrink-0 text-amber-600" /> Connexion bloquée tout de suite (portail et app NOMAD), sessions ouvertes fermées.</li>
            <li className="flex gap-2"><CreditCard size={16} className="mt-0.5 shrink-0 text-amber-600" /> <span>Abonnement Stripe <b className="text-slate-800">non modifié</b> : il continue d’être facturé.</span></li>
            <li className="flex gap-2"><Phone size={16} className="mt-0.5 shrink-0 text-amber-600" /> Numéro conservé ; les appels entrants vont au répondeur.</li>
            <li className="flex gap-2"><RotateCcw size={16} className="mt-0.5 shrink-0 text-amber-600" /> Réactivation en un clic, rien n’est perdu.</li>
          </ul>
          {disabled ? (
            <button type="button" className="admin-btn-harx mt-4" disabled={busy} onClick={() => setStatus(false)}>
              <UserCheck size={16} /> Réactiver le compte
            </button>
          ) : (
            <>
              <input
                className="admin-input !pl-3 mt-4"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={500}
                placeholder="Motif (visible dans le journal d’administration)"
                aria-label="Motif de la désactivation"
              />
              <button type="button" className="admin-btn-warn-outline mt-3" disabled={busy} onClick={() => setStatus(true)}>
                <UserX size={16} /> Désactiver le compte
              </button>
            </>
          )}
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50/60 p-5">
          <p className="flex items-center gap-2 font-black text-slate-900">
            <Trash2 size={18} className="text-red-600" /> Supprimer le compte
            <span className="text-[11px] font-bold text-red-700 bg-red-100 rounded-full px-2 py-0.5">Irréversible</span>
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
            <li className="flex gap-2"><CreditCard size={16} className="mt-0.5 shrink-0 text-red-600" /> Abonnement Stripe résilié immédiatement.</li>
            <li className="flex gap-2"><PhoneOff size={16} className="mt-0.5 shrink-0 text-red-600" /> {shownNumbers ? `Numéro ${shownNumbers} remis en stock.` : 'Numéro remis en stock.'}</li>
            <li className="flex gap-2"><Database size={16} className="mt-0.5 shrink-0 text-red-600" /> Données personnelles supprimées.</li>
            <li className="flex gap-2"><Mail size={16} className="mt-0.5 shrink-0 text-red-600" /> Email libéré pour une nouvelle inscription.</li>
          </ul>
          <button type="button" className="admin-btn-danger-outline mt-4" disabled={busy} onClick={() => setConfirmOpen(true)}>
            <Trash2 size={16} /> Supprimer le compte…
          </button>
        </div>
      </div>
      {confirmOpen ? (
        <DeleteAccountDialog user={user} name={name} numbers={shownNumbers} onClose={() => setConfirmOpen(false)} onDeleted={onDeleted} />
      ) : null}
    </section>
  );
}

/** Fenêtre de confirmation de la suppression (maquette A3) : l'admin retape l'email du compte. */
export function DeleteAccountDialog({
  user,
  name,
  numbers,
  onClose,
  onDeleted,
}: {
  user: ClosureUser;
  name: string;
  numbers: string;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ok = confirmEmailMatches(typed, user.email);

  const submit = async () => {
    if (!ok || busy) return;
    setBusy(true);
    setError(null);
    try {
      await adminApi.deleteUser(user._id, typed.trim());
      onDeleted();
    } catch (e) {
      setError(closureErrorMessage(e));
      setBusy(false);
    }
  };

  const step = (icon: React.ReactNode, title: string, text: string) => (
    <li className="flex gap-3 rounded-xl border border-red-100 bg-red-50/50 p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-red-600 border border-red-100">{icon}</span>
      <span>
        <b className="block text-slate-900 text-sm">{title}</b>
        <span className="text-[13px] text-slate-600">{text}</span>
      </span>
    </li>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 backdrop-blur-sm p-6" role="dialog" aria-modal="true" aria-labelledby="delete-account-title">
      <div className="w-full max-w-[600px] max-h-full overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start gap-4 border-b border-slate-100 px-7 pt-6 pb-5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-100"><AlertTriangle size={22} /></span>
          <div className="flex-1">
            <h2 id="delete-account-title" className="text-xl font-black text-slate-900">Supprimer définitivement le compte de {name} ?</h2>
            <p className="text-sm text-slate-500 mt-1">Cette action ne peut pas être annulée.</p>
          </div>
          <button type="button" className="text-slate-400 hover:text-slate-600" onClick={onClose} aria-label="Fermer"><X size={20} /></button>
        </div>
        <div className="px-7 py-5 space-y-4">
          <p className="text-sm font-bold text-slate-700">Ce qui va se passer, dans cet ordre :</p>
          <ul className="space-y-2">
            {step(<CreditCard size={18} />, 'Abonnement Stripe résilié immédiatement', 'Plus aucun prélèvement. Pas de remboursement automatique du mois en cours.')}
            {step(<PhoneOff size={18} />, numbers ? `Numéro NOMAD ${numbers} remis en stock` : 'Numéro NOMAD remis en stock', 'Il redevient attribuable à un autre client ; les appels n’arrivent plus.')}
            {step(<Database size={18} />, 'Données personnelles supprimées', 'Profil, contacts, journal d’appels, messages du répondeur, pièces d’identité.')}
            {step(<Mail size={18} />, 'Email libéré', `${user.email} pourra servir à une nouvelle inscription.`)}
          </ul>
          <p className="text-xs text-slate-500 flex gap-1.5">
            <Info size={14} className="mt-0.5 shrink-0" /> Les factures déjà émises restent chez Stripe (obligation comptable). Une ligne sans donnée personnelle est gardée dans le journal d’administration (qui, quand).
          </p>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Pour confirmer, tapez l’email du compte : <span className="font-mono text-red-600">{user.email}</span></span>
            <input
              className={`admin-input !pl-3 mt-2 ${ok ? '!border-emerald-400' : ''}`}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              data-testid="delete-confirm-email"
            />
          </label>
          {error ? <p className="text-sm font-bold text-red-600" role="alert">{error}</p> : null}
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-7 py-4">
          <button type="button" className="admin-btn-secondary" onClick={onClose} disabled={busy}>Annuler</button>
          <button type="button" className="admin-btn-danger-solid" onClick={submit} disabled={!ok || busy} data-testid="delete-confirm-submit">
            <Trash2 size={16} /> {busy ? 'Suppression…' : 'Supprimer définitivement'}
          </button>
        </div>
      </div>
    </div>
  );
}
