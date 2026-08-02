import React, { useEffect, useState } from 'react';
import { Save, Users } from 'lucide-react';
import { adminApi } from '../../lib/api';
import { AdminField, AdminPageHeader, AdminToggle } from './adminPageShell';

type RepPlanForm = {
  id: string;
  name: string;
  price: string;
  currency: string;
  stripePriceId: string;
  description: string;
  featuresText: string;
  isActive: boolean;
  sortOrder: string;
  updatedAt?: string | null;
};

function toForm(plan: Record<string, any>): RepPlanForm {
  return {
    id: plan.id,
    name: plan.name || '',
    price: String(plan.price ?? 0),
    currency: (plan.currency || 'eur').toUpperCase(),
    stripePriceId: plan.stripePriceId || '',
    description: plan.description || '',
    featuresText: Array.isArray(plan.features) ? plan.features.join('\n') : '',
    isActive: plan.isActive !== false,
    sortOrder: String(plan.sortOrder ?? 0),
    updatedAt: plan.updatedAt || null,
  };
}

export default function AdminRepPlansPage() {
  const [plans, setPlans] = useState<RepPlanForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, { type: 'success' | 'error'; text: string }>>({});

  useEffect(() => {
    setLoading(true);
    adminApi
      .repPlans()
      .then((response) => setPlans((response.data.plans || []).map(toForm)))
      .catch(() => setLoadError('Impossible de charger les plans REP.'))
      .finally(() => setLoading(false));
  }, []);

  const updatePlan = (id: string, patch: Partial<RepPlanForm>) => {
    setPlans((current) => current.map((plan) => (plan.id === id ? { ...plan, ...patch } : plan)));
  };

  const savePlan = async (plan: RepPlanForm) => {
    setSavingId(plan.id);
    setMessages((current) => {
      const next = { ...current };
      delete next[plan.id];
      return next;
    });
    try {
      const response = await adminApi.updateRepPlan(plan.id, {
        name: plan.name,
        price: Number(plan.price.replace(',', '.')),
        currency: plan.currency.toLowerCase(),
        stripePriceId: plan.stripePriceId,
        description: plan.description,
        features: plan.featuresText.split('\n').map((line) => line.trim()).filter(Boolean),
        isActive: plan.isActive,
        sortOrder: Number(plan.sortOrder),
      });
      const saved = toForm(response.data);
      setPlans((current) => current.map((item) => (item.id === plan.id ? saved : item)));
      setMessages((current) => ({ ...current, [plan.id]: { type: 'success', text: 'Plan enregistré.' } }));
    } catch (err: any) {
      setMessages((current) => ({
        ...current,
        [plan.id]: { type: 'error', text: err?.response?.data?.message || 'Enregistrement impossible.' },
      }));
    } finally {
      setSavingId(null);
    }
  };

  const activeCount = plans.filter((plan) => plan.isActive).length;

  return (
    <div className="space-y-6 admin-stagger pb-4">
      <AdminPageHeader
        icon={Users}
        title="Plans REPs"
        subtitle="Abonnements représentants — prix, ordre d'affichage et Stripe."
        badge="Tarification"
      />

      {loading ? (
        <p className="text-violet-600/70 animate-pulse">Chargement…</p>
      ) : loadError ? (
        <p className="text-red-500">{loadError}</p>
      ) : (
        <section className="admin-pricing-panel">
          <div className="admin-pricing-panel-head">
            <div>
              <h2 className="admin-section-title">Plans représentants</h2>
              <p className="admin-section-desc">
                {activeCount} actif{activeCount > 1 ? 's' : ''} sur {plans.length}
              </p>
            </div>
          </div>

          <div className="admin-pack-grid !grid-cols-1 xl:!grid-cols-2">
            {plans.map((plan) => (
              <article
                key={plan.id}
                className={`admin-pack-card ${plan.isActive ? '' : 'admin-pack-card--inactive'}`}
              >
                <div className="admin-pack-card-top">
                  <div>
                    <p className="admin-pack-price-preview">
                      {plan.price} {plan.currency}
                      {!plan.isActive && (
                        <span className="ml-2 text-sm font-semibold text-slate-400">(inactif)</span>
                      )}
                    </p>
                    <p className="admin-pack-meta">Ordre {plan.sortOrder}</p>
                  </div>
                  <AdminToggle
                    checked={plan.isActive}
                    onChange={(value) => updatePlan(plan.id, { isActive: value })}
                    label={`Activer le plan ${plan.name}`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <AdminField id={`${plan.id}-name`} label="Nom">
                    <input
                      id={`${plan.id}-name`}
                      value={plan.name}
                      onChange={(e) => updatePlan(plan.id, { name: e.target.value })}
                      className="admin-input admin-input--plain admin-input--compact"
                    />
                  </AdminField>
                  <AdminField id={`${plan.id}-price`} label="Prix / mois">
                    <input
                      id={`${plan.id}-price`}
                      inputMode="decimal"
                      value={plan.price}
                      onChange={(e) => updatePlan(plan.id, { price: e.target.value })}
                      className="admin-input admin-input--plain admin-input--compact"
                    />
                  </AdminField>
                  <AdminField id={`${plan.id}-order`} label="Ordre">
                    <input
                      id={`${plan.id}-order`}
                      type="number"
                      value={plan.sortOrder}
                      onChange={(e) => updatePlan(plan.id, { sortOrder: e.target.value })}
                      className="admin-input admin-input--plain admin-input--compact"
                    />
                  </AdminField>
                  <AdminField id={`${plan.id}-currency`} label="Devise">
                    <input
                      id={`${plan.id}-currency`}
                      maxLength={3}
                      value={plan.currency}
                      onChange={(e) => updatePlan(plan.id, { currency: e.target.value.toUpperCase() })}
                      className="admin-input admin-input--plain admin-input--compact uppercase"
                    />
                  </AdminField>
                </div>

                <AdminField id={`${plan.id}-stripe`} label="Stripe Price ID">
                  <input
                    id={`${plan.id}-stripe`}
                    value={plan.stripePriceId}
                    onChange={(e) => updatePlan(plan.id, { stripePriceId: e.target.value })}
                    className="admin-input admin-input--plain admin-input--compact font-mono text-xs"
                  />
                </AdminField>

                <AdminField id={`${plan.id}-desc`} label="Description">
                  <textarea
                    id={`${plan.id}-desc`}
                    rows={2}
                    value={plan.description}
                    onChange={(e) => updatePlan(plan.id, { description: e.target.value })}
                    className="admin-textarea"
                  />
                </AdminField>

                <AdminField
                  id={`${plan.id}-features`}
                  label="Fonctionnalités"
                  hint="Une ligne = un bullet point affiché au client."
                >
                  <textarea
                    id={`${plan.id}-features`}
                    rows={5}
                    value={plan.featuresText}
                    onChange={(e) => updatePlan(plan.id, { featuresText: e.target.value })}
                    className="admin-textarea font-mono text-xs"
                  />
                </AdminField>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="min-w-0">
                    {messages[plan.id] && (
                      <p
                        className={`admin-alert ${
                          messages[plan.id].type === 'success'
                            ? 'admin-alert--success'
                            : 'admin-alert--error'
                        }`}
                      >
                        {messages[plan.id].text}
                      </p>
                    )}
                    {!messages[plan.id] && plan.updatedAt && (
                      <p className="text-xs text-slate-500">
                        MAJ {new Date(plan.updatedAt).toLocaleString('fr-FR')}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={savingId === plan.id}
                    onClick={() => savePlan(plan)}
                    className="admin-btn-primary disabled:opacity-60"
                  >
                    <Save size={16} />
                    {savingId === plan.id ? 'Enregistrement…' : 'Enregistrer'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
