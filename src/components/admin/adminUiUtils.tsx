import React from 'react';
import { adminApi } from '../../lib/api';

export function formatMoney(value?: number | null, currency = 'EUR') {
  if (value == null || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(value);
}

export function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString('fr-FR');
}

export function formatCents(value?: number | null, currency = 'EUR') {
  if (value == null || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(value / 100);
}

export function InfoCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <div className="mt-1 text-sm font-semibold text-slate-900 break-words">{value}</div>
    </div>
  );
}

export function StatusBadge({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'success' | 'warning' | 'danger' | 'neutral';
}) {
  const tones = {
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700',
    neutral: 'bg-slate-100 text-slate-600',
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>
      {label}
    </span>
  );
}

export function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export function DataTable({
  headers,
  rows,
  emptyMessage,
}: {
  headers: string[];
  rows: React.ReactNode[][];
  emptyMessage: string;
}) {
  if (!rows.length) {
    return <p className="text-sm text-slate-500 py-4">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-100">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-500">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 font-semibold whitespace-nowrap">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, index) => (
            <tr key={index} className="border-t border-slate-100 hover:bg-slate-50/80">
              {cells.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3 text-slate-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FinancialAdjustForm({
  label,
  target,
  userId,
  onUpdated,
}: {
  label: string;
  target: 'company_minutes' | 'company_wallet' | 'rep_wallet';
  userId: string;
  onUpdated: () => void;
}) {
  const [amount, setAmount] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [action, setAction] = React.useState<'add' | 'set'>('add');
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await adminApi.updateFinancials(userId, {
        target,
        action,
        amount: Number(amount),
        reason: reason || undefined,
      });
      setMessage('Mise à jour enregistrée.');
      setAmount('');
      onUpdated();
    } catch {
      setError('Impossible de mettre à jour cette valeur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
      <p className="font-semibold text-slate-900">{label}</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setAction('add')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
            action === 'add' ? 'bg-[#E91E8C] text-white' : 'bg-white border border-slate-200 text-slate-600'
          }`}
        >
          Ajouter
        </button>
        <button
          type="button"
          onClick={() => setAction('set')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
            action === 'set' ? 'bg-[#E91E8C] text-white' : 'bg-white border border-slate-200 text-slate-600'
          }`}
        >
          Définir
        </button>
      </div>
      <input
        type="number"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Montant"
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
        required
      />
      {(target === 'company_wallet' || target === 'company_minutes') && (
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Motif (optionnel)"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
        />
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {message && <p className="text-sm text-emerald-600">{message}</p>}
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold disabled:opacity-50"
      >
        {loading ? 'Enregistrement…' : 'Appliquer'}
      </button>
    </form>
  );
}
