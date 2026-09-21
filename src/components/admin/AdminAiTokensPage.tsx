import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, RefreshCw, Search, Sparkles } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { adminApi } from '../../lib/api';
import { AdminToggle } from './adminPageShell';
import { FinancialAdjustForm, InfoCard, SectionCard } from './adminUiUtils';
import { WalletLedgerList } from './WalletLedgerList';
import { buildAccountLedger } from './walletLedger';

type AiProviders = {
  openai: boolean;
  anthropic: boolean;
  gemini: boolean;
};

const DEFAULT_PROVIDERS: AiProviders = {
  openai: true,
  anthropic: true,
  gemini: true,
};

const PROVIDER_ROWS: Array<{ key: keyof AiProviders; label: string; hint: string }> = [
  { key: 'openai', label: 'OpenAI', hint: 'GPT / filtres OpenAI' },
  { key: 'anthropic', label: 'Claude (Anthropic)', hint: 'Fallback & modèles Claude' },
  { key: 'gemini', label: 'Gemini (Google)', hint: 'Modèles Gemini / Vertex' },
];

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
  const [providers, setProviders] = useState<AiProviders>(DEFAULT_PROVIDERS);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [savingProviders, setSavingProviders] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providerMessage, setProviderMessage] = useState<string | null>(null);

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
      setProviders(DEFAULT_PROVIDERS);
      return;
    }
    setLoadingDetail(true);
    setProviderMessage(null);
    adminApi
      .userDetail(selectedUserId)
      .then((response) => {
        setDetail(response.data);
        const raw = response.data?.financials?.tokens?.aiProviders;
        setProviders({
          openai: raw?.openai !== false,
          anthropic: raw?.anthropic !== false,
          gemini: raw?.gemini !== false,
        });
      })
      .catch(() => setError('Impossible de charger les tokens AI de ce compte.'))
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
  const isCompany = detail?.profile?.type === 'company';

  const ledgerLines = useMemo(() => {
    if (!selectedUserId || !financials || !isCompany) return [];
    return buildAccountLedger(financials, true, false).filter(
      (line) => line.category === 'Tokens AI',
    );
  }, [selectedUserId, financials, isCompany]);

  const refreshAll = () => {
    loadOverview();
    loadDetail();
  };

  const saveProviders = async () => {
    if (!selectedUserId) return;
    setSavingProviders(true);
    setError(null);
    setProviderMessage(null);
    try {
      await adminApi.updateFinancials(selectedUserId, {
        target: 'company_ai_providers',
        providers,
      });
      setProviderMessage('Filtres providers enregistrés.');
      loadDetail();
    } catch {
      setError('Impossible d’enregistrer les filtres providers.');
    } finally {
      setSavingProviders(false);
    }
  };

  if (loadingOverview && accounts.length === 0) {
    return <p className="text-violet-600/70 animate-pulse">Chargement des tokens AI…</p>;
  }

  return (
    <div className="space-y-6 admin-stagger">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="admin-page-title flex items-center gap-3">
            <Sparkles className="text-fuchsia-600" /> Tokens AI
          </h1>
          <p className="admin-page-subtitle">
            Solde prepaid et filtres providers (OpenAI, Claude, Gemini) par company
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
          <InfoCard label="Solde tokens AI" value={String(tokens?.tokens ?? 0)} />
          <InfoCard label="Tokens achetés" value={String(tokens?.purchasedTokens ?? 0)} />
          <InfoCard label="Tokens consommés" value={String(tokens?.consumedTokens ?? 0)} />
          <InfoCard
            label="Providers actifs"
            value={`${[providers.openai && 'OpenAI', providers.anthropic && 'Claude', providers.gemini && 'Gemini']
              .filter(Boolean)
              .join(' · ') || 'Aucun'}`}
          />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6">
        <SectionCard title="Companies" description="Sélectionnez une company pour gérer ses tokens AI.">
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
                Choisissez une company à gauche pour créditer des tokens AI et activer / désactiver
                OpenAI, Claude ou Gemini.
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
                  title="Solde tokens AI"
                  description="Ajustement manuel du prepaid AI (crédits consommés à l’usage)."
                >
                  <FinancialAdjustForm
                    label="Ajuster les tokens AI"
                    target="company_ai_tokens"
                    userId={selectedUserId}
                    onUpdated={refreshAll}
                    amountPlaceholder="Nombre de tokens"
                  />
                </SectionCard>

                <SectionCard
                  title="Filtres providers"
                  description="Désactivez un provider pour bloquer son usage côté company."
                >
                  <div className="space-y-4">
                    {PROVIDER_ROWS.map((row) => (
                      <div
                        key={row.key}
                        className="flex items-center justify-between gap-4 admin-info-tile"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">{row.label}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{row.hint}</p>
                        </div>
                        <AdminToggle
                          checked={providers[row.key]}
                          onChange={(value) =>
                            setProviders((current) => ({ ...current, [row.key]: value }))
                          }
                          label={row.label}
                        />
                      </div>
                    ))}
                    {providerMessage && (
                      <p className="text-sm text-emerald-600">{providerMessage}</p>
                    )}
                    <button
                      type="button"
                      disabled={savingProviders}
                      onClick={saveProviders}
                      className="admin-btn-dark disabled:opacity-50"
                    >
                      {savingProviders ? 'Enregistrement…' : 'Enregistrer les filtres'}
                    </button>
                  </div>
                </SectionCard>

                <SectionCard
                  title="Journal d’usage AI"
                  description={`${ledgerLines.length} ligne(s) récente(s)`}
                >
                  <WalletLedgerList
                    lines={ledgerLines}
                    emptyMessage="Aucun usage de tokens AI enregistré pour cette company."
                  />
                </SectionCard>
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
}
