import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, TrendingUp, Wallet } from 'lucide-react';
import { adminApi } from '../../lib/api';
import AdminUserFilters, {
  type OnboardingFilter,
  type TypeFilter,
  type VerifiedFilter,
} from './AdminUserFilters';
import { type AdminUserRow, rowEmail, rowName } from './adminUserRowUtils';
import { formatMoney, InfoCard, SectionCard } from './adminUiUtils';

type Stats = {
  totals: {
    users: number;
    verified: number;
    company: number;
    rep: number;
    admin: number;
    unassigned: number;
  };
  objectives?: {
    year: number;
    growth: {
      companiesRegistered: number;
      companiesSigned: number;
      activeSubscriptions: number;
      companiesOnboarded: number;
      repsRegistered: number;
      repsOnboarded: number;
      repsWithActiveSubscription: number;
      repsInProgress: number;
      companiesInProgress: number;
    };
    financial: {
      harxWalletBalance: number;
      lifetimeRevenue: number;
      annualRevenue: number;
      annualProfit: number;
      mrr: number;
      totalCommissions: number;
      annualCommissions: number;
      companyPaymentsTotal: number;
      annualCompanyPayments: number;
      phoneLineRevenue: number;
      annualPhoneLineRevenue: number;
      gigHarxShareTotal: number;
      annualGigHarxShare: number;
      totalRepWalletBalance: number;
      totalCompanyWalletBalance: number;
      totalMinutesPurchased: number;
    };
  };
};

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="admin-stat-card">
      <p className="admin-info-label">{label}</p>
      <p className={`mt-2 text-3xl font-black ${accent}`}>{value.toLocaleString('fr-FR')}</p>
    </div>
  );
}

function ProgressBar({ value, max, tone = 'violet' }: { value: number; max: number; tone?: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const toneClass =
    tone === 'emerald'
      ? 'bg-emerald-500'
      : tone === 'fuchsia'
        ? 'bg-fuchsia-500'
        : 'bg-violet-500';

  return (
    <div className="space-y-1.5">
      <div className="h-2 rounded-full bg-violet-100/80 overflow-hidden">
        <div className={`h-full rounded-full ${toneClass} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-slate-500">{pct}% de l’objectif ({value.toLocaleString('fr-FR')} / {max.toLocaleString('fr-FR')})</p>
    </div>
  );
}

function HarxObjectivesSection({ objectives }: { objectives: NonNullable<Stats['objectives']> }) {
  const { growth, financial, year } = objectives;

  return (
    <SectionCard
      title="Objectifs HARX"
      description={`Indicateurs clés de croissance et finances consolidées — ${year}`}
    >
      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-violet-600" />
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Croissance plateforme</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <InfoCard label="Entreprises inscrites" value={growth.companiesRegistered.toLocaleString('fr-FR')} />
            <InfoCard label="Entreprises signées (abonnement actif)" value={growth.companiesSigned.toLocaleString('fr-FR')} />
            <InfoCard label="Entreprises onboardées" value={growth.companiesOnboarded.toLocaleString('fr-FR')} />
            <InfoCard label="Abonnements actifs" value={growth.activeSubscriptions.toLocaleString('fr-FR')} />
            <InfoCard label="REPs inscrits" value={growth.repsRegistered.toLocaleString('fr-FR')} />
            <InfoCard label="REPs onboardés" value={growth.repsOnboarded.toLocaleString('fr-FR')} />
            <InfoCard label="REPs abonnement actif" value={growth.repsWithActiveSubscription.toLocaleString('fr-FR')} />
            <InfoCard label="REPs en cours d’onboarding" value={growth.repsInProgress.toLocaleString('fr-FR')} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="admin-info-tile space-y-3">
              <p className="font-semibold text-slate-900">Progression entreprises</p>
              <ProgressBar value={growth.companiesOnboarded} max={growth.companiesRegistered} tone="violet" />
            </div>
            <div className="admin-info-tile space-y-3">
              <p className="font-semibold text-slate-900">Progression REPs</p>
              <ProgressBar value={growth.repsOnboarded} max={growth.repsRegistered} tone="fuchsia" />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Chiffre d’affaires & profit</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <InfoCard label={`CA annuel ${year}`} value={formatMoney(financial.annualRevenue)} />
            <InfoCard label={`Profit HARX annuel ${year}`} value={formatMoney(financial.annualProfit)} />
            <InfoCard label="CA lifetime (consolidé)" value={formatMoney(financial.lifetimeRevenue)} />
            <InfoCard label="MRR (abonnements actifs)" value={formatMoney(financial.mrr)} />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="h-5 w-5 text-fuchsia-600" />
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Détails financiers</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <InfoCard label="Wallet HARX (solde)" value={formatMoney(financial.harxWalletBalance)} />
            <InfoCard label="Commissions HARX (total)" value={formatMoney(financial.totalCommissions)} />
            <InfoCard label={`Commissions HARX ${year}`} value={formatMoney(financial.annualCommissions)} />
            <InfoCard label="Part HARX gigs (total)" value={formatMoney(financial.gigHarxShareTotal)} />
            <InfoCard label={`Part HARX gigs ${year}`} value={formatMoney(financial.annualGigHarxShare)} />
            <InfoCard label="Paiements entreprises (total)" value={formatMoney(financial.companyPaymentsTotal)} />
            <InfoCard label={`Paiements entreprises ${year}`} value={formatMoney(financial.annualCompanyPayments)} />
            <InfoCard label="Revenus téléphonie (total)" value={formatMoney(financial.phoneLineRevenue)} />
            <InfoCard label={`Revenus téléphonie ${year}`} value={formatMoney(financial.annualPhoneLineRevenue)} />
            <InfoCard label="Soldes wallet entreprises" value={formatMoney(financial.totalCompanyWalletBalance)} />
            <InfoCard label="Soldes wallet REPs" value={formatMoney(financial.totalRepWalletBalance)} />
            <InfoCard
              label="Minutes achetées (total)"
              value={`${Math.round(financial.totalMinutesPurchased).toLocaleString('fr-FR')} min`}
            />
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<VerifiedFilter>('all');
  const [onboardingFilter, setOnboardingFilter] = useState<OnboardingFilter>('all');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    adminApi
      .stats()
      .then((response) =>
        setStats({
          totals: response.data.totals,
          objectives: response.data.objectives,
        }),
      )
      .catch(() => setStatsError('Impossible de charger les statistiques admin.'))
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    setListLoading(true);
    setListError(null);
    adminApi
      .users({
        page,
        limit: 10,
        search,
        typeUser: typeFilter === 'all' ? undefined : typeFilter,
        verified: verifiedFilter === 'all' ? undefined : verifiedFilter,
        onboardingStatus: onboardingFilter === 'all' ? undefined : onboardingFilter,
      })
      .then((response) => {
        setUsers(response.data.users);
        setPages(response.data.pagination.pages);
      })
      .catch(() => setListError('Impossible de charger les inscriptions récentes.'))
      .finally(() => setListLoading(false));
  }, [page, search, typeFilter, verifiedFilter, onboardingFilter]);

  if (statsLoading) {
    return <div className="text-violet-600/70 animate-pulse">Chargement du tableau de bord…</div>;
  }

  if (statsError || !stats) {
    return <div className="p-8 text-red-500">{statsError}</div>;
  }

  return (
    <div className="space-y-8 admin-stagger">
      <div>
        <h1 className="admin-page-title">Tableau de bord</h1>
        <p className="admin-page-subtitle">Vue d’ensemble de la plateforme HARX</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard label="Utilisateurs total" value={stats.totals.users} accent="text-indigo-950" />
        <StatCard label="Comptes vérifiés" value={stats.totals.verified} accent="text-emerald-600" />
        <StatCard label="Entreprises" value={stats.totals.company} accent="text-violet-600" />
        <StatCard label="Reps" value={stats.totals.rep} accent="text-fuchsia-600" />
        <StatCard label="Admins" value={stats.totals.admin} accent="text-orange-500" />
        <StatCard label="Sans profil" value={stats.totals.unassigned} accent="text-slate-600" />
      </div>

      {stats.objectives && <HarxObjectivesSection objectives={stats.objectives} />}

      <section className="admin-table-wrap space-y-0">
        <div className="px-6 py-4 border-b border-violet-100/80 space-y-4">
          <h2 className="admin-section-title">Inscriptions récentes</h2>
          <AdminUserFilters
            search={search}
            typeFilter={typeFilter}
            verifiedFilter={verifiedFilter}
            onboardingFilter={onboardingFilter}
            onSearchChange={(value) => {
              setPage(1);
              setSearch(value);
            }}
            onTypeFilterChange={(value) => {
              setPage(1);
              setTypeFilter(value);
            }}
            onVerifiedFilterChange={(value) => {
              setPage(1);
              setVerifiedFilter(value);
            }}
            onOnboardingFilterChange={(value) => {
              setPage(1);
              setOnboardingFilter(value);
            }}
          />
        </div>

        {listLoading ? (
          <p className="px-6 py-8 text-violet-600/70 animate-pulse">Chargement…</p>
        ) : listError ? (
          <p className="px-6 py-8 text-red-500">{listError}</p>
        ) : users.length === 0 ? (
          <p className="px-6 py-8 text-slate-500">Aucun résultat pour ces filtres.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="admin-table min-w-full text-sm">
                <thead className="text-left text-slate-500">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Nom / Entreprise</th>
                    <th className="px-6 py-3 font-semibold">Email</th>
                    <th className="px-6 py-3 font-semibold">Type</th>
                    <th className="px-6 py-3 font-semibold">Vérifié</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      onClick={() => navigate(`/admin/users/${user._id}`)}
                      className="border-t border-violet-50/80 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-3 font-medium text-slate-900">
                        <div>{rowName(user)}</div>
                        {user.typeUser === 'company' && user.industry && (
                          <p className="text-xs text-violet-600 mt-0.5">{user.industry}</p>
                        )}
                        {user.typeUser === 'rep' &&
                          user.displayName &&
                          user.displayName !== user.fullName && (
                            <p className="text-xs text-slate-400 mt-0.5">Compte: {user.fullName}</p>
                          )}
                      </td>
                      <td className="px-6 py-3 text-slate-600">
                        <div>{rowEmail(user)}</div>
                        {user.typeUser === 'company' &&
                          user.displayEmail &&
                          user.displayEmail !== user.email && (
                            <p className="text-xs text-slate-400 mt-0.5">Connexion: {user.email}</p>
                          )}
                      </td>
                      <td className="px-6 py-3 capitalize">{user.typeUser || '—'}</td>
                      <td className="px-6 py-3">{user.isVerified ? 'Oui' : 'Non'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-violet-100/80">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="admin-btn-secondary disabled:opacity-40"
              >
                Précédent
              </button>
              <span className="text-sm text-slate-500">
                Page {page} / {pages}
              </span>
              <button
                type="button"
                disabled={page >= pages}
                onClick={() => setPage((current) => current + 1)}
                className="admin-btn-secondary disabled:opacity-40"
              >
                Suivant
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
