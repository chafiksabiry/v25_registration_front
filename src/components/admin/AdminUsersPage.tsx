import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../lib/api';
import AdminUserFilters, { type TypeFilter } from './AdminUserFilters';
import { rowCreatedAt, rowName } from './adminUserRowUtils';

type OnboardingInfo = {
  phase: number | null;
  phaseLabel: string | null;
  phaseStatus: string;
  display: string;
  statusLabel: string;
};

type UserRow = {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  typeUser?: string | null;
  isVerified?: boolean;
  createdAt?: string;
  onboarding?: OnboardingInfo | null;
  displayName?: string;
  displayEmail?: string;
  displayPhone?: string;
  industry?: string | null;
  planName?: string | null;
  subscriptionStatus?: string | null;
  profileCreatedAt?: string;
  companyProfile?: {
    companyId?: string;
    name?: string;
    industry?: string;
    email?: string;
    phone?: string;
    planName?: string;
  } | null;
};

function subscriptionStatusLabel(status?: string | null) {
  if (!status) return null;
  const labels: Record<string, string> = {
    active: 'Actif',
    trialing: 'Essai',
    past_due: 'Retard',
    canceled: 'Annulé',
  };
  return labels[status] || status;
}

function rowPhone(user: UserRow) {
  return user.displayPhone || user.phone || '—';
}

function onboardingBadgeClass(status: string) {
  if (status === 'completed') return 'admin-badge admin-badge--success';
  if (status === 'in_progress') return 'admin-badge admin-badge--warning';
  if (status === 'missing') return 'admin-badge admin-badge--danger';
  return 'admin-badge admin-badge--neutral';
}

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    adminApi
      .users({
        page,
        search,
        typeUser: typeFilter === 'all' ? undefined : typeFilter,
      })
      .then((response) => {
        setUsers(response.data.users);
        setPages(response.data.pagination.pages);
      })
      .catch(() => setError('Impossible de charger la liste des utilisateurs.'))
      .finally(() => setLoading(false));
  }, [page, search, typeFilter]);

  return (
    <div className="space-y-6 admin-stagger">
      <div>
        <h1 className="admin-page-title">Utilisateurs</h1>
        <p className="admin-page-subtitle">Gestion et recherche des comptes plateforme</p>
      </div>

      <AdminUserFilters
        search={search}
        typeFilter={typeFilter}
        onSearchChange={(value) => {
          setPage(1);
          setSearch(value);
        }}
        onTypeFilterChange={(value) => {
          setPage(1);
          setTypeFilter(value);
        }}
      />

      {loading ? (
        <p className="text-violet-600/70 animate-pulse">Chargement…</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="admin-table-wrap">
          <div className="overflow-x-auto">
            <table className="admin-table min-w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-semibold">Nom / Entreprise</th>
                  <th className="px-6 py-3 font-semibold">Email</th>
                  <th className="px-6 py-3 font-semibold">Téléphone</th>
                  <th className="px-6 py-3 font-semibold">Type</th>
                  <th className="px-6 py-3 font-semibold">Plan</th>
                  <th className="px-6 py-3 font-semibold">Onboarding</th>
                  <th className="px-6 py-3 font-semibold">Vérifié</th>
                  <th className="px-6 py-3 font-semibold">Créé le</th>
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
                      {user.typeUser === 'company' &&
                        user.displayName &&
                        user.displayName !== user.fullName && (
                          <p className="text-xs text-slate-400 mt-0.5">Compte: {user.fullName}</p>
                        )}
                    </td>
                    <td className="px-6 py-3 text-slate-600">
                      <div>{user.displayEmail || user.email}</div>
                      {user.typeUser === 'company' &&
                        user.displayEmail &&
                        user.displayEmail !== user.email && (
                          <p className="text-xs text-slate-400 mt-0.5">Connexion: {user.email}</p>
                        )}
                    </td>
                    <td className="px-6 py-3 text-slate-600">{rowPhone(user)}</td>
                    <td className="px-6 py-3 capitalize">{user.typeUser || '—'}</td>
                    <td className="px-6 py-3">
                      {user.planName ? (
                        <div className="space-y-1">
                          <span className="admin-tag-chip">{user.planName}</span>
                          {user.subscriptionStatus && (
                            <p className="text-xs text-slate-500">
                              {subscriptionStatusLabel(user.subscriptionStatus)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      {user.onboarding ? (
                        <div className="space-y-1">
                          <p className="font-medium text-slate-800">{user.onboarding.display}</p>
                          <span className={onboardingBadgeClass(user.onboarding.phaseStatus)}>
                            {user.onboarding.statusLabel}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3">{user.isVerified ? 'Oui' : 'Non'}</td>
                    <td className="px-6 py-3 text-slate-500">{rowCreatedAt(user)}</td>
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
        </div>
      )}
    </div>
  );
}
