import React from 'react';
import { Briefcase, Building2, Globe, Heart, Sparkles, Target, User } from 'lucide-react';
import { InfoCard, SectionCard, StatusBadge } from './adminUiUtils';
import { displayValue, normalizeListItems } from './walletLedger';

const REP_PHASES = [
  { id: 1, label: 'Inscription & vérification' },
  { id: 2, label: 'Profil REP' },
  { id: 3, label: 'Évaluations' },
  { id: 4, label: 'Abonnement' },
  { id: 5, label: 'Marketplace / Gigs' },
];

const COMPANY_PHASES = [
  { id: 1, label: 'Compte & identité' },
  { id: 2, label: 'Configuration opérationnelle' },
  { id: 3, label: 'Engagement REPs' },
  { id: 4, label: 'Activation' },
];

function phaseTone(status?: string) {
  if (status === 'completed') return 'success' as const;
  if (status === 'in_progress' || status === 'pending') return 'warning' as const;
  if (status === 'missing') return 'danger' as const;
  return 'neutral' as const;
}

function phaseLabel(status?: string) {
  if (status === 'completed') return 'Terminé';
  if (status === 'in_progress') return 'En cours';
  if (status === 'pending') return 'En attente';
  if (status === 'not_started') return 'Non démarré';
  return status || '—';
}

export function RepOnboardingTimeline({
  onboardingProgress,
}: {
  onboardingProgress?: Record<string, unknown> | null;
}) {
  const phases = (onboardingProgress?.phases || {}) as Record<string, { status?: string }>;

  return (
    <div className="space-y-3">
      {REP_PHASES.map((phase) => {
        const status = phases[`phase${phase.id}`]?.status || 'not_started';
        return (
          <div
            key={phase.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 px-4 py-3"
          >
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Phase {phase.id} — {phase.label}
              </p>
            </div>
            <StatusBadge label={phaseLabel(status)} tone={phaseTone(status)} />
          </div>
        );
      })}
    </div>
  );
}

export function CompanyOnboardingTimeline({
  onboardingProgress,
}: {
  onboardingProgress?: { phases?: Array<{ id: number; status?: string }> } | null;
}) {
  const phaseMap = new Map((onboardingProgress?.phases || []).map((p) => [p.id, p.status]));

  return (
    <div className="space-y-3">
      {COMPANY_PHASES.map((phase) => {
        const status = phaseMap.get(phase.id) || 'pending';
        return (
          <div
            key={phase.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 px-4 py-3"
          >
            <p className="text-sm font-semibold text-slate-900">
              Phase {phase.id} — {phase.label}
            </p>
            <StatusBadge label={phaseLabel(status)} tone={phaseTone(status)} />
          </div>
        );
      })}
    </div>
  );
}

function TagList({ items, emptyLabel }: { items?: unknown[]; emptyLabel: string }) {
  const labels = normalizeListItems(items);
  if (!labels.length) {
    return <p className="text-sm text-slate-500">{emptyLabel}</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {labels.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className="rounded-full bg-[#E91E8C]/10 text-[#E91E8C] px-3 py-1 text-xs font-semibold"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function SkillList({ groups }: { groups: Array<{ title: string; items: unknown[] }> }) {
  const entries = groups.flatMap((group) =>
    (group.items || []).map((item, index) => ({
      key: `${group.title}-${index}`,
      group: group.title,
      item,
    })),
  );

  if (!entries.length) {
    return <p className="text-sm text-slate-500">Aucune compétence renseignée.</p>;
  }

  return (
    <div className="space-y-2">
      {entries.map(({ key, group, item }) => {
        if (typeof item === 'string') {
          return (
            <div key={key} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
              <span className="text-sm font-medium text-slate-900">{item}</span>
              <span className="text-xs text-slate-400">{group}</span>
            </div>
          );
        }

        const skill = item as { skill?: string; level?: number; details?: string };
        return (
          <div key={key} className="rounded-xl border border-slate-100 px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">{displayValue(skill.skill)}</p>
                <p className="text-xs text-slate-400 mt-0.5">{group}</p>
              </div>
              {skill.level != null && <StatusBadge label={`Niv. ${skill.level}`} tone="neutral" />}
            </div>
            {skill.details && (
              <p className="text-sm text-slate-600 mt-2">{skill.details}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function CompanyProfileView({
  company,
  onboardingProgress,
  gigsCount,
}: {
  company: Record<string, any>;
  onboardingProgress?: Record<string, unknown> | null;
  gigsCount?: number;
}) {
  const culture = company.culture || {};
  const subscription = company.subscription || {};

  return (
    <div className="space-y-6">
      <SectionCard title="Identité entreprise" description="Informations principales du profil company.">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <InfoCard label="Nom" value={company.name || company.companyName || '—'} />
          <InfoCard label="Industrie" value={company.industry || '—'} />
          <InfoCard label="Gigs actifs" value={String(gigsCount ?? 0)} />
          <InfoCard label="Company ID" value={String(company._id || '—')} />
        </div>
      </SectionCard>

      <SectionCard title="Présentation">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Overview</p>
            <p className="text-sm text-slate-700 leading-relaxed">{company.overview || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
              <Target size={14} /> Mission
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">{company.mission || '—'}</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Culture & avantages">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <Heart size={16} className="text-[#E91E8C]" /> Valeurs
            </p>
            <TagList items={culture.values} emptyLabel="Aucune valeur renseignée." />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <Sparkles size={16} className="text-[#E91E8C]" /> Avantages
            </p>
            <TagList items={culture.benefits} emptyLabel="Aucun avantage renseigné." />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm font-semibold text-slate-800 mb-2">Environnement de travail</p>
          <p className="text-sm text-slate-700 leading-relaxed">{culture.workEnvironment || '—'}</p>
        </div>
      </SectionCard>

      <SectionCard title="Abonnement & opportunités">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <InfoCard label="Plan" value={displayValue(subscription.planName || subscription.plan)} />
          <InfoCard label="Statut abonnement" value={subscription.status || '—'} />
        </div>
        <p className="text-sm font-semibold text-slate-800 mb-2">Opportunités</p>
        <TagList items={company.opportunities} emptyLabel="Aucune opportunité renseignée." />
      </SectionCard>

      {onboardingProgress && (
        <SectionCard title="Progression onboarding">
          <CompanyOnboardingTimeline onboardingProgress={onboardingProgress as any} />
        </SectionCard>
      )}
    </div>
  );
}

export function RepProfileView({ agent }: { agent: Record<string, any> }) {
  const personal = agent.personalInfo || {};
  const summary = agent.professionalSummary || {};
  const skills = agent.skills || {};
  const experience = Array.isArray(agent.experience) ? agent.experience : [];

  const skillGroups = [
    { title: 'Technique', items: skills.technical || [] },
    { title: 'Professionnel', items: skills.professional || [] },
    { title: 'Soft skills', items: skills.soft || [] },
    { title: 'Contact center', items: skills.contactCenter || [] },
  ];

  const industries = normalizeListItems(summary.industries);
  const activities = normalizeListItems(summary.activities);
  const expertise = normalizeListItems(summary.keyExpertise);

  return (
    <div className="space-y-6">
      <SectionCard title="Identité REP">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <InfoCard label="Nom" value={personal.name || '—'} />
          <InfoCard label="Email" value={personal.email || '—'} />
          <InfoCard label="Téléphone" value={personal.phone || '—'} />
          <InfoCard label="Statut profil" value={agent.status || '—'} />
          <InfoCard
            label="Profil de base"
            value={agent.isBasicProfileCompleted ? 'Complet' : 'Incomplet'}
          />
          <InfoCard label="Abonnement" value={agent.subscriptionStatus || '—'} />
        </div>
      </SectionCard>

      <SectionCard title="Résumé professionnel">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard label="Industries" value={industries.join(', ') || '—'} />
          <InfoCard label="Activités" value={activities.join(', ') || '—'} />
          <InfoCard label="Expertises clés" value={expertise.join(', ') || '—'} />
          <InfoCard label="Gigs liés" value={String(agent.gigsCount ?? 0)} />
        </div>
      </SectionCard>

      <SectionCard title="Compétences">
        <SkillList groups={skillGroups} />
      </SectionCard>

      <SectionCard title="Expériences">
        {experience.length === 0 ? (
          <p className="text-sm text-slate-500">Aucune expérience renseignée.</p>
        ) : (
          <div className="space-y-3">
            {experience.slice(0, 8).map((item: any, index: number) => (
              <div key={index} className="rounded-xl border border-slate-100 p-4">
                <p className="font-semibold text-slate-900 flex items-center gap-2">
                  <Briefcase size={16} className="text-[#E91E8C]" />
                  {displayValue(item.title || item.role || item.company || 'Expérience')}
                </p>
                {item.company && (
                  <p className="text-sm text-slate-600 mt-1">{displayValue(item.company)}</p>
                )}
                {item.description && (
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">{item.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {agent.onboardingProgress && (
        <SectionCard title="Progression onboarding">
          <RepOnboardingTimeline onboardingProgress={agent.onboardingProgress} />
        </SectionCard>
      )}
    </div>
  );
}

export function ProfileHero({
  fullName,
  email,
  typeUser,
  onboardingDisplay,
  onboardingStatus,
}: {
  fullName: string;
  email: string;
  typeUser?: string | null;
  onboardingDisplay?: string;
  onboardingStatus?: string;
}) {
  const Icon = typeUser === 'company' ? Building2 : typeUser === 'rep' ? User : Globe;

  return (
    <div className="rounded-2xl bg-gradient-to-r from-[#F7631B] to-[#E91E8C] p-6 text-white shadow-lg">
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
          <Icon size={28} />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-black truncate">{fullName}</h1>
          <p className="text-white/90 mt-1 truncate">{email}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase">
              {typeUser || 'compte'}
            </span>
            {onboardingDisplay && (
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                {onboardingDisplay}
              </span>
            )}
            {onboardingStatus && (
              <span className="rounded-full bg-black/20 px-3 py-1 text-xs font-semibold">
                {onboardingStatus}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
