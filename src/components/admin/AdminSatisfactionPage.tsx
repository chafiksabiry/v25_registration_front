import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Search, Star } from 'lucide-react';
import { adminApi } from '../../lib/api';
import { DataTable, InfoCard, SectionCard, formatDate } from './adminUiUtils';
import { AdminPageHeader } from './adminPageShell';

type SatisfactionRow = {
  agentId: string;
  userId: string | null;
  name: string;
  email: string;
  profileStatus: string | null;
  score: number | null;
  comment: string;
  skipped: boolean;
  submittedAt: string | null;
};

export default function AdminSatisfactionPage() {
  const [items, setItems] = useState<SatisfactionRow[]>([]);
  const [summary, setSummary] = useState<{
    total: number;
    withScore: number;
    averageScore: number | null;
  } | null>(null);
  const [search, setSearch] = useState('');
  const [scoredOnly, setScoredOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    adminApi
      .onboardingSatisfaction({
        search: search.trim() || undefined,
        scoredOnly: scoredOnly || undefined,
        limit: 100,
      })
      .then((response) => {
        setItems(response.data?.items || []);
        setSummary(response.data?.summary || null);
      })
      .catch(() => setError('Impossible de charger les avis onboarding.'))
      .finally(() => setLoading(false));
  }, [search, scoredOnly]);

  useEffect(() => {
    load();
  }, [load]);

  const rows = items.map((item) => [
    item.userId ? (
      <Link
        key="name"
        to={`/admin/users/${item.userId}`}
        className="font-semibold text-violet-700 hover:underline"
      >
        {item.name}
      </Link>
    ) : (
      <span key="name" className="font-semibold text-slate-800">
        {item.name}
      </span>
    ),
    <span key="email" className="text-slate-600">
      {item.email}
    </span>,
    item.score != null ? (
      <span key="score" className="inline-flex items-center gap-1 font-bold text-amber-600">
        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        {item.score}/5
      </span>
    ) : (
      <span key="score" className="text-slate-400">
        {item.skipped ? 'Passé' : '—'}
      </span>
    ),
    <span key="comment" className="max-w-md block text-slate-700 whitespace-pre-wrap">
      {item.comment || '—'}
    </span>,
    <span key="date" className="whitespace-nowrap text-slate-500">
      {item.submittedAt ? formatDate(item.submittedAt) : '—'}
    </span>,
  ]);

  return (
    <div className="space-y-6 admin-stagger">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <AdminPageHeader
          icon={Star}
          title="Avis onboarding"
          subtitle="Notes et commentaires laissés par les REPs après publication (popup marketplace)."
          badge="Feedback"
        />
        <button
          type="button"
          onClick={load}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-50"
        >
          <RefreshCw size={16} /> Actualiser
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <InfoCard label="Réponses" value={String(summary?.total ?? '—')} />
        <InfoCard label="Avec note" value={String(summary?.withScore ?? '—')} />
        <InfoCard
          label="Note moyenne"
          value={summary?.averageScore != null ? `${summary.averageScore}/5` : '—'}
        />
      </div>

      <SectionCard title="Filtres">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher nom, email, commentaire…"
              className="w-full rounded-xl border border-violet-100 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
            />
          </div>
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
            <input
              type="checkbox"
              checked={scoredOnly}
              onChange={(e) => setScoredOnly(e.target.checked)}
              className="rounded border-violet-300 text-violet-600 focus:ring-violet-200"
            />
            Notes uniquement
          </label>
        </div>
      </SectionCard>

      <SectionCard title="Liste des avis">
        {loading ? (
          <p className="py-6 text-sm text-slate-500">Chargement…</p>
        ) : (
          <DataTable
            headers={['REP', 'Email', 'Note', 'Commentaire', 'Date']}
            rows={rows}
            emptyMessage="Aucun avis onboarding pour le moment."
          />
        )}
      </SectionCard>
    </div>
  );
}
