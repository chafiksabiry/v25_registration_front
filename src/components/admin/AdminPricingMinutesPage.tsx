import React, { useEffect, useState } from 'react';
import { Clock, Plus, Trash2 } from 'lucide-react';
import { adminApi } from '../../lib/api';
import { AdminField, AdminPageHeader, AdminSaveBar } from './adminPageShell';

type MinutePackRow = {
  label: string;
  minutes: number;
  priceEuros: string;
  active: boolean;
};

function emptyPack(): MinutePackRow {
  return { label: '', minutes: 150, priceEuros: '10.00', active: true };
}

function toRows(
  packs: Array<{ label: string; minutes: number; priceCents: number; active?: boolean }>,
): MinutePackRow[] {
  return packs.map((pack) => ({
    label: pack.label,
    minutes: pack.minutes,
    priceEuros: (pack.priceCents / 100).toFixed(2),
    active: pack.active !== false,
  }));
}

function perMinuteEuros(priceEuros: string, minutes: number) {
  const price = Number(priceEuros.replace(',', '.'));
  if (!Number.isFinite(price) || !minutes) return '—';
  return `${(price / minutes).toFixed(4)} €/min`;
}

function ActiveToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`admin-toggle ${checked ? 'admin-toggle--on' : ''}`}
    >
      <span className="admin-toggle-knob" />
    </button>
  );
}

export default function AdminPricingMinutesPage() {
  const [packs, setPacks] = useState<MinutePackRow[]>([]);
  const [customRateEuros, setCustomRateEuros] = useState('0.07');
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    adminApi
      .minutesPricing()
      .then((response) => {
        setPacks(toRows(response.data.minutePacks || []));
        setCustomRateEuros((response.data.minutesCustomRateEuros ?? 0.07).toFixed(4));
        setUpdatedAt(response.data.updatedAt || null);
      })
      .catch(() => setError('Impossible de charger les offres minutes.'))
      .finally(() => setLoading(false));
  }, []);

  const updatePack = (index: number, patch: Partial<MinutePackRow>) => {
    setPacks((current) => current.map((pack, i) => (i === index ? { ...pack, ...patch } : pack)));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        minutePacks: packs.map((pack) => ({
          label: pack.label.trim(),
          minutes: Number(pack.minutes),
          priceCents: Math.round(Number(pack.priceEuros.replace(',', '.')) * 100),
          active: pack.active,
        })),
        minutesCustomRateCents: Math.round(Number(customRateEuros.replace(',', '.')) * 100) / 100,
      };
      const response = await adminApi.updateMinutesPricing(payload);
      setPacks(toRows(response.data.minutePacks || []));
      setCustomRateEuros((response.data.minutesCustomRateEuros ?? 0.07).toFixed(4));
      setUpdatedAt(response.data.updatedAt || null);
      setSuccess('Offres minutes enregistrées.');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Enregistrement impossible.');
    } finally {
      setSaving(false);
    }
  };

  const activeCount = packs.filter((pack) => pack.active).length;

  return (
    <div className="space-y-6 admin-stagger pb-4">
      <AdminPageHeader
        icon={Clock}
        title="Offres minutes"
        subtitle="Packs affichés aux companies et tarif appliqué aux achats Stripe / PayPal."
        badge="Tarification"
      />

      {loading ? (
        <p className="text-violet-600/70 animate-pulse">Chargement…</p>
      ) : (
        <>
          <section className="admin-pricing-panel">
            <div className="admin-pricing-panel-head">
              <div>
                <h2 className="admin-section-title">Packs minutes</h2>
                <p className="admin-section-desc">
                  {activeCount} pack{activeCount > 1 ? 's' : ''} actif{activeCount > 1 ? 's' : ''} sur {packs.length}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPacks((current) => [...current, emptyPack()])}
                className="admin-btn-secondary"
              >
                <Plus size={16} />
                Ajouter un pack
              </button>
            </div>

            <div className="admin-pack-grid">
              {packs.map((pack, index) => (
                <article
                  key={`${pack.label}-${index}`}
                  className={`admin-pack-card ${pack.active ? '' : 'admin-pack-card--inactive'}`}
                >
                  <div className="admin-pack-card-top">
                    <div>
                      <p className="admin-pack-price-preview">{pack.priceEuros || '0.00'} €</p>
                      <p className="admin-pack-meta">
                        {pack.minutes || 0} min · {perMinuteEuros(pack.priceEuros, pack.minutes)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <ActiveToggle
                        checked={pack.active}
                        onChange={(value) => updatePack(index, { active: value })}
                        label={`Activer le pack ${pack.label || index + 1}`}
                      />
                      <button
                        type="button"
                        disabled={packs.length <= 1}
                        onClick={() => setPacks((current) => current.filter((_, i) => i !== index))}
                        className="admin-btn-icon"
                        aria-label="Retirer le pack"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <AdminField id={`pack-label-${index}`} label="Libellé">
                    <input
                      id={`pack-label-${index}`}
                      type="text"
                      value={pack.label}
                      onChange={(e) => updatePack(index, { label: e.target.value })}
                      className="admin-input admin-input--plain admin-input--compact"
                      placeholder="Standard"
                    />
                  </AdminField>

                  <div className="grid grid-cols-2 gap-3">
                    <AdminField id={`pack-minutes-${index}`} label="Minutes">
                      <input
                        id={`pack-minutes-${index}`}
                        type="number"
                        min={1}
                        value={pack.minutes}
                        onChange={(e) => updatePack(index, { minutes: Number(e.target.value) })}
                        className="admin-input admin-input--plain admin-input--compact"
                      />
                    </AdminField>
                    <AdminField id={`pack-price-${index}`} label="Prix (€)">
                      <input
                        id={`pack-price-${index}`}
                        type="text"
                        inputMode="decimal"
                        value={pack.priceEuros}
                        onChange={(e) => updatePack(index, { priceEuros: e.target.value })}
                        className="admin-input admin-input--plain admin-input--compact"
                      />
                    </AdminField>
                  </div>
                </article>
              ))}
            </div>

            <div className="admin-custom-rate-box">
              <AdminField
                id="custom-rate"
                label="Tarif minute personnalisée"
                hint="Appliqué quand la quantité ne correspond à aucun pack (ex. 200 minutes)."
              >
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    id="custom-rate"
                    type="text"
                    inputMode="decimal"
                    value={customRateEuros}
                    onChange={(e) => setCustomRateEuros(e.target.value)}
                    className="admin-input admin-input--plain admin-input--compact max-w-[160px]"
                  />
                  <span className="text-sm font-semibold text-slate-500">€ / min</span>
                </div>
              </AdminField>
            </div>
          </section>

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
