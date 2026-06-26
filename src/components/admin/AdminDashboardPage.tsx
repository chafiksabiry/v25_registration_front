import React, { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';

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

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`mt-2 text-3xl font-black ${accent}`}>{value.toLocaleString('fr-FR')}</p>
    </div>
  );
}

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
    return <div className="p-8 text-slate-500">Chargement du tableau de bord…</div>;
  }

  if (error || !stats) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Tableau de bord</h1>
        <p className="text-slate-500 mt-1">Vue d’ensemble de la plateforme HARX</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard label="Utilisateurs total" value={stats.totals.users} accent="text-slate-900" />
        <StatCard label="Comptes vérifiés" value={stats.totals.verified} accent="text-emerald-600" />
        <StatCard label="Entreprises" value={stats.totals.company} accent="text-blue-600" />
        <StatCard label="Reps" value={stats.totals.rep} accent="text-[#E91E8C]" />
        <StatCard label="Admins" value={stats.totals.admin} accent="text-[#F7631B]" />
        <StatCard label="Sans profil" value={stats.totals.unassigned} accent="text-slate-600" />
      </div>

      <section className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Inscriptions récentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-6 py-3 font-semibold">Nom</th>
                <th className="px-6 py-3 font-semibold">Email</th>
                <th className="px-6 py-3 font-semibold">Type</th>
                <th className="px-6 py-3 font-semibold">Vérifié</th>
                <th className="px-6 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentUsers.map((user) => (
                <tr key={user._id} className="border-t border-slate-100">
                  <td className="px-6 py-3 font-medium text-slate-900">{user.fullName}</td>
                  <td className="px-6 py-3 text-slate-600">{user.email}</td>
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
      </section>
    </div>
  );
}
