import React, { useEffect, useState } from 'react';
import { BarChart3, Loader2 } from 'lucide-react';
import { CATEGORY_LABEL, CHANNEL_NAME, MOTIF_LABEL, supportAgentApi, type AgentMetrics as Metrics } from '../../../lib/supportAgentApi';

const pct = (n: number | null) => (n == null ? '—' : `${n.toLocaleString('fr-FR')} %`);
const minutes = (n: number | null) => (n == null ? '—' : n < 60 ? `${Math.round(n)} min` : `${(n / 60).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} h`);

function Tile({ label, value, hint, testid }: { label: string; value: string; hint?: string; testid: string }) {
  return (
    <div className="rounded-2xl border border-violet-100 bg-white p-4" data-testid={testid}>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}

/** Barres horizontales d'une seule teinte (grandeur), valeur et libellé en texte : jamais la couleur seule. */
function Bars({ title, rows, testid }: { title: string; rows: Array<[string, number]>; testid: string }) {
  const max = Math.max(1, ...rows.map(([, n]) => n));
  return (
    <section className="rounded-2xl border border-violet-100 bg-white p-4" data-testid={testid}>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-2 text-xs text-slate-500">Aucune donnée sur la période.</p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {rows.map(([label, n]) => (
            <li key={label} className="grid grid-cols-[minmax(110px,58%)_1fr_auto] items-center gap-2 text-xs" title={`${label} : ${n}`}>
              <span className="truncate text-slate-700">{label}</span>
              <span className="h-2 rounded-full bg-slate-100">
                <span className="block h-2 rounded-full bg-violet-500" style={{ width: `${(n / max) * 100}%` }} />
              </span>
              <span className="tabular-nums text-slate-700">{n}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

const sorted = (o: Record<string, number>, names: Record<string, string>): Array<[string, number]> =>
  Object.entries(o)
    .sort((a, b) => b[1] - a[1])
    .map(([k, n]) => [names[k] ?? k, n]);

/** Indicateurs hebdomadaires du support (spécification de l'agent support IA). */
export default function AgentMetrics() {
  const [m, setM] = useState<Metrics | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    supportAgentApi
      .metrics(7)
      .then(setM)
      .catch(() => setError(true));
  }, []);
  if (error) return <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">Impossible de charger les indicateurs.</p>;
  if (!m)
    return (
      <div className="flex items-center justify-center py-16 text-slate-400" role="status" aria-label="Chargement">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  const from = new Date(m.period.from).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  const to = new Date(m.period.to).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  return (
    <div className="space-y-4" data-testid="agent-metrics">
      <p className="flex items-center gap-2 text-sm text-slate-600">
        <BarChart3 className="h-4 w-4 text-violet-600" />
        Semaine du {from} au {to} · agent {m.enabled ? (m.mode === 'autonomous' ? 'autonome' : 'en mode brouillon') : 'désactivé'}
      </p>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Tile testid="kpi-requests" label="Demandes reçues" value={String(m.requests.total)} />
        <Tile testid="kpi-without-human" label="Résolues sans humain" value={pct(m.resolvedWithoutHuman.share)} hint={`${m.resolvedWithoutHuman.withoutHuman} sur ${m.resolvedWithoutHuman.closed} closes`} />
        <Tile testid="kpi-first-response" label="Première réponse (médiane)" value={minutes(m.firstResponseMinutes.median)} hint={m.firstResponseMinutes.count ? `moyenne ${minutes(m.firstResponseMinutes.average)} · ${m.firstResponseMinutes.count} demandes` : undefined} />
        <Tile testid="kpi-escalations" label="Escalades au fondateur" value={String(m.escalations.total)} />
        <Tile testid="kpi-open-24h" label="Ouvertes depuis plus de 24 h" value={String(m.openOver24h.total)} />
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        <Bars testid="by-channel" title="Demandes par canal" rows={sorted(m.requests.byChannel, CHANNEL_NAME)} />
        <Bars testid="by-motif" title="Demandes par motif" rows={sorted(m.requests.byMotif, MOTIF_LABEL)} />
        <Bars testid="by-category" title="Escalades par motif" rows={sorted(m.escalations.byCategory, CATEGORY_LABEL)} />
      </div>
      {m.openOver24h.items.length > 0 && (
        <section className="rounded-2xl border border-violet-100 bg-white p-4" data-testid="open-24h">
          <h3 className="text-sm font-semibold text-slate-800">Demandes ouvertes depuis plus de 24 h</h3>
          <table className="mt-2 w-full text-left text-xs">
            <thead className="text-slate-500">
              <tr>
                <th className="py-1 font-medium">Demande</th>
                <th className="py-1 font-medium">Canal</th>
                <th className="py-1 font-medium">Motif</th>
                <th className="py-1 text-right font-medium">Ancienneté</th>
              </tr>
            </thead>
            <tbody>
              {m.openOver24h.items.map((r) => (
                <tr key={r.ticketId} className="border-t border-slate-100 text-slate-700">
                  <td className="py-1 font-mono">{r.ticketId.slice(-6)}</td>
                  <td className="py-1">{CHANNEL_NAME[r.channel] ?? r.channel}</td>
                  <td className="py-1">{MOTIF_LABEL[r.motif] ?? r.motif}</td>
                  <td className="py-1 text-right tabular-nums">{r.ageHours} h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
