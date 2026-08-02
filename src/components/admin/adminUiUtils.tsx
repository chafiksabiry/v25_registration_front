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
    <div className="admin-info-tile">
      <p className="admin-info-label">{label}</p>
      <div className="admin-info-value">{value}</div>
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
    success: 'admin-badge admin-badge--success',
    warning: 'admin-badge admin-badge--warning',
    danger: 'admin-badge admin-badge--danger',
    neutral: 'admin-badge admin-badge--neutral',
  };
  return <span className={tones[tone]}>{label}</span>;
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
    <section className="admin-section space-y-4">
      <div className="pl-3">
        <h2 className="admin-section-title">{title}</h2>
        {description && <p className="admin-section-desc">{description}</p>}
      </div>
      <div className="pl-3">{children}</div>
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
    <div className="overflow-x-auto rounded-xl border border-violet-100/80">
      <table className="admin-table min-w-full text-sm">
        <thead className="text-left text-slate-500">
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
            <tr key={index} className="border-t border-violet-50/80">
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
    <form onSubmit={submit} className="admin-info-tile space-y-3">
      <p className="font-semibold text-slate-900">{label}</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setAction('add')}
          className={`admin-filter-pill ${action === 'add' ? 'admin-filter-pill--active' : 'admin-filter-pill--idle'}`}
        >
          Ajouter
        </button>
        <button
          type="button"
          onClick={() => setAction('set')}
          className={`admin-filter-pill ${action === 'set' ? 'admin-filter-pill--active' : 'admin-filter-pill--idle'}`}
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
        className="admin-input !pl-3"
        required
      />
      {(target === 'company_wallet' || target === 'company_minutes') && (
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Motif (optionnel)"
          className="admin-input !pl-3"
        />
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {message && <p className="text-sm text-emerald-600">{message}</p>}
      <button
        type="submit"
        disabled={loading}
        className="admin-btn-dark disabled:opacity-50"
      >
        {loading ? 'Enregistrement…' : 'Appliquer'}
      </button>
    </form>
  );
}
