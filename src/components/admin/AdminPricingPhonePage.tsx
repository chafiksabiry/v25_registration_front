import React, { useEffect, useState } from 'react';
import { Phone, Save } from 'lucide-react';
import { adminApi } from '../../lib/api';

export default function AdminPricingPhonePage() {
  const [setupFeeEuros, setSetupFeeEuros] = useState('9.99');
  const [currency, setCurrency] = useState('EUR');
  const [trialDays, setTrialDays] = useState('15');
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    adminApi
      .phoneLinePricing()
      .then((response) => {
        setSetupFeeEuros((response.data.setupFeeEuros ?? 9.99).toFixed(2));
        setCurrency(response.data.currency || 'EUR');
        setTrialDays(String(response.data.trialDays ?? 15));
        setUpdatedAt(response.data.updatedAt || null);
      })
      .catch(() => setError('Impossible de charger la tarification téléphone.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await adminApi.updatePhoneLinePricing({
        setupFeeEuros: Number(setupFeeEuros.replace(',', '.')),
        currency: currency.trim().toUpperCase(),
        trialDays: Number(trialDays),
      });
      setSetupFeeEuros((response.data.setupFeeEuros ?? 9.99).toFixed(2));
      setCurrency(response.data.currency || 'EUR');
      setTrialDays(String(response.data.trialDays ?? 15));
      setUpdatedAt(response.data.updatedAt || null);
      setSuccess('Tarification téléphone enregistrée.');
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
          <Phone className="text-violet-500" size={28} />
          Lignes téléphoniques
        </h1>
        <p className="admin-page-subtitle">
          Prix de mise en service et durée d&apos;essai gratuit pour la première ligne company.
        </p>
      </div>

      {loading ? (
        <p className="text-violet-600/70 animate-pulse">Chargement…</p>
      ) : (
        <>
          <section className="admin-stat-card max-w-xl space-y-5">
            <div>
              <label className="admin-info-label" htmlFor="setup-fee">
                Prix activation ligne (€)
              </label>
              <p className="text-sm text-slate-500 mt-1 mb-3">
                Montant facturé via Stripe / PayPal à partir de la 2e ligne.
              </p>
              <input
                id="setup-fee"
                type="text"
                inputMode="decimal"
                value={setupFeeEuros}
                onChange={(e) => setSetupFeeEuros(e.target.value)}
                className="admin-input max-w-xs"
              />
            </div>

            <div>
              <label className="admin-info-label" htmlFor="currency">
                Devise
              </label>
              <input
                id="currency"
                type="text"
                maxLength={3}
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                className="admin-input max-w-xs mt-3"
              />
            </div>

            <div>
              <label className="admin-info-label" htmlFor="trial-days">
                Essai gratuit (jours)
              </label>
              <p className="text-sm text-slate-500 mt-1 mb-3">
                Durée offerte pour la première ligne téléphonique d&apos;une company.
              </p>
              <input
                id="trial-days"
                type="number"
                min={0}
                max={365}
                value={trialDays}
                onChange={(e) => setTrialDays(e.target.value)}
                className="admin-input max-w-xs"
              />
            </div>
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
