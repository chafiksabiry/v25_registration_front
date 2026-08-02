import React, { useEffect, useMemo, useState } from 'react';
import { Building2, Euro, Target, TrendingUp, Users } from 'lucide-react';
import { adminApi } from '../../lib/api';
import { formatMoney } from './adminUiUtils';
import { AdminField, AdminPageHeader, AdminSaveBar } from './adminPageShell';

type ComparisonRow = {
  key: string;
  label: string;
  target: number | null;
  actual: number;
  progress: number | null;
  gap: number | null;
  unit: 'count' | 'money';
  status: 'no_target' | 'reached' | 'on_track' | 'behind';
};

type ObjectivesForm = {
  year: string;
  companies: string;
  repsOnboarded: string;
  repsWithActiveSubscription: string;
  annualRevenue: string;
  annualProfit: string;
  notes: string;
};

const FINANCIAL_HELP = (
  <>
    <strong>CA annuel</strong> — tout ce qui transite par HARX (commissions, abonnements entreprises,
    numéros téléphoniques, part HARX sur transactions REPs).{' '}
    <strong>Profit HARX</strong> — la marge conservée par HARX (commissions + part REPs + abonnements),
    hors reversements téléphonie et coûts externes.
  </>
);

function toForm(targets: Record<string, any>): ObjectivesForm {
  const fmt = (value: number | null | undefined) =>
    value == null ? '' : String(value);

  return {
    year: String(targets.year ?? new Date().getFullYear()),
    companies: fmt(targets.companies ?? targets.companiesOnboarded ?? targets.companiesSigned),
    repsOnboarded: fmt(targets.repsOnboarded),
    repsWithActiveSubscription: fmt(targets.repsWithActiveSubscription),
    annualRevenue: fmt(targets.annualRevenue),
    annualProfit: fmt(targets.annualProfit),
    notes: targets.notes || '',
  };
}

function formatActual(value: number, unit: ComparisonRow['unit']) {
  if (unit === 'money') return formatMoney(value);
  return value.toLocaleString('fr-FR');
}

function formatTarget(value: number | null, unit: ComparisonRow['unit']) {
  if (value == null) return '—';
  if (unit === 'money') return formatMoney(value);
  return value.toLocaleString('fr-FR');
}

function statusLabel(status: ComparisonRow['status']) {
  switch (status) {
    case 'reached':
      return { text: 'Atteint', tone: 'success' as const };
    case 'on_track':
      return { text: 'En bonne voie', tone: 'warning' as const };
    case 'behind':
      return { text: 'En retard', tone: 'danger' as const };
    default:
      return { text: 'Non défini', tone: 'neutral' as const };
  }
}

function progressFillClass(status: ComparisonRow['status']) {
  if (status === 'reached') return 'admin-objectives-progress-fill--reached';
  if (status === 'on_track') return 'admin-objectives-progress-fill--on_track';
  return 'admin-objectives-progress-fill--behind';
}

function ComparisonProgress({ row }: { row: ComparisonRow }) {
  if (row.progress == null) {
    return (
      <div className="space-y-1">
        <p className="text-lg font-black text-slate-900">{formatActual(row.actual, row.unit)}</p>
        <p className="text-xs text-slate-500">Réel actuel — définissez un objectif</p>
      </div>
    );
  }

  const badge = statusLabel(row.status);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-lg font-black text-slate-900">{formatActual(row.actual, row.unit)}</p>
          <p className="text-xs text-slate-500">objectif {formatTarget(row.target, row.unit)}</p>
        </div>
        <span className={`admin-badge admin-badge--${badge.tone}`}>{badge.text}</span>
      </div>
      <div className="admin-objectives-progress-track">
        <div
          className={`admin-objectives-progress-fill ${progressFillClass(row.status)}`}
          style={{ width: `${row.progress}%` }}
        />
      </div>
      <p className="text-xs font-semibold text-slate-500">
        {row.progress}% · écart{' '}
        {row.unit === 'money' ? formatMoney(row.gap ?? 0) : (row.gap ?? 0).toLocaleString('fr-FR')}
      </p>
    </div>
  );
}

function TrackSection({
  title,
  icon: Icon,
  variant,
  rows,
}: {
  title: string;
  icon: React.ElementType;
  variant: 'track' | 'finance';
  rows: ComparisonRow[];
}) {
  const iconClass =
    variant === 'finance' ? 'admin-objectives-panel-icon--finance' : 'admin-objectives-panel-icon--track';
  const headClass =
    variant === 'finance' ? 'admin-objectives-panel-head--finance' : 'admin-objectives-panel-head--track';
  const gridClass =
    variant === 'finance'
      ? 'admin-objectives-track-grid admin-objectives-track-grid--finance'
      : 'admin-objectives-track-grid';
  const cardClass =
    variant === 'finance' ? 'admin-objectives-track-card admin-objectives-track-card--finance' : 'admin-objectives-track-card';

  return (
    <div className="admin-objectives-panel">
      <div className={`admin-objectives-panel-head ${headClass}`}>
        <span className={`admin-objectives-panel-icon ${iconClass}`}>
          <Icon size={16} />
        </span>
        <p className="admin-objectives-panel-title">{title}</p>
      </div>
      <div className="admin-objectives-panel-body">
        <div className={gridClass}>
          {rows.map((row) => (
            <div key={row.key} className={cardClass}>
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">{row.label}</p>
              <ComparisonProgress row={row} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminObjectivesPage() {
  const [form, setForm] = useState<ObjectivesForm>(toForm({ year: new Date().getFullYear() }));
  const [comparison, setComparison] = useState<ComparisonRow[]>([]);
  const [actualYear, setActualYear] = useState(new Date().getFullYear());
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const growthRows = useMemo(
    () => comparison.filter((row) => row.unit === 'count'),
    [comparison],
  );
  const financeRows = useMemo(
    () => comparison.filter((row) => row.unit === 'money'),
    [comparison],
  );
  const reachedCount = useMemo(
    () => comparison.filter((row) => row.status === 'reached').length,
    [comparison],
  );

  const load = () => {
    setLoading(true);
    setError(null);
    adminApi
      .objectives()
      .then((response) => {
        setForm(toForm(response.data.targets));
        setComparison(response.data.comparison || []);
        setActualYear(response.data.actual?.year ?? new Date().getFullYear());
        setUpdatedAt(response.data.targets?.updatedAt || null);
      })
      .catch(() => setError('Impossible de charger les objectifs HARX.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const updateField = (field: keyof ObjectivesForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const parseField = (value: string) => {
    const trimmed = value.trim();
    return trimmed === '' ? null : Number(trimmed.replace(',', '.'));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await adminApi.updateObjectives({
        year: Number(form.year),
        companies: parseField(form.companies),
        repsOnboarded: parseField(form.repsOnboarded),
        repsWithActiveSubscription: parseField(form.repsWithActiveSubscription),
        annualRevenue: parseField(form.annualRevenue),
        annualProfit: parseField(form.annualProfit),
        notes: form.notes,
      });
      setForm(toForm(response.data.targets));
      setComparison(response.data.comparison || []);
      setActualYear(response.data.actual?.year ?? new Date().getFullYear());
      setUpdatedAt(response.data.targets?.updatedAt || null);
      setSuccess('Objectifs enregistrés.');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Enregistrement impossible.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 admin-stagger pb-24">
      <AdminPageHeader
        icon={Target}
        title="Objectifs HARX"
        subtitle="Cibles annuelles vs données live de la plateforme."
        badge="Stratégie"
      />

      {loading ? (
        <p className="text-violet-600/70 animate-pulse">Chargement…</p>
      ) : (
        <>
          {error && !saving && (
            <div className="admin-alert admin-alert--error">{error}</div>
          )}

          <div className="admin-objectives-hero">
            <div className="admin-objectives-hero-inner">
              <div>
                <p className="admin-objectives-hero-title">Année {form.year || actualYear}</p>
                <p className="admin-objectives-hero-meta">
                  Suivi en temps réel · {comparison.length} indicateurs · {reachedCount} atteint{reachedCount > 1 ? 's' : ''}
                </p>
              </div>
              <span className="admin-objectives-hero-pill">Données live {actualYear}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            <div className="space-y-6">
              <div className="admin-objectives-panel">
                <div className="admin-objectives-panel-head">
                  <span className="admin-objectives-panel-icon">
                    <Building2 size={16} />
                  </span>
                  <p className="admin-objectives-panel-title">Croissance — objectifs</p>
                </div>
                <div className="admin-objectives-panel-body space-y-4">
                  <AdminField id="objectives-year" label="Année de référence">
                    <input
                      id="objectives-year"
                      type="number"
                      min={2020}
                      max={2100}
                      value={form.year}
                      onChange={(e) => updateField('year', e.target.value)}
                      className="admin-input admin-input--plain"
                    />
                  </AdminField>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <AdminField id="objectives-companies" label="Entreprises">
                      <input
                        id="objectives-companies"
                        type="number"
                        min={0}
                        value={form.companies}
                        onChange={(e) => updateField('companies', e.target.value)}
                        placeholder="Ex. 300"
                        className="admin-input admin-input--plain"
                      />
                    </AdminField>
                    <AdminField id="objectives-reps-onboarded" label="REPs onboardés">
                      <input
                        id="objectives-reps-onboarded"
                        type="number"
                        min={0}
                        value={form.repsOnboarded}
                        onChange={(e) => updateField('repsOnboarded', e.target.value)}
                        placeholder="Ex. 500"
                        className="admin-input admin-input--plain"
                      />
                    </AdminField>
                    <AdminField id="objectives-reps-sub" label="REPs abonnement actif">
                      <input
                        id="objectives-reps-sub"
                        type="number"
                        min={0}
                        value={form.repsWithActiveSubscription}
                        onChange={(e) => updateField('repsWithActiveSubscription', e.target.value)}
                        placeholder="Ex. 150"
                        className="admin-input admin-input--plain"
                      />
                    </AdminField>
                  </div>
                </div>
              </div>

              <div className="admin-objectives-panel">
                <div className="admin-objectives-panel-head admin-objectives-panel-head--finance">
                  <span className="admin-objectives-panel-icon admin-objectives-panel-icon--finance">
                    <Euro size={16} />
                  </span>
                  <p className="admin-objectives-panel-title">Finances — objectifs</p>
                </div>
                <div className="admin-objectives-panel-body space-y-4">
                  <div className="admin-objectives-finance-note">{FINANCIAL_HELP}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <AdminField id="objectives-revenue" label="CA annuel (€)">
                      <input
                        id="objectives-revenue"
                        type="number"
                        min={0}
                        step="0.01"
                        value={form.annualRevenue}
                        onChange={(e) => updateField('annualRevenue', e.target.value)}
                        placeholder="Ex. 1 500 000"
                        className="admin-input admin-input--plain"
                      />
                    </AdminField>
                    <AdminField id="objectives-profit" label="Profit annuel HARX (€)">
                      <input
                        id="objectives-profit"
                        type="number"
                        min={0}
                        step="0.01"
                        value={form.annualProfit}
                        onChange={(e) => updateField('annualProfit', e.target.value)}
                        placeholder="Ex. 1 000 000"
                        className="admin-input admin-input--plain"
                      />
                    </AdminField>
                  </div>
                </div>
              </div>

              <div className="admin-objectives-panel">
                <div className="admin-objectives-panel-body">
                  <AdminField id="objectives-notes" label="Notes internes">
                    <textarea
                      id="objectives-notes"
                      rows={3}
                      value={form.notes}
                      onChange={(e) => updateField('notes', e.target.value)}
                      className="admin-textarea"
                      placeholder="Contexte, rappels pour l'équipe…"
                    />
                  </AdminField>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <TrackSection title="Croissance — réel vs objectif" icon={Users} variant="track" rows={growthRows} />
              <TrackSection title="Finances — réel vs objectif" icon={TrendingUp} variant="finance" rows={financeRows} />
            </div>
          </div>

          <AdminSaveBar
            saving={saving}
            onSave={handleSave}
            updatedAt={updatedAt}
            error={error}
            success={success}
          />
        </>
      )}
    </div>
  );
}
