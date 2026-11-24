import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../lib/api';
import AdminUserFilters, {
  type OnboardingFilter,
  type TypeFilter,
  type VerifiedFilter,
} from './AdminUserFilters';
import { rowCreatedAt, rowName, rowTypeUserLabel } from './adminUserRowUtils';
import { Info } from 'lucide-react';
import { formatDay, isAccountDisabled, type AccountStatusFilter } from './accountClosureUtils';
import AccountOfferBadge from './AccountOfferBadge';
import { showsAccountOffer, type AccountOffer, type OfferFilter } from './accountOfferUtils';
import { BulkDeleteDialog, BulkDeleteResults, BulkSelectionBar } from './AdminBulkDelete';
import {
  bulkLockReason,
  pageSelectionState,
  toggleRow,
  togglePage,
  BULK_DELETE_MAX,
  type BulkResponse,
  type Selection,
} from './bulkDeleteUtils';

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
  disabled?: boolean;
  disabledAt?: string | null;
  /** Compte protégé (démonstration Apple…) : jamais sélectionnable pour la suppression en masse. */
  protectedAccount?: boolean;
  /** Offre réelle du compte (NOMAD / CLOUD + produit), lue par le serveur. */
  accountOffer?: AccountOffer | null;
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
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<VerifiedFilter>('all');
  const [onboardingFilter, setOnboardingFilter] = useState<OnboardingFilter>('all');
  const [statusFilter, setStatusFilter] = useState<AccountStatusFilter>('all');
  const [offerFilter, setOfferFilter] = useState<OfferFilter>('all');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Suppression en masse : sélection (gardée d'une page à l'autre, vidée quand un filtre change), confirmation, résultat.
  const [selection, setSelection] = useState<Selection>(() => new Map());
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ response: BulkResponse; names: Record<string, string> } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setSelection(new Map());
  }, [search, typeFilter, verifiedFilter, onboardingFilter, statusFilter, offerFilter]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    adminApi
      .users({
        page,
        search,
        typeUser: typeFilter === 'all' ? undefined : typeFilter,
        verified: verifiedFilter === 'all' ? undefined : verifiedFilter,
        onboardingStatus: onboardingFilter === 'all' ? undefined : onboardingFilter,
        status: statusFilter === 'all' ? undefined : statusFilter,
        offer: offerFilter === 'all' ? undefined : offerFilter,
      })
      .then((response) => {
        setUsers(response.data.users);
        setPages(response.data.pagination.pages);
      })
      .catch(() => setError('Impossible de charger la liste des utilisateurs.'))
      .finally(() => setLoading(false));
  }, [page, search, typeFilter, verifiedFilter, onboardingFilter, statusFilter, offerFilter, reloadKey]);

  const pageState = pageSelectionState(selection, users);
  const pageHasSelectable = users.some((u) => bulkLockReason(u) === null);
  const onBulkDone = (response: BulkResponse) => {
    const names: Record<string, string> = {};
    selection.forEach((row, id) => { names[id] = row.displayName || row.fullName || ''; });
    setBulkResult({ response, names });
    setBulkOpen(false);
    setSelection(new Map());
    setReloadKey((k) => k + 1);
  };

  return (
    <div className="space-y-6 admin-stagger">
      <div>
        <h1 className="admin-page-title">Utilisateurs</h1>
        <p className="admin-page-subtitle">Gestion et recherche des comptes plateforme</p>
      </div>

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
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => {
          setPage(1);
          setStatusFilter(value);
        }}
        offerFilter={offerFilter}
        onOfferFilterChange={(value) => {
          setPage(1);
          setOfferFilter(value);
        }}
      />

      {bulkResult ? (
        <BulkDeleteResults response={bulkResult.response} names={bulkResult.names} onClose={() => setBulkResult(null)} />
      ) : null}

      <BulkSelectionBar count={selection.size} onClear={() => setSelection(new Map())} onDelete={() => setBulkOpen(true)} />
      {bulkOpen && selection.size > 0 ? (
        <BulkDeleteDialog rows={[...selection.values()]} onClose={() => setBulkOpen(false)} onDone={onBulkDone} />
      ) : null}

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
                  <th className="pl-6 pr-2 py-3 w-10">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-red-600 cursor-pointer disabled:cursor-not-allowed"
                      aria-label="Tout sélectionner (page)"
                      title={selection.size >= BULK_DELETE_MAX && pageState !== 'all' ? `Maximum ${BULK_DELETE_MAX} comptes par suppression` : 'Tout sélectionner (page)'}
                      checked={pageState === 'all'}
                      ref={(el) => { if (el) el.indeterminate = pageState === 'some'; }}
                      disabled={!pageHasSelectable}
                      onChange={() => setSelection((current) => togglePage(current, users))}
                      data-testid="bulk-select-page"
                    />
                  </th>
                  <th className="px-6 py-3 font-semibold">Nom / Entreprise</th>
                  <th className="px-6 py-3 font-semibold">Email</th>
                  <th className="px-6 py-3 font-semibold">Téléphone</th>
                  <th className="px-6 py-3 font-semibold">Offre</th>
                  <th className="px-6 py-3 font-semibold">Plan</th>
                  <th className="px-6 py-3 font-semibold">Onboarding</th>
                  <th className="px-6 py-3 font-semibold">Vérifié</th>
                  <th className="px-6 py-3 font-semibold">Créé le</th>
                  <th className="px-6 py-3 font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user._id}
                    onClick={() => navigate(`/admin/users/${user._id}`)}
                    className={`border-t border-violet-50/80 cursor-pointer transition-colors ${selection.has(user._id) ? 'bg-red-50/60' : isAccountDisabled(user) ? 'bg-slate-50/70' : ''}`}
                  >
                    <td className="pl-6 pr-2 py-3 w-10" onClick={(e) => e.stopPropagation()}>
                      {(() => {
                        const lock = bulkLockReason(user);
                        const full = !selection.has(user._id) && selection.size >= BULK_DELETE_MAX;
                        return (
                          <span title={lock || (full ? `Maximum ${BULK_DELETE_MAX} comptes par suppression` : undefined)} className="inline-flex">
                            <input
                              type="checkbox"
                              className="h-4 w-4 accent-red-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label={lock ? `${rowName(user)} : ${lock}` : `Sélectionner ${rowName(user)}`}
                              checked={selection.has(user._id)}
                              disabled={Boolean(lock) || full}
                              onChange={() => setSelection((current) => toggleRow(current, user))}
                              data-testid="bulk-select-row"
                            />
                          </span>
                        );
                      })()}
                    </td>
                    <td className={`px-6 py-3 font-medium ${isAccountDisabled(user) ? 'text-slate-500' : 'text-slate-900'}`}>
                      <div>{rowName(user)}</div>
                      {user.typeUser === 'company' && user.industry && (
                        <p className="text-xs text-violet-600 mt-0.5">{user.industry}</p>
                      )}
                      {user.typeUser === 'company' &&
                        user.displayName &&
                        user.displayName !== user.fullName && (
                          <p className="text-xs text-slate-400 mt-0.5">Compte: {user.fullName}</p>
                        )}
                      {user.typeUser === 'rep' &&
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
                    <td className="px-6 py-3">
                      {showsAccountOffer(user.typeUser, user.accountOffer) ? (
                        <AccountOfferBadge value={user.accountOffer} />
                      ) : (
                        rowTypeUserLabel(user.typeUser, t)
                      )}
                    </td>
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
                    <td className="px-6 py-3">
                      {isAccountDisabled(user) ? (
                        <>
                          <span className="admin-badge admin-badge--danger">Désactivé</span>
                          {user.disabledAt ? <p className="text-[11px] text-slate-400 mt-1">le {formatDay(user.disabledAt)}</p> : null}
                        </>
                      ) : (
                        <span className="admin-badge admin-badge--success">Actif</span>
                      )}
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

      <p className="text-xs text-slate-500 flex items-center gap-1.5">
        <Info size={14} className="shrink-0" /> La recherche porte déjà sur le nom et l’email. Les comptes supprimés n’apparaissent plus dans la liste (une trace sans donnée personnelle reste dans le journal d’administration).
      </p>
    </div>
  );
}
