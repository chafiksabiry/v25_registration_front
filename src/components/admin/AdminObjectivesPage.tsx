import React, { useEffect, useState } from 'react';
import { Target } from 'lucide-react';
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
  description?: string | null;
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

const FINANCIAL_HELP = {
  revenue: {
    title: 'CA annuel (Chiffre d\'affaires)',
    body:
      'Total des revenus qui transitent par HARX sur l\'année : commissions plateforme, abonnements entreprises, achats de numéros téléphoniques et part HARX sur les transactions REPs.',
  },
  profit: {
    title: 'Profit annuel HARX',
    body:
      'Marge réellement conservée par HARX : commissions + part HARX sur transactions REPs + abonnements entreprises. N\'inclut pas les reversements téléphonie ni les coûts opérationnels externes.',
  },
};

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
      return { text: 'Objectif non défini', tone: 'neutral' as const };
  }
}

function ComparisonProgress({ row }: { row: ComparisonRow }) {
  if (row.progress == null) {
    return (
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-900">{formatActual(row.actual, row.unit)}</p>
        <p className="text-xs text-slate-500">Réel actuel — saisissez un objectif pour comparer</p>
      </div>
    );
  }

  const toneClass =
    row.status === 'reached'
      ? 'bg-emerald-500'
      : row.status === 'on_track'
        ? 'bg-amber-500'
        : 'bg-red-500';

  const badge = statusLabel(row.status);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-slate-900">{formatActual(row.actual, row.unit)}</span>
          {' / '}
          {formatTarget(row.target, row.unit)}
        </p>
        <span className={`admin-badge admin-badge--${badge.tone}`}>{badge.text}</span>
      </div>
      <div className="h-2 rounded-full bg-violet-100/80 overflow-hidden">
        <div className={`h-full rounded-full ${toneClass}`} style={{ width: `${row.progress}%` }} />
      </div>
      <p className="text-xs text-slate-500">
        {row.progress}% · écart {row.unit === 'money' ? formatMoney(row.gap ?? 0) : (row.gap ?? 0).toLocaleString('fr-FR')}
      </p>
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
        subtitle="Définissez vos cibles annuelles et comparez-les aux données réelles de la plateforme."
        badge="Stratégie"
      />

      {loading ? (
        <p className="text-violet-600/70 animate-pulse">Chargement…</p>
      ) : (
        <>
          {error && !saving && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <section className="admin-card p-6 space-y-5">
              <div>
                <h2 className="admin-section-title">Vos objectifs</h2>
                <p className="admin-section-desc">Saisissez les cibles à atteindre. Laissez vide si non applicable.</p>
              </div>

              <AdminField id="objectives-year" label="Année de référence">
                <input
                  id="objectives-year"
                  type="number"
                  min={2020}
                  max={2100}
                  value={form.year}
                  onChange={(e) => updateField('year', e.target.value)}
                  className="admin-input !pl-3"
                />
              </AdminField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AdminField
                  id="objectives-companies"
                  label="Entreprises"
                  hint="Signées et onboardées — une seule cible pour les deux."
                >
                  <input
                    id="objectives-companies"
                    type="number"
                    min={0}
                    value={form.companies}
                    onChange={(e) => updateField('companies', e.target.value)}
                    placeholder="Ex. 250"
                    className="admin-input !pl-3"
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
                    className="admin-input !pl-3"
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
                    className="admin-input !pl-3"
                  />
                </AdminField>
                <AdminField
                  id="objectives-revenue"
                  label="CA annuel (€)"
                  hint={FINANCIAL_HELP.revenue.body}
                >
                  <input
                    id="objectives-revenue"
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.annualRevenue}
                    onChange={(e) => updateField('annualRevenue', e.target.value)}
                    placeholder="Ex. 1500000"
                    className="admin-input !pl-3"
                  />
                </AdminField>
                <AdminField
                  id="objectives-profit"
                  label="Profit annuel HARX (€)"
                  hint={FINANCIAL_HELP.profit.body}
                >
                  <input
                    id="objectives-profit"
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.annualProfit}
                    onChange={(e) => updateField('annualProfit', e.target.value)}
                    placeholder="Ex. 1000000"
                    className="admin-input !pl-3"
                  />
                </AdminField>
              </div>

              <div className="rounded-xl border border-violet-200/80 bg-violet-50/60 px-4 py-3 space-y-2 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">Comprendre les indicateurs financiers</p>
                <p>
                  <span className="font-medium">{FINANCIAL_HELP.revenue.title} — </span>
                  {FINANCIAL_HELP.revenue.body}
                </p>
                <p>
                  <span className="font-medium">{FINANCIAL_HELP.profit.title} — </span>
                  {FINANCIAL_HELP.profit.body}
                </p>
                <p className="text-xs text-slate-500">
                  En résumé : le CA inclut tout ce qui passe par la plateforme ; le profit HARX est la part que HARX garde (sans la téléphonie reversée).
                </p>
              </div>

              <AdminField id="objectives-notes" label="Notes internes" hint="Optionnel — contexte ou rappels pour l'équipe.">
                <textarea
                  id="objectives-notes"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  className="admin-input !pl-3 min-h-[88px] resize-y"
                />
              </AdminField>
            </section>

            <section className="admin-card p-6 space-y-5">
              <div>
                <h2 className="admin-section-title">Réel vs objectif</h2>
                <p className="admin-section-desc">
                  Données live de la plateforme — année {actualYear}
                </p>
              </div>

              <div className="space-y-4">
                {comparison.map((row) => (
                  <div key={row.key} className="admin-info-tile space-y-2">
                    <p className="font-semibold text-slate-900">{row.label}</p>
                    {row.description && (
                      <p className="text-xs text-slate-500 leading-relaxed">{row.description}</p>
                    )}
                    <ComparisonProgress row={row} />
                  </div>
                ))}
              </div>
            </section>
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
