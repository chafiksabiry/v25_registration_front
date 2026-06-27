import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Coins, Phone } from 'lucide-react';
import { adminApi } from '../../lib/api';
import { AdminField, AdminPageHeader, AdminSaveBar } from './adminPageShell';

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

  const preview = useMemo(() => {
    const fee = Number(setupFeeEuros.replace(',', '.'));
    const days = Number(trialDays);
    return {
      feeLabel: Number.isFinite(fee) ? `${fee.toFixed(2)} ${currency}` : '—',
      trialLabel: Number.isFinite(days) ? `${days} jour${days > 1 ? 's' : ''}` : '—',
    };
  }, [setupFeeEuros, currency, trialDays]);

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
    <div className="space-y-6 admin-stagger pb-4">
      <AdminPageHeader
        icon={Phone}
        title="Lignes téléphoniques"
        subtitle="Prix de mise en service et durée d'essai gratuit pour la première ligne company."
        badge="Tarification"
      />

      {loading ? (
        <p className="text-violet-600/70 animate-pulse">Chargement…</p>
      ) : (
        <>
          <section className="admin-pricing-panel">
            <div className="admin-pricing-panel-head">
              <div>
                <h2 className="admin-section-title">Paramètres ligne</h2>
                <p className="admin-section-desc">
                  Ces valeurs alimentent le checkout Stripe / PayPal côté orchestrator.
                </p>
              </div>
            </div>

            <div className="admin-settings-grid">
              <div className="admin-setting-card">
                <div className="admin-setting-card-icon">
                  <Coins size={18} />
                </div>
                <AdminField
                  id="setup-fee"
                  label="Prix activation"
                  hint="Facturé à partir de la 2e ligne."
                >
                  <div className="flex items-center gap-2">
                    <input
                      id="setup-fee"
                      type="text"
                      inputMode="decimal"
                      value={setupFeeEuros}
                      onChange={(e) => setSetupFeeEuros(e.target.value)}
                      className="admin-input admin-input--plain admin-input--compact"
                    />
                    <span className="text-sm font-bold text-slate-500">€</span>
                  </div>
                </AdminField>
              </div>

              <div className="admin-setting-card">
                <div className="admin-setting-card-icon">
                  <Phone size={18} />
                </div>
                <AdminField id="currency" label="Devise" hint="Code ISO à 3 lettres.">
                  <input
                    id="currency"
                    type="text"
                    maxLength={3}
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                    className="admin-input admin-input--plain admin-input--compact uppercase"
                  />
                </AdminField>
              </div>

              <div className="admin-setting-card">
                <div className="admin-setting-card-icon">
                  <Calendar size={18} />
                </div>
                <AdminField
                  id="trial-days"
                  label="Essai gratuit"
                  hint="Durée offerte sur la 1re ligne."
                >
                  <div className="flex items-center gap-2">
                    <input
                      id="trial-days"
                      type="number"
                      min={0}
                      max={365}
                      value={trialDays}
                      onChange={(e) => setTrialDays(e.target.value)}
                      className="admin-input admin-input--plain admin-input--compact"
                    />
                    <span className="text-sm font-bold text-slate-500">jours</span>
                  </div>
                </AdminField>
              </div>
            </div>

            <div className="admin-preview-card">
              <p className="admin-field-label mb-3">Aperçu company</p>
              <div className="admin-preview-row">
                <div>
                  <p className="admin-preview-item-label">2e ligne et suivantes</p>
                  <p className="admin-preview-item-value">{preview.feeLabel}</p>
                </div>
                <div>
                  <p className="admin-preview-item-label">1re ligne</p>
                  <p className="admin-preview-item-value">Gratuit · {preview.trialLabel}</p>
                </div>
              </div>
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
