import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { adminApi } from '../../lib/api';

type UserRow = {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  typeUser?: string | null;
  isVerified?: boolean;
  createdAt?: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    adminApi
      .users({ page, search })
      .then((response) => {
        setUsers(response.data.users);
        setPages(response.data.pagination.pages);
      })
      .catch(() => setError('Impossible de charger la liste des utilisateurs.'))
      .finally(() => setLoading(false));
  }, [page, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Utilisateurs</h1>
        <p className="text-slate-500 mt-1">Gestion et recherche des comptes plateforme</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Rechercher par nom, email, téléphone…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#E91E8C]"
        />
      </div>

      {loading ? (
        <p className="text-slate-500">Chargement…</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-semibold">Nom</th>
                  <th className="px-6 py-3 font-semibold">Email</th>
                  <th className="px-6 py-3 font-semibold">Téléphone</th>
                  <th className="px-6 py-3 font-semibold">Type</th>
                  <th className="px-6 py-3 font-semibold">Vérifié</th>
                  <th className="px-6 py-3 font-semibold">Créé le</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-t border-slate-100">
                    <td className="px-6 py-3 font-medium text-slate-900">{user.fullName}</td>
                    <td className="px-6 py-3 text-slate-600">{user.email}</td>
                    <td className="px-6 py-3 text-slate-600">{user.phone || '—'}</td>
                    <td className="px-6 py-3 capitalize">{user.typeUser || '—'}</td>
                    <td className="px-6 py-3">{user.isVerified ? 'Oui' : 'Non'}</td>
                    <td className="px-6 py-3 text-slate-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleString('fr-FR') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="px-4 py-2 rounded-lg border border-slate-200 disabled:opacity-40"
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
              className="px-4 py-2 rounded-lg border border-slate-200 disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
