import React from 'react';
import { adminApi } from '../../lib/api';
import { ADMIN_GRADIENT, ADMIN_THEME } from '../../lib/adminTheme';

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

export function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumb?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0 space-y-2">
        {breadcrumb}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
          {description && <p className="text-slate-500 mt-1 text-sm sm:text-base">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export function AdminButton({
  children,
  variant = 'primary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'dark';
}) {
  const styles = {
    primary:
      'text-white shadow-sm hover:opacity-95 disabled:opacity-50',
    secondary:
      'bg-white border text-slate-700 hover:bg-slate-50 disabled:opacity-50',
    ghost: 'text-slate-600 hover:bg-slate-100 disabled:opacity-50',
    dark: 'bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50',
  };

  return (
    <button
      type="button"
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${styles[variant]} ${className}`}
      style={
        variant === 'primary'
          ? { backgroundImage: ADMIN_GRADIENT }
          : variant === 'secondary'
            ? { borderColor: ADMIN_THEME.border }
            : undefined
      }
      {...props}
    >
      {children}
    </button>
  );
}

export function AdminLinkButton({
  children,
  variant = 'secondary',
  className = '',
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: 'primary' | 'secondary' | 'dark';
}) {
  const styles = {
    primary: 'text-white shadow-sm hover:opacity-95',
    secondary: 'bg-white border text-slate-700 hover:bg-slate-50',
    dark: 'bg-slate-900 text-white hover:bg-slate-800',
  };

  return (
    <a
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${styles[variant]} ${className}`}
      style={
        variant === 'primary'
          ? { backgroundImage: ADMIN_GRADIENT }
          : variant === 'secondary'
            ? { borderColor: ADMIN_THEME.border }
            : undefined
      }
      {...props}
    >
      {children}
    </a>
  );
}

export function StatCard({
  label,
  value,
  accent = 'text-slate-900',
  hint,
}: {
  label: string;
  value: React.ReactNode;
  accent?: string;
  hint?: string;
}) {
  return (
    <div
      className="rounded-2xl bg-white p-5 transition-shadow hover:shadow-md"
      style={{ border: `1px solid ${ADMIN_THEME.border}`, boxShadow: ADMIN_THEME.shadow }}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`mt-2 text-3xl font-bold tracking-tight ${accent}`}>{value}</p>
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

export function InfoCard({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={[
        'rounded-xl bg-white transition-colors hover:border-slate-200',
        compact ? 'px-3 py-2.5' : 'px-4 py-3.5',
      ].join(' ')}
      style={{ border: `1px solid ${ADMIN_THEME.border}` }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <div className={`${compact ? 'mt-0.5 text-sm' : 'mt-1.5 text-sm'} font-semibold text-slate-900 break-words`}>
        {value}
      </div>
    </div>
  );
}

export function StatusBadge({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'success' | 'warning' | 'danger' | 'neutral' | 'brand';
}) {
  const tones = {
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
    warning: 'bg-amber-50 text-amber-800 ring-amber-600/15',
    danger: 'bg-red-50 text-red-700 ring-red-600/15',
    neutral: 'bg-slate-100 text-slate-600 ring-slate-500/10',
    brand: 'bg-[#E6188D]/10 text-[#C2186F] ring-[#E6188D]/20',
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${tones[tone]}`}>
      {label}
    </span>
  );
}

export function SectionCard({
  title,
  description,
  children,
  accent = false,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <section
      className="rounded-2xl bg-white overflow-hidden"
      style={{ border: `1px solid ${ADMIN_THEME.border}`, boxShadow: ADMIN_THEME.shadow }}
    >
      <div
        className={[
          'px-5 py-4 border-b border-slate-100',
          accent ? 'border-l-4 border-l-[#E6188D]' : '',
        ].join(' ')}
      >
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
      </div>
      <div className="p-5 space-y-4">{children}</div>
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
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50/80 text-left text-slate-500">
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
