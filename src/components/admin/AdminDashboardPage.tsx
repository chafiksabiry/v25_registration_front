import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../lib/api';
import AdminUserFilters, {
  type OnboardingFilter,
  type TypeFilter,
  type VerifiedFilter,
} from './AdminUserFilters';
import { type AdminUserRow, rowEmail, rowName } from './adminUserRowUtils';

type Stats = {
  totals: {
    users: number;
    verified: number;
    company: number;
    rep: number;
    admin: number;
    unassigned: number;
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
      .then((response) => setStats({ totals: response.data.totals }))
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
