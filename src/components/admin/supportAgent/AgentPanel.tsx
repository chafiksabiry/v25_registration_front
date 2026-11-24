import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Bot, Check, ChevronDown, Loader2, Pencil, Send, ShieldCheck } from 'lucide-react';
import {
  CATEGORY_LABEL,
  LANGUAGE_NAME,
  MOTIF_LABEL,
  PRODUCT_LABEL,
  SEVERITY_LABEL,
  supportAgentApi,
  type AgentCase,
  type AgentDraft,
} from '../../../lib/supportAgentApi';

const KIND_LABEL: Record<AgentDraft['kind'], string> = {
  reply: 'Réponse proposée',
  holding: 'Message d’attente (cas escaladé)',
  final: 'Réponse finale après votre décision',
};
const STATE_LABEL: Record<AgentCase['state'], string> = {
  new: 'Nouvelle demande',
  draft_pending: 'Brouillon à valider',
  awaiting_customer: 'Réponse envoyée : en attente du client',
  awaiting_founder: 'Décision requise',
  closed: 'Close',
};
const ACTION_LABEL: Record<string, string> = {
  drafted: 'Brouillon rédigé',
  replied: 'Réponse envoyée (autonome)',
  sent: 'Envoyé',
  escalated: 'Escaladé au fondateur',
  founder_decision: 'Décision du fondateur',
  closed: 'Demande close',
  noted: 'Nouveau message noté',
  final_failed: 'Réponse finale impossible',
  final_blocked: 'Réponse finale bloquée',
};
const fmt = (iso?: string | null) => (iso ? new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '');
const notifyLabel = (s?: string) => (s === 'sent' ? 'envoyé' : s === 'not_configured' ? 'non configuré' : s === 'failed' ? 'échec' : '—');

/**
 * Panneau de l'agent support IA dans la conversation ouverte de l'Inbox : brouillon (« Envoyer », « Modifier »), décision du fondateur
 * sur un cas escaladé (« Valider la recommandation », « Corriger »), classement et journal (texte, sources lues, raison).
 * Tout est rendu en texte (jamais de HTML injecté).
 */
export default function AgentPanel({ waId, refreshKey, onChanged }: { waId: string; refreshKey: number; onChanged: () => void }) {
  const [kase, setKase] = useState<AgentCase | null>(null);
  const [mode, setMode] = useState<string>('draft');
  const [enabled, setEnabled] = useState<boolean>(false);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [correcting, setCorrecting] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const d = await supportAgentApi.cases(waId);
      setEnabled(d.enabled);
      setMode(d.mode);
      setKase(d.cases.find((c) => c.state !== 'closed') ?? d.cases[0] ?? null);
    } catch {
      setKase(null);
    } finally {
      setLoaded(true);
    }
  }, [waId]);

  useEffect(() => {
    setEditing(null);
    setCorrecting(false);
    setNote('');
    setError(null);
    setLoaded(false);
    void load();
  }, [waId, load]);
  useEffect(() => {
    if (refreshKey) void load();
  }, [refreshKey, load]);

  if (!loaded || !kase) return null;
  const pending = kase.drafts.filter((d) => d.status === 'pending');
  const esc = kase.escalation;
  const rtl = kase.language === 'ar';

  const act = async (key: string, fn: () => Promise<unknown>, failure: string) => {
    setBusy(key);
    setError(null);
    try {
      await fn();
      await load();
      onChanged();
      return true;
    } catch {
      setError(failure);
      return false;
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="max-h-[56%] shrink-0 overflow-y-auto border-t border-violet-100 bg-violet-50/60 px-4 py-3 text-sm" data-testid="agent-panel">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 font-semibold text-violet-900">
          <Bot className="h-4 w-4" />
          Agent support IA
        </span>
        <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-violet-700 ring-1 ring-violet-200">
          {mode === 'autonomous' ? 'Autonome' : 'Mode brouillon'}
          {!enabled ? ' · désactivé' : ''}
        </span>
        <span className="text-xs text-slate-600">{STATE_LABEL[kase.state]}</span>
      </div>
      {kase.classification && (
        <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px]" data-testid="agent-classification">
          <span className="rounded-full bg-white px-2 py-0.5 ring-1 ring-slate-200">{MOTIF_LABEL[kase.classification.motif] ?? kase.classification.motif}</span>
          <span className="rounded-full bg-white px-2 py-0.5 ring-1 ring-slate-200">{PRODUCT_LABEL[kase.classification.product] ?? kase.classification.product}</span>
          <span className={`rounded-full px-2 py-0.5 ring-1 ${kase.classification.severity === 'critical' || kase.classification.severity === 'high' ? 'bg-red-50 text-red-700 ring-red-200' : 'bg-white ring-slate-200'}`}>
            {SEVERITY_LABEL[kase.classification.severity] ?? kase.classification.severity}
          </span>
          <span className="rounded-full bg-white px-2 py-0.5 ring-1 ring-slate-200">Langue : {LANGUAGE_NAME[kase.language] ?? kase.language}</span>
          <span className="rounded-full bg-white px-2 py-0.5 ring-1 ring-slate-200">{kase.verified ? 'Identité du client prouvée' : kase.hasAccount ? 'Compte cité, identité non prouvée' : 'Aucun compte associé'}</span>
          {kase.errorCodes.length > 0 && <span className="rounded-full bg-white px-2 py-0.5 font-mono ring-1 ring-slate-200">{kase.errorCodes.join(', ')}</span>}
        </div>
      )}

      {error && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-700" role="alert">
          {error}
        </p>
      )}

      {esc && (
        <section className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3" data-testid="agent-escalation">
          <p className="flex items-center gap-1.5 font-semibold text-amber-900">
            <AlertTriangle className="h-4 w-4" />
            {esc.decision ? 'Cas escaladé' : 'Décision requise'} : {(esc.categories.length ? esc.categories : [esc.category]).map((c) => CATEGORY_LABEL[c] ?? c).join(' · ')}
          </p>
          {esc.decision ? (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-800">
              <ShieldCheck className="h-3.5 w-3.5" />
              {esc.decision.action === 'approve' ? 'Recommandation validée' : 'Recommandation corrigée'} le {fmt(esc.decision.at)}
              {esc.decision.note ? ` : « ${esc.decision.note} »` : ''}
            </p>
          ) : correcting ? (
            <div className="mt-2 space-y-2">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                maxLength={2000}
                placeholder="Votre décision pour l’agent (ex. : accepter le remboursement de novembre uniquement)…"
                className="w-full resize-none rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                data-testid="agent-correct-note"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!note.trim() || busy !== null}
                  onClick={() => void act('decide', () => supportAgentApi.decide(kase.ticketId, 'correct', note.trim()), 'La décision n’a pas pu être transmise à l’agent.').then((ok) => ok && setCorrecting(false))}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                  data-testid="agent-correct-send"
                >
                  {busy === 'decide' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  Transmettre à l’agent
                </button>
                <button type="button" onClick={() => setCorrecting(false)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs">
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => void act('decide', () => supportAgentApi.decide(kase.ticketId, 'approve'), 'La décision n’a pas pu être transmise à l’agent.')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                data-testid="agent-approve"
              >
                {busy === 'decide' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Valider la recommandation
              </button>
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => setCorrecting(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100"
                data-testid="agent-correct"
              >
                <Pencil className="h-3.5 w-3.5" />
                Corriger
              </button>
              <span className="self-center text-[11px] text-amber-800">L’agent rédige ensuite la réponse au client. Toute action (remboursement, résiliation, numéro…) reste à faire par vous.</span>
            </div>
          )}
          <dl className="mt-2 space-y-1.5 text-[13px] text-slate-800">
            {esc.summary && (
              <div>
                <dt className="inline font-semibold">Résumé : </dt>
                <dd className="inline whitespace-pre-wrap">{esc.summary}</dd>
              </div>
            )}
            {esc.diagnosis && (
              <div>
                <dt className="inline font-semibold">Diagnostic : </dt>
                <dd className="inline whitespace-pre-wrap">{esc.diagnosis}</dd>
              </div>
            )}
            {esc.recommendation && (
              <div>
                <dt className="inline font-semibold">Recommandation : </dt>
                <dd className="inline whitespace-pre-wrap">{esc.recommendation}</dd>
              </div>
            )}
          </dl>
          <p className="mt-2 text-[11px] text-amber-800">
            Notification : e-mail {notifyLabel(esc.notified?.email)} · webhook {notifyLabel(esc.notified?.webhook)}
            {esc.legalCc ? ` · copie ${esc.legalCc}` : ''}
            {esc.incident ? ` · code ${esc.incident.code} chez ${esc.incident.customers} clients` : ''}
          </p>
        </section>
      )}

      {pending.map((d) => (
        <section key={d.id} className="mt-3 rounded-xl border border-violet-200 bg-white p-3" data-testid="agent-draft">
          <p className="text-xs font-semibold text-violet-800">
            Brouillon de l’agent — {KIND_LABEL[d.kind]}
            <span className="ml-2 font-normal text-slate-500">{fmt(d.createdAt)}</span>
          </p>
          {editing === d.id ? (
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={5}
              maxLength={4000}
              dir={rtl ? 'rtl' : 'ltr'}
              className="mt-2 w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
              data-testid="agent-draft-edit"
            />
          ) : (
            <p className="mt-2 whitespace-pre-wrap break-words text-slate-900" dir={rtl ? 'rtl' : 'ltr'} data-testid="agent-draft-text">
              {d.text}
            </p>
          )}
          {d.reason && <p className="mt-1.5 text-[11px] text-slate-500">Raison : {d.reason}</p>}
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy !== null || (editing === d.id && !editText.trim())}
              onClick={() =>
                void act('send', () => supportAgentApi.sendDraft(kase.ticketId, d.id, editing === d.id ? editText.trim() : undefined), 'L’envoi a échoué : rien n’est parti.').then(
                  (ok) => ok && setEditing(null),
                )
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
              data-testid="agent-send"
            >
              {busy === 'send' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              {editing === d.id ? 'Envoyer le texte modifié' : 'Envoyer'}
            </button>
            {editing === d.id ? (
              <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs">
                Annuler
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEditing(d.id);
                  setEditText(d.text);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                data-testid="agent-edit"
              >
                <Pencil className="h-3.5 w-3.5" />
                Modifier
              </button>
            )}
          </div>
        </section>
      ))}

      {kase.log.length > 0 && (
        <details className="mt-3 text-xs text-slate-600" data-testid="agent-log">
          <summary className="flex cursor-pointer list-none items-center gap-1 font-medium text-slate-700">
            <ChevronDown className="h-3.5 w-3.5" />
            Journal de l’agent ({kase.log.length})
          </summary>
          <ol className="mt-2 space-y-1.5">
            {kase.log
              .slice()
              .reverse()
              .map((l, i) => (
                <li key={`${l.at}-${i}`} className="rounded-lg bg-white px-2.5 py-1.5 ring-1 ring-slate-100">
                  <b>{ACTION_LABEL[l.action] ?? l.action}</b> · {fmt(l.at)}
                  {l.model ? ` · ${l.model}` : ''}
                  {l.reason && <div>Raison : {l.reason}</div>}
                  {l.sources && l.sources.length > 0 && <div>Sources lues : {l.sources.join(' ; ')}</div>}
                </li>
              ))}
          </ol>
        </details>
      )}
    </div>
  );
}
