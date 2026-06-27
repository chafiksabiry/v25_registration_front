import React from 'react';
import { Briefcase, Building2, Globe, Heart, Sparkles, Target, User } from 'lucide-react';
import { InfoCard, SectionCard, StatusBadge, formatDate } from './adminUiUtils';
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
            className="admin-row-card flex items-center justify-between gap-4"
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
            className="admin-row-card flex items-center justify-between gap-4"
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

function localizedText(value: unknown, preferFr = true): string {
  if (value == null || value === '') return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const obj = value as { fr?: string; en?: string };
    return (preferFr ? obj.fr : obj.en) || obj.en || obj.fr || '';
  }
  return String(value);
}

function analysisSkillRows(items: unknown[] | undefined) {
  if (!Array.isArray(items) || !items.length) return null;
  return items.map((raw, index) => {
    const item = raw as { skill?: string; score?: number; evidence?: unknown; level?: string };
    const evidence = localizedText(item.evidence);
    return (
      <div key={`skill-${index}`} className="admin-row-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-slate-900">{item.skill || '—'}</span>
          <div className="flex flex-wrap gap-2">
            {item.level && <StatusBadge label={item.level} tone="neutral" />}
            {item.score != null && <StatusBadge label={`Score ${item.score}`} tone="neutral" />}
          </div>
        </div>
        {evidence && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{evidence}</p>}
      </div>
    );
  });
}

function analysisRefRows(items: unknown[] | undefined, labelKey: 'industry' | 'activity') {
  if (!Array.isArray(items) || !items.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((raw, index) => {
        const item = raw as Record<string, unknown>;
        const label = String(item[labelKey] || '—');
        const score = item.score != null ? ` (${item.score})` : '';
        return (
          <span
            key={`${labelKey}-${index}`}
            className="rounded-full bg-gradient-to-r from-violet-100 to-fuchsia-100 text-violet-800 px-3 py-1 text-xs font-semibold border border-violet-200/60"
          >
            {label}
            {score}
          </span>
        );
      })}
    </div>
  );
}

function contactCenterRows(skills: Record<string, unknown> | undefined) {
  if (!skills || typeof skills !== 'object') return null;
  const entries = Object.entries(skills).filter(([, value]) => {
    const score = (value as { score?: number })?.score;
    return typeof score === 'number' && score > 0;
  });
  if (!entries.length) return null;

  return entries.map(([key, value]) => {
    const entry = value as { score?: number; notes?: unknown };
    return (
      <div key={key} className="admin-row-card">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-slate-900 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
          <StatusBadge label={`Score ${entry.score}`} tone="neutral" />
        </div>
        {entry.notes && (
          <p className="text-xs text-slate-500 mt-1">{localizedText(entry.notes)}</p>
        )}
      </div>
    );
  });
}

function ExperienceVideoAnalysisPanel({ experience }: { experience: Record<string, any> }) {
  const analysis = experience.videoAnalysis;
  const fraud = experience.videoFraudCheck;
  const relevance = experience.videoRelevance || analysis?.relevance;
  const languageAssessment = experience.videoLanguageAssessment;

  if (!analysis || typeof analysis !== 'object' || !Object.keys(analysis).length) {
    return null;
  }

  const fraudTone =
    fraud?.fraudRisk === 'low' ? 'success' : fraud?.fraudRisk === 'medium' ? 'warning' : 'danger';

  return (
    <div className="admin-analysis-panel space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
          Analyse IA de la vidéo
        </p>
        {experience.videoAnalyzedAt && (
          <span className="text-xs text-slate-500">Analysée le {formatDate(experience.videoAnalyzedAt)}</span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <InfoCard
          label="Confiance globale"
          value={analysis.overallConfidence != null ? `${analysis.overallConfidence}%` : '—'}
        />
        <InfoCard label="Langue détectée" value={analysis.detectedLanguageOfSpeech || '—'} />
        <InfoCard
          label="Durée vidéo"
          value={experience.videoDuration != null ? `${Math.round(experience.videoDuration)} s` : '—'}
        />
        <InfoCard
          label="Pertinence"
          value={
            relevance?.onTopic != null
              ? `${relevance.onTopic ? 'Sujet OK' : 'Hors sujet'}${relevance.score != null ? ` (${relevance.score})` : ''}`
              : '—'
          }
        />
      </div>

      {localizedText(analysis.summary) && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Résumé IA</p>
          <p className="text-sm text-slate-700 leading-relaxed">{localizedText(analysis.summary)}</p>
        </div>
      )}

      {localizedText(relevance?.reason) && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Justification pertinence</p>
          <p className="text-sm text-slate-600 leading-relaxed">{localizedText(relevance?.reason)}</p>
        </div>
      )}

      {experience.videoTranscription && (
        <details className="admin-row-card bg-white/80 px-3 py-2">
          <summary className="cursor-pointer text-sm font-semibold text-slate-800">
            Transcription
          </summary>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed whitespace-pre-wrap">
            {experience.videoTranscription}
          </p>
        </details>
      )}

      {Array.isArray(analysis.spokenLanguages) && analysis.spokenLanguages.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Langues parlées</p>
          {analysis.spokenLanguages.map((raw: unknown, index: number) => {
            const lang = raw as { language?: string; level?: string; score?: number; evidence?: unknown };
            return (
              <div key={`lang-${index}`} className="admin-row-card bg-white/80">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-slate-900">{lang.language || '—'}</span>
                  <div className="flex flex-wrap gap-2">
                    {lang.level && <StatusBadge label={lang.level} tone="success" />}
                    {lang.score != null && <StatusBadge label={`Score ${lang.score}`} tone="neutral" />}
                  </div>
                </div>
                {lang.evidence && (
                  <p className="text-xs text-slate-500 mt-1">{localizedText(lang.evidence)}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {Array.isArray(analysis.technicalSkills) && analysis.technicalSkills.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Compétences techniques détectées</p>
          <div className="space-y-2">{analysisSkillRows(analysis.technicalSkills)}</div>
        </div>
      )}

      {Array.isArray(analysis.professionalSkills) && analysis.professionalSkills.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Compétences professionnelles détectées</p>
          <div className="space-y-2">{analysisSkillRows(analysis.professionalSkills)}</div>
        </div>
      )}

      {Array.isArray(analysis.softSkills) && analysis.softSkills.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Soft skills détectées</p>
          <div className="space-y-2">{analysisSkillRows(analysis.softSkills)}</div>
        </div>
      )}

      {(Array.isArray(analysis.industries) && analysis.industries.length > 0) ||
      (Array.isArray(analysis.activities) && analysis.activities.length > 0) ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.isArray(analysis.industries) && analysis.industries.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Industries</p>
              {analysisRefRows(analysis.industries, 'industry')}
            </div>
          )}
          {Array.isArray(analysis.activities) && analysis.activities.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Activités</p>
              {analysisRefRows(analysis.activities, 'activity')}
            </div>
          )}
        </div>
      ) : null}

      {analysis.contactCenterSkills && contactCenterRows(analysis.contactCenterSkills) && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Compétences contact center</p>
          <div className="space-y-2">{contactCenterRows(analysis.contactCenterSkills)}</div>
        </div>
      )}

      {languageAssessment?.assessable && Array.isArray(languageAssessment.languages) && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Évaluation linguistique vidéo</p>
          {languageAssessment.languages.map((raw: unknown, index: number) => {
            const lang = raw as {
              language?: string;
              cefr?: string;
              overallScore?: number;
              fluency?: { score?: number; feedback?: unknown };
              grammar?: { score?: number; feedback?: unknown };
              vocabulary?: { score?: number; feedback?: unknown };
              coherence?: { score?: number; feedback?: unknown };
              strengths?: unknown;
              areasForImprovement?: unknown;
            };
            return (
              <div key={`la-${index}`} className="admin-row-card bg-white/80 p-3 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-900">{lang.language || '—'}</span>
                  <div className="flex flex-wrap gap-2">
                    {lang.cefr && <StatusBadge label={`CEFR ${lang.cefr}`} tone="success" />}
                    {lang.overallScore != null && (
                      <StatusBadge label={`Score ${lang.overallScore}`} tone="neutral" />
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-600">
                  {lang.fluency?.score != null && <span>Fluidité : {lang.fluency.score}</span>}
                  {lang.grammar?.score != null && <span>Grammaire : {lang.grammar.score}</span>}
                  {lang.vocabulary?.score != null && <span>Vocabulaire : {lang.vocabulary.score}</span>}
                  {lang.coherence?.score != null && <span>Cohérence : {lang.coherence.score}</span>}
                </div>
                {lang.strengths && (
                  <p className="text-xs text-emerald-700">{localizedText(lang.strengths)}</p>
                )}
                {lang.areasForImprovement && (
                  <p className="text-xs text-amber-700">{localizedText(lang.areasForImprovement)}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {fraud && typeof fraud === 'object' && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Contrôle anti-fraude</p>
            {fraud.fraudRisk && (
              <StatusBadge label={`Risque ${fraud.fraudRisk}`} tone={fraudTone} />
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-600">
            <span>Visage détecté : {fraud.faceDetected ? 'Oui' : 'Non'}</span>
            <span>En direct : {fraud.looksLive ? 'Oui' : 'Non'}</span>
            <span>Même personne : {fraud.samePersonAcrossFrames ? 'Oui' : 'Non'}</span>
            {fraud.livenessConfidence != null && <span>Confiance live : {fraud.livenessConfidence}%</span>}
          </div>
          {Array.isArray(fraud.reasons) && fraud.reasons.length > 0 && (
            <ul className="list-disc pl-5 text-xs text-slate-500 space-y-1">
              {fraud.reasons.map((reason: unknown, index: number) => (
                <li key={`fraud-${index}`}>{localizedText(reason)}</li>
              ))}
            </ul>
          )}
        </div>
      )}
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
          className="admin-tag-chip"
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
            <div key={key} className="admin-row-card flex items-center justify-between">
              <span className="text-sm font-medium text-slate-900">{item}</span>
              <span className="text-xs text-slate-400">{group}</span>
            </div>
          );
        }

        const skill = item as {
          skill?: string;
          skillId?: string;
          level?: number;
          details?: string;
          fromVideoAnalysis?: boolean;
          needsReanalysis?: boolean;
        };

        const showVideoStatus = skill.fromVideoAnalysis || skill.needsReanalysis;

        return (
          <div key={key} className="admin-row-card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">{skill.skill || '—'}</p>
                <p className="text-xs text-slate-400 mt-0.5">{group}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {skill.level != null && <StatusBadge label={`Niv. ${skill.level}`} tone="neutral" />}
                {showVideoStatus && (
                  <StatusBadge
                    label={
                      skill.needsReanalysis
                        ? 'Vidéo manquante — ré-analyser requis'
                        : 'Analyse vidéo OK'
                    }
                    tone={skill.needsReanalysis ? 'danger' : 'success'}
                  />
                )}
              </div>
            </div>
            {skill.details && !skill.fromVideoAnalysis && (
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
    <div className="space-y-6 admin-stagger">
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
              <Heart size={16} className="text-fuchsia-600" /> Valeurs
            </p>
            <TagList items={culture.values} emptyLabel="Aucune valeur renseignée." />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <Sparkles size={16} className="text-violet-600" /> Avantages
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
  const photoUrl = personal.photo?.url || agent.photo?.url;
  const mediaSummary = agent.mediaSummary as
    | { experiencesNeedingReanalysis?: number; hasValidVideoAnalysis?: boolean }
    | undefined;

  return (
    <div className="space-y-6 admin-stagger">
      {mediaSummary?.experiencesNeedingReanalysis ? (
        <SectionCard title="Médias vidéo">
          <StatusBadge
            label={`${mediaSummary.experiencesNeedingReanalysis} expérience(s) sans vidéo valide — ré-analyse requise`}
            tone="danger"
          />
        </SectionCard>
      ) : null}
      {photoUrl && (
        <SectionCard title="Photo de profil">
          <img
            src={photoUrl}
            alt={personal.name || 'Photo de profil'}
            className="h-40 w-40 rounded-2xl object-cover border-2 border-violet-200/60 shadow-lg shadow-violet-200/40 transition-transform duration-300 hover:scale-[1.02]"
          />
        </SectionCard>
      )}

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
          <InfoCard label="Plan" value={agent.planName || agent.plan || '—'} />
          <InfoCard label="Statut abonnement" value={agent.subscriptionStatus || '—'} />
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

      <SectionCard title="Expériences" description="Vidéos et analyses IA par expérience professionnelle.">
        {experience.length === 0 ? (
          <p className="text-sm text-slate-500">Aucune expérience renseignée.</p>
        ) : (
          <div className="space-y-3">
            {experience.slice(0, 8).map((item: any, index: number) => {
              const mediaStatus = item.mediaStatus as
                | { hasVideo?: boolean; videoOk?: boolean; needsReanalysis?: boolean }
                | undefined;
              const showVideo = Boolean(item.videoUrl && mediaStatus?.videoOk !== false);
              const needsReanalysis = Boolean(
                mediaStatus?.needsReanalysis ||
                  (item.videoAnalysis && !item.videoUrl) ||
                  (item.videoUrl && mediaStatus?.videoOk === false),
              );

              return (
              <div key={index} className="admin-experience-card">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-semibold text-indigo-950 flex items-center gap-2">
                    <Briefcase size={16} className="text-fuchsia-600" />
                    {displayValue(item.title || item.role || item.company || 'Expérience')}
                  </p>
                  {needsReanalysis && (
                    <StatusBadge label="Vidéo manquante — ré-analyser requis" tone="danger" />
                  )}
                  {showVideo && !needsReanalysis && (
                    <StatusBadge label="Analyse vidéo OK" tone="success" />
                  )}
                </div>
                {item.company && (
                  <p className="text-sm text-slate-600 mt-1">{displayValue(item.company)}</p>
                )}
                {item.description && (
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">{item.description}</p>
                )}
                {showVideo && (
                  <div className="mt-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-violet-500 mb-2">
                      Vidéo expérience
                    </p>
                    <video
                      src={item.videoUrl}
                      controls
                      preload="metadata"
                      className="w-full max-w-xl rounded-xl border border-violet-200/50 bg-black/5 shadow-md transition-shadow duration-300 hover:shadow-lg"
                    >
                      Votre navigateur ne supporte pas la lecture vidéo.
                    </video>
                  </div>
                )}
                <ExperienceVideoAnalysisPanel experience={item} />
              </div>
              );
            })}
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
  photoUrl,
}: {
  fullName: string;
  email: string;
  typeUser?: string | null;
  onboardingDisplay?: string;
  onboardingStatus?: string;
  photoUrl?: string;
}) {
  const Icon = typeUser === 'company' ? Building2 : typeUser === 'rep' ? User : Globe;

  return (
    <div className="admin-hero">
      <div className="admin-hero-content flex items-start gap-4">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={fullName}
            className="h-16 w-16 rounded-2xl object-cover border-2 border-white/40 shrink-0 shadow-lg ring-2 ring-white/20"
          />
        ) : (
          <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm border border-white/30">
            <Icon size={28} />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-black truncate drop-shadow-sm">{fullName}</h1>
          <p className="text-white/90 mt-1 truncate">{email}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="admin-tag">
              {typeUser || 'compte'}
            </span>
            {onboardingDisplay && (
              <span className="admin-tag">
                {onboardingDisplay}
              </span>
            )}
            {onboardingStatus && (
              <span className="admin-tag bg-black/20">
                {onboardingStatus}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
