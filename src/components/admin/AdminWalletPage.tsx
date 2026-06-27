import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, RefreshCw, Search, Wallet } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { adminApi } from '../../lib/api';
import { FinancialAdjustForm, InfoCard, SectionCard, formatMoney } from './adminUiUtils';
import { WalletLedgerList } from './WalletLedgerList';
import { buildAccountLedger, buildPlatformLedger, summarizeLedger } from './walletLedger';

type WalletOverview = {
  harxWallet?: { balance?: number; lifetimeEarnings?: number };
  recentCommissions?: Array<Record<string, any>>;
  accounts?: Array<{
    userId: string;
    fullName: string;
    email: string;
    typeUser: string;
    companyName?: string;
    summary?: Record<string, number>;
  }>;
};

export default function AdminWalletPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedUserId = searchParams.get('userId') || '';
  const [overview, setOverview] = useState<WalletOverview | null>(null);
  const [detail, setDetail] = useState<Record<string, any> | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'company' | 'rep'>('all');
  const [ledgerFilter, setLedgerFilter] = useState('all');
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOverview = useCallback(() => {
    setLoadingOverview(true);
    setError(null);
    adminApi
      .walletOverview()
      .then((response) => setOverview(response.data))
      .catch(() => setError('Impossible de charger le wallet admin.'))
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
      .catch(() => setError('Impossible de charger le compte sélectionné.'))
      .finally(() => setLoadingDetail(false));
  }, [selectedUserId]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const filteredAccounts = useMemo(() => {
    const accounts = overview?.accounts || [];
    return accounts.filter((account) => {
      if (typeFilter !== 'all' && account.typeUser !== typeFilter) return false;
      if (!search) return true;
      const haystack = `${account.fullName} ${account.email} ${account.companyName || ''}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }, [overview?.accounts, search, typeFilter]);

  const selectedAccount = overview?.accounts?.find((a) => a.userId === selectedUserId);
  const financials = detail?.financials as Record<string, any> | undefined;
  const isCompany = detail?.profile?.type === 'company';
  const isRep = detail?.profile?.type === 'rep';

  const ledgerLines = useMemo(() => {
    if (selectedUserId && financials) {
      return buildAccountLedger(financials, Boolean(isCompany), Boolean(isRep));
    }
    return buildPlatformLedger(overview?.recentCommissions || []);
  }, [selectedUserId, financials, isCompany, isRep, overview?.recentCommissions]);

  const filteredLedger = useMemo(() => {
    if (ledgerFilter === 'all') return ledgerLines;
    return ledgerLines.filter((line) => line.category === ledgerFilter);
  }, [ledgerLines, ledgerFilter]);

  const ledgerSummary = useMemo(() => summarizeLedger(filteredLedger), [filteredLedger]);

  const ledgerCategories = useMemo(() => {
    const set = new Set(ledgerLines.map((line) => line.category));
    return ['all', ...Array.from(set)];
  }, [ledgerLines]);

  const refreshAll = () => {
    loadOverview();
    loadDetail();
  };

  const phoneSpend = useMemo(() => {
    if (!financials) return 0;
    const payments = (financials.phoneNumberPayments || [])
      .filter((p: any) => p.status === 'succeeded')
      .reduce((sum: number, p: any) => sum + (p.amount || 0) / 100, 0);
    const lines = (financials.phoneNumbers || []).reduce(
      (sum: number, line: any) => sum + (line.price || 0),
      0,
    );
    return payments + lines;
  }, [financials]);

  if (loadingOverview && !overview) {
    return <p className="text-slate-500">Chargement du wallet…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Wallet className="text-[#E91E8C]" /> Wallet & finances
          </h1>
          <p className="text-slate-500 mt-1">
            Vue consolidée : wallet, minutes, téléphonie, commissions et activité REP
          </p>
        </div>
        <button
          type="button"
          onClick={refreshAll}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold"
        >
          <RefreshCw size={16} /> Actualiser
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <InfoCard label="Wallet HARX (plateforme)" value={formatMoney(overview?.harxWallet?.balance)} />
        <InfoCard
          label="Revenus HARX lifetime"
          value={formatMoney(overview?.harxWallet?.lifetimeEarnings)}
        />
        {selectedUserId && isCompany && financials && (
          <>
            <InfoCard label="Wallet entreprise" value={formatMoney(financials.wallet?.balance)} />
            <InfoCard label="Minutes restantes" value={`${financials.minutes?.minutes ?? 0} min`} />
            <InfoCard label="Dépenses téléphonie" value={formatMoney(phoneSpend)} />
            <InfoCard
              label="Commissions HARX (compte)"
              value={formatMoney(financials.totals?.harxCommissions)}
            />
          </>
        )}
        {selectedUserId && isRep && financials && (
          <>
            <InfoCard label="Solde REP disponible" value={formatMoney(financials.wallet?.availableBalance)} />
            <InfoCard label="Gains lifetime" value={formatMoney(financials.wallet?.lifetimeEarnings)} />
            <InfoCard label="Part REP cumulée" value={formatMoney(financials.totals?.repShare)} />
            <InfoCard label="Commissions HARX liées" value={formatMoney(financials.totals?.harxCommissions)} />
          </>
        )}
        {!selectedUserId && (
          <InfoCard label="Lignes journal (plateforme)" value={String(ledgerLines.length)} />
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6">
        <SectionCard title="Comptes" description="Sélectionnez un company ou rep.">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher…"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {(['all', 'company', 'rep'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setTypeFilter(filter)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  typeFilter === filter
                    ? 'bg-[#E91E8C] text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {filter === 'all' ? 'Tous' : filter === 'company' ? 'Companies' : 'REPs'}
              </button>
            ))}
          </div>
          <div className="max-h-[420px] overflow-y-auto space-y-2">
            <button
              type="button"
              onClick={() => setSearchParams({})}
              className={`w-full text-left rounded-xl border px-3 py-3 transition-colors ${
                !selectedUserId
                  ? 'border-[#E91E8C] bg-[#E91E8C]/5'
                  : 'border-slate-100 hover:border-[#E91E8C]/30 hover:bg-slate-50'
              }`}
            >
              <p className="font-semibold text-slate-900">Vue plateforme HARX</p>
              <p className="text-xs text-slate-500 mt-1">Commissions globales récentes</p>
            </button>
            {filteredAccounts.map((account) => {
              const active = account.userId === selectedUserId;
              return (
                <button
                  key={account.userId}
                  type="button"
                  onClick={() => setSearchParams({ userId: account.userId })}
                  className={`w-full text-left rounded-xl border px-3 py-3 transition-colors ${
                    active
                      ? 'border-[#E91E8C] bg-[#E91E8C]/5'
                      : 'border-slate-100 hover:border-[#E91E8C]/30 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-semibold text-slate-900 truncate">{account.fullName}</p>
                  <p className="text-xs text-slate-500 truncate">{account.email}</p>
                  <p className="text-xs font-medium text-[#E91E8C] mt-1 uppercase">{account.typeUser}</p>
                </button>
              );
            })}
          </div>
        </SectionCard>

        <div className="space-y-4">
          {selectedUserId && (
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-lg font-bold text-slate-900">
                  {selectedAccount?.fullName || detail?.user?.fullName}
                </p>
                <p className="text-sm text-slate-500">{detail?.user?.email}</p>
              </div>
              <Link
                to={`/admin/users/${selectedUserId}`}
                className="inline-flex items-center gap-1 text-sm text-[#E91E8C] font-semibold"
              >
                <ArrowLeft size={14} /> Voir le profil
              </Link>
            </div>
          )}

          {selectedUserId && loadingDetail ? (
            <p className="text-slate-500">Chargement du journal…</p>
          ) : (
            <>
              {(isCompany || isRep) && selectedUserId && (
                <SectionCard title="Actions admin" description="Ajustements manuels du solde.">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {isCompany && (
                      <>
                        <FinancialAdjustForm
                          label="Ajuster les minutes"
                          target="company_minutes"
                          userId={selectedUserId}
                          onUpdated={refreshAll}
                        />
                        <FinancialAdjustForm
                          label="Ajuster le wallet entreprise (€)"
                          target="company_wallet"
                          userId={selectedUserId}
                          onUpdated={refreshAll}
                        />
                      </>
                    )}
                    {isRep && (
                      <FinancialAdjustForm
                        label="Ajuster le wallet REP (€)"
                        target="rep_wallet"
                        userId={selectedUserId}
                        onUpdated={refreshAll}
                      />
                    )}
                  </div>
                </SectionCard>
              )}

              <SectionCard
                title="Journal des opérations"
                description={`${filteredLedger.length} ligne(s) · crédits ${formatMoney(ledgerSummary.credits)} · débits ${formatMoney(ledgerSummary.debits)}`}
              >
                <div className="flex flex-wrap gap-2 mb-4">
                  {ledgerCategories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setLedgerFilter(category)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        ledgerFilter === category
                          ? 'bg-[#E91E8C] text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {category === 'all' ? 'Tout' : category}
                    </button>
                  ))}
                </div>
                <WalletLedgerList
                  lines={filteredLedger}
                  emptyMessage="Aucune opération enregistrée pour ce compte."
                />
              </SectionCard>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
