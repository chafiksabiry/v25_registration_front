import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../lib/api';

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
};

type TypeFilter = 'all' | 'rep' | 'company';

const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'rep', label: 'REPs' },
  { value: 'company', label: 'Companies' },
];

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

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-violet-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Rechercher par nom, email, téléphone…"
            className="admin-input"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {TYPE_FILTERS.map((filter) => {
            const active = typeFilter === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => {
                  setPage(1);
                  setTypeFilter(filter.value);
                }}
                className={`admin-filter-pill ${active ? 'admin-filter-pill--active' : 'admin-filter-pill--idle'}`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

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
                  <th className="px-6 py-3 font-semibold">Nom</th>
                  <th className="px-6 py-3 font-semibold">Email</th>
                  <th className="px-6 py-3 font-semibold">Téléphone</th>
                  <th className="px-6 py-3 font-semibold">Type</th>
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
                    <td className="px-6 py-3 font-medium text-slate-900">{user.fullName}</td>
                    <td className="px-6 py-3 text-slate-600">{user.email}</td>
                    <td className="px-6 py-3 text-slate-600">{user.phone || '—'}</td>
                    <td className="px-6 py-3 capitalize">{user.typeUser || '—'}</td>
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
                    <td className="px-6 py-3 text-slate-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleString('fr-FR') : '—'}
                    </td>
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
