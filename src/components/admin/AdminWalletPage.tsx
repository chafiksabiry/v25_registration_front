import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, RefreshCw, Search, Wallet } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { adminApi } from '../../lib/api';
import {
  DataTable,
  FinancialAdjustForm,
  InfoCard,
  SectionCard,
  formatCents,
  formatDate,
  formatMoney,
} from './adminUiUtils';

type WalletTab = 'finances' | 'telephony' | 'commissions' | 'activity';

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
  const [tab, setTab] = useState<WalletTab>('finances');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'company' | 'rep'>('all');
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

  const tabs: { id: WalletTab; label: string; show: boolean }[] = [
    { id: 'finances', label: 'Finances', show: Boolean(selectedUserId && financials) },
    { id: 'telephony', label: 'Téléphonie', show: Boolean(selectedUserId && isCompany) },
    { id: 'commissions', label: 'Commissions HARX', show: Boolean(selectedUserId && financials) },
    { id: 'activity', label: 'Activité', show: Boolean(selectedUserId && financials) },
  ];

  const refreshAll = () => {
    loadOverview();
    loadDetail();
  };

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
            Gestion des minutes, téléphonie, commissions HARX et wallets
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

      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InfoCard label="Wallet HARX" value={formatMoney(overview?.harxWallet?.balance)} />
        <InfoCard
          label="Revenus HARX (lifetime)"
          value={formatMoney(overview?.harxWallet?.lifetimeEarnings)}
        />
        <InfoCard
          label="Comptes gérables"
          value={String(overview?.accounts?.length ?? 0)}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6">
        <SectionCard title="Comptes" description="Sélectionnez un company ou rep à gérer.">
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
          <div className="flex gap-2 mb-3">
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
                  {account.typeUser === 'company' && (
                    <p className="text-xs text-slate-600 mt-1">
                      {formatMoney(account.summary?.walletBalance)} · {account.summary?.minutes ?? 0} min ·{' '}
                      {account.summary?.phoneLines ?? 0} lignes
                    </p>
                  )}
                  {account.typeUser === 'rep' && (
                    <p className="text-xs text-slate-600 mt-1">
                      {formatMoney(account.summary?.availableBalance)} disponible
                    </p>
                  )}
                </button>
              );
            })}
            {!filteredAccounts.length && (
              <p className="text-sm text-slate-500 py-4">Aucun compte trouvé.</p>
            )}
          </div>
        </SectionCard>

        <div className="space-y-4">
          {!selectedUserId ? (
            <SectionCard title="Sélection requise" description="Choisissez un compte dans la liste.">
              <p className="text-sm text-slate-500">
                Les finances, la téléphonie et les commissions se gèrent ici — pas dans la fiche profil utilisateur.
              </p>
              {overview?.recentCommissions?.length ? (
                <>
                  <h3 className="font-bold text-slate-900 mt-4">Dernières commissions HARX (plateforme)</h3>
                  <DataTable
                    headers={['Date', 'Type', 'Montant', 'Description']}
                    emptyMessage="Aucune commission."
                    rows={(overview.recentCommissions || []).map((row) => [
                      formatDate(row.createdAt),
                      row.type,
                      formatMoney(row.amount),
                      row.description || '—',
                    ])}
                  />
                </>
              ) : null}
            </SectionCard>
          ) : loadingDetail ? (
            <p className="text-slate-500">Chargement du compte…</p>
          ) : detail ? (
            <>
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <p className="text-lg font-bold text-slate-900">{selectedAccount?.fullName || detail.user.fullName}</p>
                <p className="text-sm text-slate-500">{detail.user.email}</p>
                <Link
                  to={`/admin/users/${selectedUserId}`}
                  className="inline-flex items-center gap-1 text-sm text-[#E91E8C] font-semibold mt-3"
                >
                  <ArrowLeft size={14} /> Voir le profil utilisateur
                </Link>
              </div>

              <div className="flex flex-wrap gap-2">
                {tabs
                  .filter((item) => item.show)
                  .map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTab(item.id)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                        tab === item.id
                          ? 'bg-[#E91E8C] text-white'
                          : 'bg-white border border-slate-200 text-slate-600'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
              </div>

              <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6 space-y-6">
                {tab === 'finances' && financials && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                      {isCompany && (
                        <>
                          <InfoCard label="Solde wallet" value={formatMoney(financials.wallet?.balance)} />
                          <InfoCard label="Minutes restantes" value={String(financials.minutes?.minutes ?? 0)} />
                          <InfoCard label="Minutes achetées" value={String(financials.minutes?.purchasedMinutes ?? 0)} />
                          <InfoCard label="Escrow" value={formatMoney(financials.escrowWallet?.balance)} />
                        </>
                      )}
                      {isRep && (
                        <>
                          <InfoCard label="Solde disponible" value={formatMoney(financials.wallet?.availableBalance)} />
                          <InfoCard label="Commissions en attente" value={formatMoney(financials.wallet?.pendingCommissions)} />
                          <InfoCard label="Retraits en attente" value={formatMoney(financials.wallet?.pendingWithdrawals)} />
                          <InfoCard label="Gains lifetime" value={formatMoney(financials.wallet?.lifetimeEarnings)} />
                        </>
                      )}
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {isCompany && (
                        <>
                          <FinancialAdjustForm
                            label="Gérer les minutes"
                            target="company_minutes"
                            userId={selectedUserId}
                            onUpdated={refreshAll}
                          />
                          <FinancialAdjustForm
                            label="Gérer le wallet entreprise (€)"
                            target="company_wallet"
                            userId={selectedUserId}
                            onUpdated={refreshAll}
                          />
                        </>
                      )}
                      {isRep && (
                        <FinancialAdjustForm
                          label="Gérer le wallet REP (€)"
                          target="rep_wallet"
                          userId={selectedUserId}
                          onUpdated={refreshAll}
                        />
                      )}
                    </div>

                    {isCompany && (
                      <>
                        <h3 className="font-bold text-slate-900">Paiements entreprise</h3>
                        <DataTable
                          headers={['Date', 'Objet', 'Montant', 'Statut', 'Fournisseur']}
                          emptyMessage="Aucun paiement."
                          rows={(financials.payments || []).map((payment: any) => [
                            formatDate(payment.createdAt),
                            payment.purpose,
                            formatCents(payment.amount, payment.currency || 'EUR'),
                            payment.status,
                            payment.provider,
                          ])}
                        />
                        <h3 className="font-bold text-slate-900">Mouvements wallet</h3>
                        <DataTable
                          headers={['Date', 'Type', 'Sens', 'Montant', 'Solde après']}
                          emptyMessage="Aucun mouvement wallet."
                          rows={(financials.walletEntries || []).map((entry: any) => [
                            formatDate(entry.createdAt),
                            entry.type,
                            entry.direction,
                            formatMoney(entry.amount, entry.currency || 'EUR'),
                            formatMoney(entry.balanceAfter, entry.currency || 'EUR'),
                          ])}
                        />
                      </>
                    )}

                    {isRep && (
                      <>
                        <h3 className="font-bold text-slate-900">Retraits REP</h3>
                        <DataTable
                          headers={['Date', 'Montant', 'Méthode', 'Statut', 'Référence']}
                          emptyMessage="Aucun retrait."
                          rows={(financials.withdrawals || []).map((row: any) => [
                            formatDate(row.createdAt),
                            formatMoney(row.amount),
                            row.method,
                            row.status,
                            row.reference,
                          ])}
                        />
                      </>
                    )}
                  </>
                )}

                {tab === 'telephony' && isCompany && financials && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <InfoCard label="Lignes" value={String((financials.phoneNumbers || []).length)} />
                      <InfoCard label="Paiements téléphonie" value={String((financials.phoneNumberPayments || []).length)} />
                      <InfoCard label="Abonnements" value={String((financials.subscriptions || []).length)} />
                    </div>
                    <h3 className="font-bold text-slate-900">Numéros de téléphone</h3>
                    <DataTable
                      headers={['Numéro', 'Provider', 'Statut', 'Prix', 'Trial', 'Créé le']}
                      emptyMessage="Aucun numéro."
                      rows={(financials.phoneNumbers || []).map((line: any) => [
                        line.phoneNumber,
                        line.provider,
                        line.status,
                        formatMoney(line.price, line.currency || 'EUR'),
                        line.isTrial ? 'Oui' : 'Non',
                        formatDate(line.createdAt),
                      ])}
                    />
                    <h3 className="font-bold text-slate-900">Paiements lignes</h3>
                    <DataTable
                      headers={['Date', 'Numéro', 'Montant', 'Provider', 'Statut']}
                      emptyMessage="Aucun paiement téléphonie."
                      rows={(financials.phoneNumberPayments || []).map((payment: any) => [
                        formatDate(payment.createdAt),
                        payment.phoneNumber,
                        formatCents(payment.amount, payment.currency || 'EUR'),
                        payment.provider,
                        payment.status,
                      ])}
                    />
                    <h3 className="font-bold text-slate-900">Abonnements</h3>
                    <DataTable
                      headers={['Statut', 'Provider', 'Début', 'Fin']}
                      emptyMessage="Aucun abonnement."
                      rows={(financials.subscriptions || []).map((sub: any) => [
                        sub.status,
                        sub.provider,
                        formatDate(sub.currentPeriodStart),
                        formatDate(sub.currentPeriodEnd),
                      ])}
                    />
                  </>
                )}

                {tab === 'commissions' && financials && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <InfoCard
                        label="Commissions HARX (compte)"
                        value={formatMoney(
                          financials.totals?.harxCommissions ?? financials.totals?.repActivity?.harxShare,
                        )}
                      />
                      {isRep && (
                        <InfoCard label="Part REP cumulée" value={formatMoney(financials.totals?.repShare)} />
                      )}
                      {isCompany && (
                        <InfoCard
                          label="Part HARX activité reps"
                          value={formatMoney(financials.totals?.repActivity?.harxShare)}
                        />
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900">Commissions HARX</h3>
                    <DataTable
                      headers={['Date', 'Type', 'Montant', 'Description']}
                      emptyMessage="Aucune commission."
                      rows={(financials.harxCommissions || []).map((row: any) => [
                        formatDate(row.createdAt),
                        row.type,
                        formatMoney(row.amount),
                        row.description || '—',
                      ])}
                    />
                  </>
                )}

                {tab === 'activity' && financials && (
                  <>
                    <h3 className="font-bold text-slate-900">Transactions REP / activité</h3>
                    <DataTable
                      headers={['Date', 'Type', 'Montant', 'Part REP', 'Part HARX', 'Statut']}
                      emptyMessage="Aucune transaction."
                      rows={(isCompany ? financials.repTransactions : financials.transactions || []).map(
                        (row: any) => [
                          formatDate(row.createdAt),
                          row.type,
                          formatMoney(row.amount),
                          formatMoney(row.repShare),
                          formatMoney(row.harxShare),
                          row.status,
                        ],
                      )}
                    />
                  </>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
