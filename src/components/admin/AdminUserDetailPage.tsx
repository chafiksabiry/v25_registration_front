import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, RefreshCw, Wallet } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { adminApi } from '../../lib/api';
import { usePageTitle } from '../../lib/tracking/usePageTitle';
import { CompanyProfileView, ProfileHero, RepProfileView } from './AdminProfileViews';
import { InfoCard, SectionCard, formatDate } from './adminUiUtils';

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
  financials?: { gigsCount?: number } | null;
};

export default function AdminUserDetailPage() {
  const { userId = '' } = useParams();
  const [detail, setDetail] = useState<UserDetail | null>(null);
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

  const heroName = detail
    ? detail.profile?.type === 'company'
      ? String(
          (detail.profile.company as Record<string, unknown> | undefined)?.name ||
            (detail.profile.company as Record<string, unknown> | undefined)?.companyName ||
            detail.user.fullName,
        )
      : detail.user.fullName
    : '';

  usePageTitle(
    !loading && detail ? `HARX — Admin · ${heroName}` : undefined,
    !loading && detail ? `Profil ${heroName} — back office HARX.` : undefined,
  );

  if (loading) {
    return <p className="text-violet-600/70 animate-pulse">Chargement du profil…</p>;
  }

  if (error || !detail) {
    return (
      <div className="space-y-4 admin-page">
        <Link to="/admin/users" className="admin-link">
          <ArrowLeft size={18} /> Retour
        </Link>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const profile = detail.profile;
  const isCompany = profile?.type === 'company';
  const isRep = profile?.type === 'rep';
  const company = isCompany ? (profile?.company as Record<string, any> | undefined) : undefined;
  const repAgent = isRep ? (profile?.agent as Record<string, any> | undefined) : undefined;
  const companyContact = company?.contact || {};
  const photoUrl = isCompany
    ? (company?.logo as string | undefined)
    : repAgent?.personalInfo?.photo?.url || repAgent?.photo?.url || undefined;

  const heroEmail = isCompany
    ? String(companyContact.email || company?.displayEmail || detail.user.email)
    : detail.user.email;

  return (
    <div className="space-y-6 admin-stagger">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <Link to="/admin/users" className="admin-link">
          <ArrowLeft size={18} /> Retour aux utilisateurs
        </Link>
        <div className="flex flex-wrap gap-2">
          {(isCompany || isRep) && (
            <Link
              to={`/admin/wallet?userId=${userId}`}
              className="admin-btn-dark"
            >
              <Wallet size={16} /> Gérer wallet & finances
            </Link>
          )}
          <button
            type="button"
            onClick={loadDetail}
            className="admin-btn-secondary"
          >
            <RefreshCw size={16} /> Actualiser
          </button>
        </div>
      </div>

      <ProfileHero
        fullName={heroName}
        email={heroEmail}
        typeUser={isCompany ? 'company' : detail.user.typeUser}
        onboardingDisplay={detail.onboarding?.display}
        onboardingStatus={detail.onboarding?.statusLabel}
        photoUrl={photoUrl}
      />

      {isCompany && company ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <InfoCard label="Téléphone" value={companyContact.phone || company.displayPhone || '—'} />
            <InfoCard label="Industrie" value={company.industry || '—'} />
            <InfoCard label="Créée le" value={formatDate(company.createdAt as string)} />
            <InfoCard label="Company ID" value={String(company._id || '—')} />
          </div>

          <SectionCard title="Compte utilisateur lié" description="Identifiants de connexion plateforme (collection users).">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard label="Email connexion" value={detail.user.email} />
              <InfoCard label="Téléphone compte" value={detail.user.phone || '—'} />
              <InfoCard label="Vérifié" value={detail.user.isVerified ? 'Oui' : 'Non'} />
              <InfoCard label="User ID" value={detail.user._id} />
              <InfoCard label="Phase onboarding" value={detail.onboarding?.display || '—'} />
              <InfoCard label="Statut onboarding" value={detail.onboarding?.statusLabel || '—'} />
            </div>
          </SectionCard>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <InfoCard label="Téléphone" value={detail.user.phone || '—'} />
            <InfoCard label="Vérifié" value={detail.user.isVerified ? 'Oui' : 'Non'} />
            <InfoCard label="Créé le" value={formatDate(detail.user.createdAt)} />
            <InfoCard label="ID utilisateur" value={detail.user._id} />
          </div>

          <SectionCard title="Compte plateforme">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard label="Email" value={detail.user.email} />
              <InfoCard label="Type de compte" value={detail.user.typeUser || '—'} />
              <InfoCard label="Phase onboarding" value={detail.onboarding?.display || '—'} />
              <InfoCard label="Statut onboarding" value={detail.onboarding?.statusLabel || '—'} />
            </div>
          </SectionCard>
        </>
      )}

      {isRep && profile?.agent && (
        <RepProfileView agent={profile.agent as Record<string, any>} />
      )}

      {isCompany && profile?.company && (
        <CompanyProfileView
          company={profile.company as Record<string, any>}
          onboardingProgress={profile.onboardingProgress}
          gigsCount={(profile.company as Record<string, any>).gigsCount as number | undefined}
        />
      )}

      {!isRep && !isCompany && (
        <SectionCard title="Profil métier">
          <p className="text-sm text-slate-500">Aucun profil company ou rep associé à ce compte.</p>
        </SectionCard>
      )}
    </div>
  );
}
