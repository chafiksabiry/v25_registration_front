import React, { useEffect, useState } from 'react';
import { Clock, Plus, Save, Trash2 } from 'lucide-react';
import { adminApi } from '../../lib/api';

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

  return (
    <div className="space-y-6 admin-stagger">
      <div>
        <h1 className="admin-page-title flex items-center gap-3">
          <Clock className="text-violet-500" size={28} />
          Offres minutes
        </h1>
        <p className="admin-page-subtitle">
          Packs affichés aux companies et tarif appliqué aux achats Stripe / PayPal.
        </p>
      </div>

      {loading ? (
        <p className="text-violet-600/70 animate-pulse">Chargement…</p>
      ) : (
        <>
          <section className="admin-table-wrap">
            <div className="px-6 py-4 border-b border-violet-100/80 flex items-center justify-between gap-4">
              <h2 className="admin-section-title">Packs minutes</h2>
              <button
                type="button"
                onClick={() => setPacks((current) => [...current, emptyPack()])}
                className="admin-btn-secondary inline-flex items-center gap-2"
              >
                <Plus size={16} />
                Ajouter
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="admin-table min-w-full text-sm">
                <thead className="text-left text-slate-500">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Libellé</th>
                    <th className="px-6 py-3 font-semibold">Minutes</th>
                    <th className="px-6 py-3 font-semibold">Prix (€)</th>
                    <th className="px-6 py-3 font-semibold">Actif</th>
                    <th className="px-6 py-3 font-semibold" />
                  </tr>
                </thead>
                <tbody>
                  {packs.map((pack, index) => (
                    <tr key={`${pack.label}-${index}`} className="border-t border-violet-50/80">
                      <td className="px-6 py-3">
                        <input
                          type="text"
                          value={pack.label}
                          onChange={(e) => updatePack(index, { label: e.target.value })}
                          className="admin-input"
                          placeholder="Standard"
                        />
                      </td>
                      <td className="px-6 py-3 w-32">
                        <input
                          type="number"
                          min={1}
                          value={pack.minutes}
                          onChange={(e) => updatePack(index, { minutes: Number(e.target.value) })}
                          className="admin-input"
                        />
                      </td>
                      <td className="px-6 py-3 w-36">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={pack.priceEuros}
                          onChange={(e) => updatePack(index, { priceEuros: e.target.value })}
                          className="admin-input"
                        />
                      </td>
                      <td className="px-6 py-3">
                        <input
                          type="checkbox"
                          checked={pack.active}
                          onChange={(e) => updatePack(index, { active: e.target.checked })}
                          className="h-4 w-4 rounded border-violet-300 text-violet-600"
                        />
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button
                          type="button"
                          disabled={packs.length <= 1}
                          onClick={() => setPacks((current) => current.filter((_, i) => i !== index))}
                          className="admin-btn-secondary inline-flex items-center gap-1 disabled:opacity-40"
                        >
                          <Trash2 size={14} />
                          Retirer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="admin-stat-card max-w-xl">
            <label className="admin-info-label" htmlFor="custom-rate">
              Tarif minute personnalisée (€ / min)
            </label>
            <p className="text-sm text-slate-500 mt-1 mb-3">
              Utilisé quand la quantité ne correspond à aucun pack (ex. 200 minutes).
            </p>
            <input
              id="custom-rate"
              type="text"
              inputMode="decimal"
              value={customRateEuros}
              onChange={(e) => setCustomRateEuros(e.target.value)}
              className="admin-input max-w-xs"
            />
          </section>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="admin-btn-primary inline-flex items-center gap-2 disabled:opacity-60"
            >
              <Save size={16} />
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            {updatedAt && (
              <p className="text-sm text-slate-500">
                Dernière mise à jour : {new Date(updatedAt).toLocaleString('fr-FR')}
              </p>
            )}
          </div>

          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-emerald-600">{success}</p>}
        </>
      )}
    </div>
  );
}
