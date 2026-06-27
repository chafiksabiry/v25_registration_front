import React, { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { PageHeader, SectionCard, StatCard } from './adminUiUtils';

type Stats = {
  totals: {
    users: number;
    verified: number;
    company: number;
    rep: number;
    admin: number;
    unassigned: number;
  };
  recentUsers: Array<{
    _id: string;
    fullName: string;
    email: string;
    typeUser?: string | null;
    isVerified?: boolean;
    createdAt?: string;
  }>;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .stats()
      .then((response) => setStats(response.data))
      .catch(() => setError('Impossible de charger les statistiques admin.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-red-700">{error}</div>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de la plateforme HARX."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard label="Utilisateurs total" value={stats.totals.users.toLocaleString('fr-FR')} />
        <StatCard label="Comptes vérifiés" value={stats.totals.verified.toLocaleString('fr-FR')} accent="text-emerald-600" />
        <StatCard label="Entreprises" value={stats.totals.company.toLocaleString('fr-FR')} accent="text-blue-600" />
        <StatCard label="Reps" value={stats.totals.rep.toLocaleString('fr-FR')} accent="text-[#E6188D]" />
        <StatCard label="Admins" value={stats.totals.admin.toLocaleString('fr-FR')} accent="text-orange-500" />
        <StatCard label="Sans profil" value={stats.totals.unassigned.toLocaleString('fr-FR')} accent="text-slate-600" />
      </div>

      <SectionCard title="Inscriptions récentes" accent>
        <div className="overflow-x-auto rounded-xl border border-slate-200 -mx-1">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50/90 text-left text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Nom</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Type</th>
                <th className="px-5 py-3 font-semibold">Vérifié</th>
                <th className="px-5 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentUsers.map((user) => (
                <tr key={user._id} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="px-5 py-3 font-medium text-slate-900">{user.fullName}</td>
                  <td className="px-5 py-3 text-slate-600">{user.email}</td>
                  <td className="px-5 py-3 capitalize">{user.typeUser || '—'}</td>
                  <td className="px-5 py-3">{user.isVerified ? 'Oui' : 'Non'}</td>
                  <td className="px-5 py-3 text-slate-500">
                    {user.createdAt ? new Date(user.createdAt).toLocaleString('fr-FR') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
