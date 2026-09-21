import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, RefreshCw, Search, Sparkles } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { adminApi } from '../../lib/api';
import { InfoCard, SectionCard, formatDate } from './adminUiUtils';

type ProviderKey = 'all' | 'openai' | 'anthropic' | 'gemini' | 'estimated' | 'other';

type ProviderStats = {
  tokensUsed: number;
  requests: number;
  inputTokens: number;
  outputTokens: number;
  lastUsedAt?: string | null;
};

const PROVIDER_FILTERS: Array<{ key: ProviderKey; label: string }> = [
  { key: 'all', label: 'Tous' },
  { key: 'openai', label: 'OpenAI' },
  { key: 'anthropic', label: 'Claude' },
  { key: 'gemini', label: 'Gemini' },
];

function normalizeProvider(raw?: string | null): Exclude<ProviderKey, 'all'> {
  const key = String(raw || '').toLowerCase().trim();
  if (key === 'openai') return 'openai';
  if (key === 'anthropic' || key === 'claude') return 'anthropic';
  if (key === 'gemini' || key === 'google') return 'gemini';
  if (key === 'estimated') return 'estimated';
  return 'other';
}

function providerLabel(key: string): string {
  switch (normalizeProvider(key)) {
    case 'openai':
      return 'OpenAI';
    case 'anthropic':
      return 'Claude';
    case 'gemini':
      return 'Gemini';
    case 'estimated':
      return 'Estimé';
    default:
      return key || 'Autre';
  }
}

function formatTokens(value?: number | null) {
  return new Intl.NumberFormat('fr-FR').format(Math.max(0, Math.round(Number(value || 0))));
}

function emptyStats(): ProviderStats {
  return { tokensUsed: 0, requests: 0, inputTokens: 0, outputTokens: 0, lastUsedAt: null };
}

export default function AdminAiTokensPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedUserId = searchParams.get('userId') || '';
  const [accounts, setAccounts] = useState<
    Array<{
      userId: string;
      fullName: string;
      email: string;
      typeUser: string;
      companyName?: string;
    }>
  >([]);
  const [detail, setDetail] = useState<Record<string, any> | null>(null);
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState<ProviderKey>('all');
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOverview = useCallback(() => {
    setLoadingOverview(true);
    setError(null);
    adminApi
      .walletOverview()
      .then((response) => {
        const rows = (response.data.accounts || []).filter(
          (account: { typeUser: string }) => account.typeUser === 'company',
        );
        setAccounts(rows);
      })
      .catch(() => setError('Impossible de charger la liste des companies.'))
      .finally(() => setLoadingOverview(false));
  }, []);

  const loadDetail = useCallback(() => {
    if (!selectedUserId) {
      setDetail(null);
      return;
    }
    setLoadingDetail(true);
    adminApi
      .userDetail(selectedUserId)
      .then((response) => setDetail(response.data))
      .catch(() => setError('Impossible de charger la consommation AI de ce compte.'))
      .finally(() => setLoadingDetail(false));
  }, [selectedUserId]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const filteredAccounts = useMemo(() => {
    if (!search) return accounts;
    const q = search.toLowerCase();
    return accounts.filter((account) => {
      const haystack = `${account.fullName} ${account.email} ${account.companyName || ''}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [accounts, search]);

  const selectedAccount = accounts.find((a) => a.userId === selectedUserId);
  const financials = detail?.financials as Record<string, any> | undefined;
  const tokens = financials?.tokens;
  const byProvider = (financials?.tokenUsageByProvider || {}) as Record<string, ProviderStats>;
  const isCompany = detail?.profile?.type === 'company';

  const usageRows = useMemo(() => {
    const rows = (financials?.tokenUsage || []) as Array<Record<string, any>>;
    if (providerFilter === 'all') return rows;
    return rows.filter((row) => normalizeProvider(row.provider || row.meta?.provider) === providerFilter);
  }, [financials?.tokenUsage, providerFilter]);

  const refreshAll = () => {
    loadOverview();
    loadDetail();
  };

  if (loadingOverview && accounts.length === 0) {
    return <p className="text-violet-600/70 animate-pulse">Chargement de la consommation AI…</p>;
  }

  const openai = byProvider.openai || emptyStats();
  const anthropic = byProvider.anthropic || emptyStats();
  const gemini = byProvider.gemini || emptyStats();
  const total = byProvider.total || emptyStats();

  return (
    <div className="space-y-6 admin-stagger">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="admin-page-title flex items-center gap-3">
            <Sparkles className="text-fuchsia-600" /> Tokens AI
          </h1>
          <p className="admin-page-subtitle">
            Consommation OpenAI / Claude / Gemini par company
          </p>
        </div>
        <button type="button" onClick={refreshAll} className="admin-btn-secondary">
          <RefreshCw size={16} /> Actualiser
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {selectedUserId && isCompany && financials && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <InfoCard label="Total consommé" value={formatTokens(total.tokensUsed || tokens?.consumedTokens)} />
          <InfoCard label="OpenAI" value={`${formatTokens(openai.tokensUsed)} tok · ${openai.requests || 0} req`} />
          <InfoCard label="Claude" value={`${formatTokens(anthropic.tokensUsed)} tok · ${anthropic.requests || 0} req`} />
          <InfoCard label="Gemini" value={`${formatTokens(gemini.tokensUsed)} tok · ${gemini.requests || 0} req`} />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6">
        <SectionCard title="Companies" description="Sélectionnez une company pour voir sa consommation.">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher…"
              className="admin-input !pl-9 text-sm"
            />
          </div>
          <div className="max-h-[520px] overflow-y-auto space-y-2">
            {filteredAccounts.map((account) => {
              const active = account.userId === selectedUserId;
              return (
                <button
                  key={account.userId}
                  type="button"
                  onClick={() => setSearchParams({ userId: account.userId })}
                  className={`w-full text-left admin-row-card transition-all ${
                    active ? 'ring-2 ring-fuchsia-400/50 bg-fuchsia-50/50' : ''
                  }`}
                >
                  <p className="font-semibold text-slate-900 truncate">
                    {account.companyName || account.fullName}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{account.email}</p>
                </button>
              );
            })}
            {filteredAccounts.length === 0 && (
              <p className="text-sm text-slate-500 px-1">Aucune company trouvée.</p>
            )}
          </div>
        </SectionCard>

        <div className="space-y-4">
          {!selectedUserId && (
            <SectionCard title="Sélection requise">
              <p className="text-sm text-slate-500">
                Choisissez une company à gauche pour afficher la consommation token par provider
                (OpenAI, Claude, Gemini).
              </p>
            </SectionCard>
          )}

          {selectedUserId && (
            <div className="admin-card p-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-lg font-bold text-slate-900">
                  {selectedAccount?.companyName ||
                    selectedAccount?.fullName ||
                    detail?.user?.fullName}
                </p>
                <p className="text-sm text-slate-500">{detail?.user?.email}</p>
              </div>
              <Link to={`/admin/users/${selectedUserId}`} className="admin-link text-sm">
                <ArrowLeft size={14} /> Voir le profil
              </Link>
            </div>
          )}

          {selectedUserId && loadingDetail ? (
            <p className="text-slate-500">Chargement…</p>
          ) : (
            selectedUserId &&
            isCompany && (
              <>
                <SectionCard
                  title="Répartition par provider"
                  description="Totaux agrégés depuis le journal d’usage AI."
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { key: 'openai', label: 'OpenAI', stats: openai },
                      { key: 'anthropic', label: 'Claude', stats: anthropic },
                      { key: 'gemini', label: 'Gemini', stats: gemini },
                    ].map((card) => (
                      <button
                        key={card.key}
                        type="button"
                        onClick={() => setProviderFilter(card.key as ProviderKey)}
                        className={`admin-info-tile text-left transition-all ${
                          providerFilter === card.key ? 'ring-2 ring-fuchsia-400/50' : ''
                        }`}
                      >
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {card.label}
                        </p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">
                          {formatTokens(card.stats.tokensUsed)}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {card.stats.requests || 0} requête(s)
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          in {formatTokens(card.stats.inputTokens)} · out{' '}
                          {formatTokens(card.stats.outputTokens)}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Dernier usage : {formatDate(card.stats.lastUsedAt)}
                        </p>
                      </button>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard
                  title="Journal de consommation"
                  description={`${usageRows.length} ligne(s) · solde restant ${formatTokens(tokens?.tokens)}`}
                >
                  <div className="flex flex-wrap gap-2 mb-4">
                    {PROVIDER_FILTERS.map((filter) => (
                      <button
                        key={filter.key}
                        type="button"
                        onClick={() => setProviderFilter(filter.key)}
                        className={`admin-filter-pill text-xs ${
                          providerFilter === filter.key
                            ? 'admin-filter-pill--active'
                            : 'admin-filter-pill--idle'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>

                  {usageRows.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      Aucune consommation AI enregistrée pour ce filtre.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs uppercase tracking-wide text-slate-500 border-b border-slate-200">
                            <th className="py-2 pr-3 font-semibold">Date</th>
                            <th className="py-2 pr-3 font-semibold">Provider</th>
                            <th className="py-2 pr-3 font-semibold">Outil</th>
                            <th className="py-2 pr-3 font-semibold">Modèle</th>
                            <th className="py-2 pr-3 font-semibold text-right">Tokens</th>
                          </tr>
                        </thead>
                        <tbody>
                          {usageRows.map((row) => (
                            <tr
                              key={String(row._id || row.id || row.usageId)}
                              className="border-b border-slate-100 last:border-0"
                            >
                              <td className="py-2.5 pr-3 text-slate-600 whitespace-nowrap">
                                {formatDate(row.createdAt)}
                              </td>
                              <td className="py-2.5 pr-3 font-medium text-slate-900">
                                {providerLabel(row.provider || row.meta?.provider)}
                              </td>
                              <td className="py-2.5 pr-3 text-slate-600">{row.tool || '—'}</td>
                              <td className="py-2.5 pr-3 text-slate-500">{row.model || '—'}</td>
                              <td className="py-2.5 pr-3 text-right font-semibold text-slate-900">
                                {formatTokens(row.tokensUsed)}
                                {row.estimated ? (
                                  <span className="ml-1 text-xs font-normal text-amber-600">est.</span>
                                ) : null}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </SectionCard>
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
}
