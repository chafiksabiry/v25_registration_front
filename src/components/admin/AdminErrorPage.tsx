import React from 'react';
import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';

export default function AdminErrorPage() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? error.statusText
    : error instanceof Error
      ? error.message
      : 'Une erreur inattendue est survenue.';

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6">
      <div className="max-w-lg w-full rounded-2xl border border-red-100 bg-white p-8 shadow-sm text-center space-y-4">
        <h1 className="text-2xl font-black text-slate-900">Erreur d’affichage</h1>
        <p className="text-sm text-slate-600">{message}</p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            to="/admin"
            className="px-4 py-2 rounded-xl bg-[#E91E8C] text-white text-sm font-semibold"
          >
            Retour admin
          </Link>
          <Link
            to="/admin/users"
            className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold"
          >
            Utilisateurs
          </Link>
        </div>
      </div>
    </div>
  );
}
