import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle2, CreditCard, Database, Info, Mail, PhoneOff, ShieldAlert, Trash2, X, XCircle } from 'lucide-react';
import { adminApi } from '../../lib/api';
import AccountOfferBadge from './AccountOfferBadge';
import {
  bulkConfirmMatches,
  bulkConfirmText,
  bulkReasonText,
  bulkRequestErrorMessage,
  bulkSubmitLabel,
  groupBulkResults,
  selectionLabel,
  BULK_DELETE_MAX,
  type BulkResponse,
  type BulkResult,
  type BulkRow,
} from './bulkDeleteUtils';

const rowDisplayName = (row: BulkRow) => row.displayName || row.fullName || '—';
const rowDisplayEmail = (row: BulkRow) => row.displayEmail || row.email;

/** Barre de sélection au-dessus de la liste : « N sélectionné(s) » + « Supprimer la sélection » (même style que la suppression unitaire). */
export function BulkSelectionBar({ count, onClear, onDelete }: { count: number; onClear: () => void; onDelete: () => void }) {
  if (count === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-red-200 bg-red-50/70 px-5 py-3" data-testid="bulk-selection-bar">
      <span className="font-black text-slate-900" data-testid="bulk-selection-count">{selectionLabel(count)}</span>
      {count >= BULK_DELETE_MAX ? (
        <span className="text-xs font-bold text-red-700">Maximum {BULK_DELETE_MAX} comptes par suppression.</span>
      ) : null}
      <button type="button" className="text-sm font-bold text-slate-500 hover:text-slate-700 underline underline-offset-2" onClick={onClear}>
        Tout désélectionner
      </button>
      <span className="flex-1" />
      <button type="button" className="admin-btn-danger-outline" onClick={onDelete} data-testid="bulk-delete-open">
        <Trash2 size={16} /> Supprimer la sélection
      </button>
    </div>
  );
}

type DialogViewProps = {
  rows: BulkRow[];
  typed: string;
  busy: boolean;
  error: string | null;
  onTyped: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

/** Contenu de la fenêtre de confirmation (style A3) : comptes choisis, 4 conséquences, saisie « SUPPRIMER N ». */
export function BulkDeleteDialogView({ rows, typed, busy, error, onTyped, onClose, onSubmit }: DialogViewProps) {
  const n = rows.length;
  const ok = bulkConfirmMatches(typed, n);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 backdrop-blur-sm p-6" role="dialog" aria-modal="true" aria-labelledby="bulk-delete-title">
      <div className="w-full max-w-[640px] max-h-full overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start gap-4 border-b border-slate-100 px-7 pt-6 pb-5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-100"><AlertTriangle size={22} /></span>
          <div className="flex-1">
            <h2 id="bulk-delete-title" className="text-xl font-black text-slate-900">
              Supprimer définitivement {n} compte{n > 1 ? 's' : ''} ?
            </h2>
            <p className="text-sm text-slate-500 mt-1">Cette action ne peut pas être annulée. Chaque compte est supprimé comme depuis sa fiche.</p>
          </div>
          <button type="button" className="text-slate-400 hover:text-slate-600" onClick={onClose} aria-label="Fermer" disabled={busy}><X size={20} /></button>
        </div>
        <div className="px-7 py-5 space-y-4">
          <div>
            <p className="text-sm font-bold text-slate-700">Comptes sélectionnés</p>
            <ul className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100" data-testid="bulk-delete-list">
              {rows.map((row) => (
                <li key={row._id} className="flex items-center gap-3 px-3 py-2 text-sm">
                  <span className="min-w-0 flex-1">
                    <b className="block truncate text-slate-900">{rowDisplayName(row)}</b>
                    <span className="block truncate text-[13px] text-slate-500">{rowDisplayEmail(row)}</span>
                  </span>
                  <span className="shrink-0 text-xs"><AccountOfferBadge value={row.accountOffer} /></span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-sm font-bold text-slate-700">Pour chaque compte, dans cet ordre :</p>
          <ul className="space-y-2">
            {step(<CreditCard size={18} />, 'Abonnement Stripe résilié immédiatement', 'Plus aucun prélèvement. Pas de remboursement automatique du mois en cours.')}
            {step(<PhoneOff size={18} />, 'Numéros remis en stock', 'Ils redeviennent attribuables à d’autres clients ; les appels n’arrivent plus.')}
            {step(<Database size={18} />, 'Données personnelles supprimées', 'Profil, contacts, journal d’appels, messages du répondeur, pièces d’identité.')}
            {step(<Mail size={18} />, 'Emails libérés', 'Chaque adresse pourra servir à une nouvelle inscription. Un e-mail de confirmation est envoyé à chaque compte.')}
          </ul>
          <p className="text-xs text-slate-500 flex gap-1.5">
            <Info size={14} className="mt-0.5 shrink-0" /> Les comptes protégés, administrateurs ou avec une équipe sont refusés et restent intacts. Une ligne sans donnée personnelle par compte, et une pour le lot, est gardée dans le journal d’administration.
          </p>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Pour confirmer, tapez : <span className="font-mono text-red-600">{bulkConfirmText(n)}</span></span>
            <input
              className={`admin-input !pl-3 mt-2 ${ok ? '!border-emerald-400' : ''}`}
              value={typed}
              onChange={(e) => onTyped(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              disabled={busy}
              data-testid="bulk-delete-confirm-text"
            />
          </label>
          {error ? <p className="text-sm font-bold text-red-600" role="alert">{error}</p> : null}
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-7 py-4">
          <button type="button" className="admin-btn-secondary" onClick={onClose} disabled={busy}>Annuler</button>
          <button type="button" className="admin-btn-danger-solid" onClick={onSubmit} disabled={!ok || busy} data-testid="bulk-delete-submit">
            <Trash2 size={16} /> {busy ? 'Suppression en cours…' : bulkSubmitLabel(n)}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Fenêtre de confirmation de la suppression en masse ; `onDone` reçoit le résultat par compte. */
export function BulkDeleteDialog({ rows, onClose, onDone }: { rows: BulkRow[]; onClose: () => void; onDone: (response: BulkResponse) => void }) {
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async () => {
    if (busy || !bulkConfirmMatches(typed, rows.length)) return;
    setBusy(true);
    setError(null);
    try {
      const response = await adminApi.bulkDeleteUsers(rows.map((r) => r._id), typed.trim().replace(/\s+/g, ' '));
      onDone(response.data);
    } catch (e) {
      setError(bulkRequestErrorMessage(e));
      setBusy(false);
    }
  };
  // Rendue dans <body>, comme la fenêtre A3 : les animations de la page ne doivent pas l'enfermer.
  return createPortal(
    <BulkDeleteDialogView rows={rows} typed={typed} busy={busy} error={error} onTyped={setTyped} onClose={() => !busy && onClose()} onSubmit={submit} />,
    document.body,
  );
}

/** Panneau des résultats : supprimés / refusés (raison en français) / en échec. `names` : nom affiché par identifiant. */
export function BulkDeleteResults({ response, names, onClose }: { response: BulkResponse; names: Record<string, string>; onClose: () => void }) {
  const groups = groupBulkResults(response.results);
  const { totals } = response;
  const line = (r: BulkResult, detail: React.ReactNode) => (
    <li key={r.userId} className="flex flex-wrap items-baseline gap-x-2 px-3 py-2 text-sm">
      <b className="text-slate-900">{names[r.userId] || '—'}</b>
      <span className="text-slate-500">{r.email || r.userId}</span>
      {detail ? <span className="basis-full text-[13px]">{detail}</span> : null}
    </li>
  );
  const section = (key: string, title: string, icon: React.ReactNode, tone: string, items: BulkResult[], detail: (r: BulkResult) => React.ReactNode) =>
    items.length ? (
      <div data-testid={`bulk-results-${key}`}>
        <p className={`flex items-center gap-2 text-sm font-black ${tone}`}>{icon} {title} ({items.length})</p>
        <ul className="mt-1.5 rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 max-h-56 overflow-y-auto">
          {items.map((r) => line(r, detail(r)))}
        </ul>
      </div>
    ) : null;
  return (
    <section className="admin-section space-y-4" data-testid="bulk-results" aria-live="polite">
      <div className="flex items-start gap-3 pl-3">
        <div className="flex-1">
          <h2 className="admin-section-title">Résultat de la suppression</h2>
          <p className="text-sm text-slate-600 mt-1" data-testid="bulk-results-totals">
            {totals.deleted} supprimé{totals.deleted > 1 ? 's' : ''} · {totals.refused} refusé{totals.refused > 1 ? 's' : ''} · {totals.failed} en échec, sur {totals.requested} demandé{totals.requested > 1 ? 's' : ''}.
          </p>
        </div>
        <button type="button" className="text-slate-400 hover:text-slate-600" onClick={onClose} aria-label="Fermer le résultat"><X size={20} /></button>
      </div>
      <div className="pl-3 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {section('deleted', 'Supprimés', <CheckCircle2 size={16} />, 'text-emerald-700', groups.deleted, (r) =>
          r.confirmationEmailSent === false ? <span className="text-amber-700">E-mail de confirmation non envoyé.</span> : null)}
        {section('refused', 'Refusés', <ShieldAlert size={16} />, 'text-amber-700', groups.refused, (r) => <span className="text-amber-800">{bulkReasonText(r.code)}</span>)}
        {section('failed', 'En échec', <XCircle size={16} />, 'text-red-700', groups.failed, (r) => <span className="text-red-700">{bulkReasonText(r.code)}</span>)}
      </div>
    </section>
  );
}
