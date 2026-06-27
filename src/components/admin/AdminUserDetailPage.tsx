import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { adminApi } from '../../lib/api';

type TabId = 'profile' | 'financials' | 'telephony' | 'commissions' | 'activity';

type UserDetail = {
  user: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
    typeUser?: string | null;
    isVerified?: boolean;
    createdAt?: string;
  };
  onboarding?: {
    display: string;
    statusLabel: string;
    phaseStatus: string;
  } | null;
  profile?: {
    type: 'rep' | 'company';
    agent?: Record<string, unknown> | null;
    company?: Record<string, unknown> | null;
    onboardingProgress?: Record<string, unknown> | null;
  } | null;
  financials?: Record<string, unknown> | null;
  platform?: {
    harxWallet?: {
      balance?: number;
      lifetimeEarnings?: number;
    } | null;
  } | null;
};

function formatMoney(value?: number | null, currency = 'EUR') {
  if (value == null || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(value);
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString('fr-FR');
}

function formatCents(value?: number | null, currency = 'EUR') {
  if (value == null || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(value / 100);
}

function InfoCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900 break-all">{value}</p>
    </div>
  );
}

function DataTable({
  headers,
  rows,
  emptyMessage,
}: {
  headers: string[];
  rows: React.ReactNode[][];
  emptyMessage: string;
}) {
  if (!rows.length) {
    return <p className="text-sm text-slate-500">{emptyMessage}</p>;
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
            <tr key={index} className="border-t border-slate-100">
              {cells.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3 text-slate-700 whitespace-nowrap">
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

function FinancialAdjustForm({
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
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [action, setAction] = useState<'add' | 'set'>('add');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    <form onSubmit={submit} className="rounded-xl border border-slate-100 p-4 space-y-3">
      <p className="font-semibold text-slate-900">{label}</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setAction('add')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
            action === 'add' ? 'bg-[#E91E8C] text-white' : 'bg-slate-100 text-slate-600'
          }`}
        >
          Ajouter
        </button>
        <button
          type="button"
          onClick={() => setAction('set')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
            action === 'set' ? 'bg-[#E91E8C] text-white' : 'bg-slate-100 text-slate-600'
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
        className="w-full rounded-lg border border-slate-200 px-3 py-2"
        required
      />
      {(target === 'company_wallet' || target === 'company_minutes') && (
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Motif (optionnel)"
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
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

export default function AdminUserDetailPage() {
  const { userId = '' } = useParams();
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [tab, setTab] = useState<TabId>('profile');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDetail = useCallback(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    adminApi
      .userDetail(userId)
      .then((response) => setDetail(response.data))
      .catch(() => setError('Impossible de charger le détail utilisateur.'))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const tabs: { id: TabId; label: string; show: boolean }[] = [
    { id: 'profile', label: 'Profil', show: true },
    { id: 'financials', label: 'Finances', show: Boolean(detail?.financials) },
    { id: 'telephony', label: 'Téléphonie', show: detail?.profile?.type === 'company' },
    { id: 'commissions', label: 'Commissions HARX', show: Boolean(detail?.financials) },
    { id: 'activity', label: 'Activité', show: Boolean(detail?.financials) },
  ];

  const financials = detail?.financials as Record<string, any> | null | undefined;
  const profile = detail?.profile;
  const isCompany = profile?.type === 'company';
  const isRep = profile?.type === 'rep';

  if (loading) {
    return <p className="text-slate-500">Chargement du profil…</p>;
  }

  if (error || !detail) {
    return (
      <div className="space-y-4">
        <Link to="/admin/users" className="inline-flex items-center gap-2 text-[#E91E8C] font-semibold">
          <ArrowLeft size={18} /> Retour
        </Link>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link to="/admin/users" className="inline-flex items-center gap-2 text-[#E91E8C] font-semibold mb-3">
            <ArrowLeft size={18} /> Retour aux utilisateurs
          </Link>
          <h1 className="text-3xl font-black text-slate-900">{detail.user.fullName}</h1>
          <p className="text-slate-500 mt-1">
            {detail.user.email} · {detail.user.typeUser || '—'} · {detail.onboarding?.display || '—'}
          </p>
        </div>
        <button
          type="button"
          onClick={loadDetail}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold"
        >
          <RefreshCw size={16} /> Actualiser
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <InfoCard label="Téléphone" value={detail.user.phone || '—'} />
        <InfoCard label="Vérifié" value={detail.user.isVerified ? 'Oui' : 'Non'} />
        <InfoCard label="Créé le" value={formatDate(detail.user.createdAt)} />
        <InfoCard label="Onboarding" value={detail.onboarding?.statusLabel || '—'} />
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
        {tab === 'profile' && (
          <>
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">Compte plateforme</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard label="ID utilisateur" value={detail.user._id} />
                <InfoCard label="Email" value={detail.user.email} />
                <InfoCard label="Type" value={detail.user.typeUser || '—'} />
                <InfoCard label="Phase onboarding" value={detail.onboarding?.display || '—'} />
              </div>
            </section>

            {isRep && profile?.agent && (
              <section className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900">Profil REP</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <InfoCard label="Agent ID" value={String(profile.agent._id || '—')} />
                  <InfoCard label="Statut" value={String(profile.agent.status || '—')} />
                  <InfoCard
                    label="Profil de base"
                    value={profile.agent.isBasicProfileCompleted ? 'Complet' : 'Incomplet'}
                  />
                  <InfoCard label="Abonnement" value={String(profile.agent.subscriptionStatus || '—')} />
                  <InfoCard label="Stripe customer" value={String(profile.agent.stripeCustomerId || '—')} />
                  <InfoCard label="Gigs liés" value={String(profile.agent.gigsCount ?? 0)} />
                </div>
                <pre className="overflow-x-auto rounded-xl bg-slate-950 text-slate-100 p-4 text-xs">
                  {JSON.stringify(profile.agent, null, 2)}
                </pre>
              </section>
            )}

            {isCompany && profile?.company && (
              <section className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900">Profil entreprise</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <InfoCard label="Company ID" value={String(profile.company._id || '—')} />
                  <InfoCard label="Nom" value={String(profile.company.name || profile.company.companyName || '—')} />
                  <InfoCard label="Gigs" value={String(financials?.gigsCount ?? 0)} />
                </div>
                <pre className="overflow-x-auto rounded-xl bg-slate-950 text-slate-100 p-4 text-xs">
                  {JSON.stringify(profile.company, null, 2)}
                </pre>
                {profile.onboardingProgress && (
                  <>
                    <h3 className="font-semibold text-slate-800">Progression onboarding</h3>
                    <pre className="overflow-x-auto rounded-xl bg-slate-950 text-slate-100 p-4 text-xs">
                      {JSON.stringify(profile.onboardingProgress, null, 2)}
                    </pre>
                  </>
                )}
              </section>
            )}

            {!isRep && !isCompany && (
              <p className="text-slate-500">Aucun profil company ou rep associé à ce compte.</p>
            )}
          </>
        )}

        {tab === 'financials' && financials && (
          <>
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {isCompany && (
                <>
                  <InfoCard label="Solde wallet" value={formatMoney(financials.wallet?.balance)} />
                  <InfoCard
                    label="Minutes restantes"
                    value={String(financials.minutes?.minutes ?? 0)}
                  />
                  <InfoCard
                    label="Minutes achetées"
                    value={String(financials.minutes?.purchasedMinutes ?? 0)}
                  />
                  <InfoCard
                    label="Escrow"
                    value={formatMoney(financials.escrowWallet?.balance)}
                  />
                </>
              )}
              {isRep && (
                <>
                  <InfoCard
                    label="Solde disponible"
                    value={formatMoney(financials.wallet?.availableBalance)}
                  />
                  <InfoCard
                    label="Commissions en attente"
                    value={formatMoney(financials.wallet?.pendingCommissions)}
                  />
                  <InfoCard
                    label="Retraits en attente"
                    value={formatMoney(financials.wallet?.pendingWithdrawals)}
                  />
                  <InfoCard
                    label="Gains lifetime"
                    value={formatMoney(financials.wallet?.lifetimeEarnings)}
                  />
                </>
              )}
              <InfoCard
                label="Wallet HARX global"
                value={formatMoney(detail.platform?.harxWallet?.balance)}
              />
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {isCompany && (
                <>
                  <FinancialAdjustForm
                    label="Gérer les minutes"
                    target="company_minutes"
                    userId={userId}
                    onUpdated={loadDetail}
                  />
                  <FinancialAdjustForm
                    label="Gérer le wallet entreprise (€)"
                    target="company_wallet"
                    userId={userId}
                    onUpdated={loadDetail}
                  />
                </>
              )}
              {isRep && (
                <FinancialAdjustForm
                  label="Gérer le wallet REP (€)"
                  target="rep_wallet"
                  userId={userId}
                  onUpdated={loadDetail}
                />
              )}
            </section>

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
              <InfoCard label="Lignes actives" value={String((financials.phoneNumbers || []).length)} />
              <InfoCard
                label="Paiements téléphonie"
                value={String((financials.phoneNumberPayments || []).length)}
              />
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

            <h3 className="font-bold text-slate-900">Paiements lignes téléphoniques</h3>
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
              headers={['Statut', 'Provider', 'Début période', 'Fin période']}
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
                label="Total commissions HARX (user)"
                value={formatMoney(financials.totals?.harxCommissions ?? financials.totals?.repActivity?.harxShare)}
              />
              {isRep && (
                <InfoCard
                  label="Part REP cumulée"
                  value={formatMoney(financials.totals?.repShare)}
                />
              )}
              {isCompany && (
                <InfoCard
                  label="Part HARX sur activité reps"
                  value={formatMoney(financials.totals?.repActivity?.harxShare)}
                />
              )}
              <InfoCard
                label="Wallet HARX plateforme"
                value={formatMoney(detail.platform?.harxWallet?.lifetimeEarnings)}
              />
            </div>

            <h3 className="font-bold text-slate-900">Commissions HARX</h3>
            <DataTable
              headers={['Date', 'Type', 'Montant', 'Description']}
              emptyMessage="Aucune commission HARX."
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
    </div>
  );
}
