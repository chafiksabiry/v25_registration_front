import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, RefreshCw, Wallet } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { adminApi } from '../../lib/api';
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

  if (loading) {
    return <p className="text-slate-500">Chargement du profil…</p>;
  }

  if (error || !detail) {
    return (
      <div className="space-y-4">
        <Link to="/admin/users" className="inline-flex items-center gap-2 text-[#E91E8C] font-semibold">
          <ArrowLeft size={18} /> Retour
        </Link>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const profile = detail.profile;
  const isCompany = profile?.type === 'company';
  const isRep = profile?.type === 'rep';
  const repAgent = isRep ? (profile?.agent as Record<string, any> | undefined) : undefined;
  const photoUrl =
    repAgent?.personalInfo?.photo?.url || repAgent?.photo?.url || undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <Link to="/admin/users" className="inline-flex items-center gap-2 text-[#E91E8C] font-semibold">
          <ArrowLeft size={18} /> Retour aux utilisateurs
        </Link>
        <div className="flex flex-wrap gap-2">
          {(isCompany || isRep) && (
            <Link
              to={`/admin/wallet?userId=${userId}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold"
            >
              <Wallet size={16} /> Gérer wallet & finances
            </Link>
          )}
          <button
            type="button"
            onClick={loadDetail}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold"
          >
            <RefreshCw size={16} /> Actualiser
          </button>
        </div>
      </div>

      <ProfileHero
        fullName={detail.user.fullName}
        email={detail.user.email}
        typeUser={detail.user.typeUser}
        onboardingDisplay={detail.onboarding?.display}
        onboardingStatus={detail.onboarding?.statusLabel}
        photoUrl={photoUrl}
      />

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

      {isRep && profile?.agent && (
        <RepProfileView agent={profile.agent as Record<string, any>} />
      )}

      {isCompany && profile?.company && (
        <CompanyProfileView
          company={profile.company as Record<string, any>}
          onboardingProgress={profile.onboardingProgress}
          gigsCount={detail.financials?.gigsCount as number | undefined}
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
