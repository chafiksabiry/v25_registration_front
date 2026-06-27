import React, { useCallback, useEffect, useState } from 'react';

import { ArrowLeft, RefreshCw, Wallet } from 'lucide-react';

import { Link, useParams } from 'react-router-dom';

import { adminApi } from '../../lib/api';

import { CompanyProfileView, ProfileHero, RepProfileView } from './AdminProfileViews';

import {
  AdminButton,
  InfoCard,
  PageHeader,
  SectionCard,
  formatDate,
} from './adminUiUtils';



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

    return (

      <div className="space-y-4 animate-pulse">

        <div className="h-8 w-48 bg-slate-200 rounded-lg" />

        <div className="h-40 bg-white rounded-2xl border border-slate-200" />

        <div className="grid grid-cols-4 gap-4">

          {[1, 2, 3, 4].map((i) => (

            <div key={i} className="h-20 bg-white rounded-xl border border-slate-200" />

          ))}

        </div>

      </div>

    );

  }



  if (error || !detail) {

    return (

      <div className="space-y-4">

        <Link

          to="/admin/users"

          className="inline-flex items-center gap-2 text-sm font-semibold text-[#E6188D] hover:underline"

        >

          <ArrowLeft size={16} /> Retour aux utilisateurs

        </Link>

        <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-red-700 text-sm">

          {error}

        </div>

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

      <PageHeader

        breadcrumb={

          <Link

            to="/admin/users"

            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-[#E6188D] transition-colors"

          >

            <ArrowLeft size={15} /> Utilisateurs

          </Link>

        }

        title={detail.user.fullName}

        description={detail.user.email}

        actions={

          <>

            {(isCompany || isRep) && (
              <Link
                to={`/admin/wallet?userId=${userId}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
              >
                <Wallet size={16} /> Wallet & finances
              </Link>
            )}

            <AdminButton variant="secondary" onClick={loadDetail}>

              <RefreshCw size={16} /> Actualiser

            </AdminButton>

          </>

        }

      />



      <ProfileHero

        fullName={detail.user.fullName}

        email={detail.user.email}

        typeUser={detail.user.typeUser}

        onboardingDisplay={detail.onboarding?.display}

        onboardingStatus={detail.onboarding?.statusLabel}

        photoUrl={photoUrl}

        repMeta={

          isRep && repAgent

            ? {

                plan: repAgent.planName || repAgent.plan,

                profileStatus: repAgent.status,

                basicComplete: repAgent.isBasicProfileCompleted,

                phone: detail.user.phone || repAgent.personalInfo?.phone,

              }

            : undefined

        }

      />



      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

        <InfoCard label="Téléphone" value={detail.user.phone || '—'} compact />

        <InfoCard label="Vérifié" value={detail.user.isVerified ? 'Oui' : 'Non'} compact />

        <InfoCard label="Créé le" value={formatDate(detail.user.createdAt)} compact />

        <InfoCard label="ID utilisateur" value={detail.user._id} compact />

      </div>



      <SectionCard title="Compte plateforme" accent>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

          <InfoCard label="Email" value={detail.user.email} compact />

          <InfoCard label="Type de compte" value={detail.user.typeUser || '—'} compact />

          <InfoCard label="Phase onboarding" value={detail.onboarding?.display || '—'} compact />

          <InfoCard label="Statut onboarding" value={detail.onboarding?.statusLabel || '—'} compact />

        </div>

      </SectionCard>



      {isRep && profile?.agent && (

        <RepProfileView agent={profile.agent as Record<string, any>} embedded />

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


