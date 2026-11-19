import React, { useCallback, useEffect, useState } from 'react';
import { Globe, Inbox, MessageCircle, RefreshCw, Send, Trash2, UserCheck } from 'lucide-react';
import {
  supportInboxApi,
  type SupportConversationDetail,
  type SupportConversationSummary,
  type SupportTicket,
} from '../../lib/api';
import { formatDate } from './adminUiUtils';
import { AdminPageHeader } from './adminPageShell';

type Channel = '' | 'whatsapp' | 'web';

const REFRESH_MS = 15000;
const isWeb = (id: string) => id.startsWith('web:');
const labelOf = (c: { waId: string; profileName?: string }) =>
  isWeb(c.waId) ? 'Visiteur du site' : c.profileName || `+${c.waId}`;
const roleLabel = (role: string) => (role === 'user' ? 'Visiteur' : role === 'human_agent' ? 'Équipe' : 'Assistant');

/**
 * Inbox du support : conversations de l'assistant IA HARX (WhatsApp Business et chat du site). Réservée aux administrateurs
 * (la page est derrière AdminRoute et le serveur vérifie le jeton admin). Tout le contenu est rendu en texte, jamais en HTML.
 */
export default function AdminInboxPage() {
  const [channel, setChannel] = useState<Channel>('');
  const [list, setList] = useState<SupportConversationSummary[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<SupportConversationDetail | null>(null);
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadList = useCallback(async () => {
    try {
      const data = await supportInboxApi.conversations(channel);
      setList(data.conversations);
      setError(null);
    } catch {
      setError('Impossible de charger les conversations.');
    } finally {
      setLoading(false);
    }
  }, [channel]);

  const loadDetail = useCallback(async (id: string) => {
    try {
      const d = await supportInboxApi.conversation(id);
      setDetail(d);
      if (d.handoff?.active) {
        const t = await supportInboxApi.tickets();
        setTicket(t.tickets.find((x) => x.waId === id && x.status !== 'resolved') ?? null);
      } else {
        setTicket(null);
      }
    } catch {
      setError('Impossible de charger la conversation.');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    void loadList();
  }, [loadList]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void loadList();
      if (selected) void loadDetail(selected);
    }, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [loadList, loadDetail, selected]);

  const open = (id: string) => {
    setSelected(id);
    setReply('');
    setConfirmDelete(false);
    void loadDetail(id);
  };

  const remove = async () => {
    if (!selected || busy) return;
    setBusy(true);
    try {
      await supportInboxApi.deleteConversation(selected);
      setList((prev) => prev.filter((c) => c.waId !== selected));
      setSelected(null);
      setDetail(null);
      setTicket(null);
      setConfirmDelete(false);
      setError(null);
    } catch {
      setError('La suppression a échoué.');
    } finally {
      setBusy(false);
    }
  };

  const send = async (resolve: boolean) => {
    if (!ticket || !reply.trim() || busy) return;
    setBusy(true);
    try {
      await supportInboxApi.reply(ticket.id, reply.trim(), resolve);
      setReply('');
      if (selected) await loadDetail(selected);
      await loadList();
    } catch {
      setError("L'envoi de la réponse a échoué.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 admin-stagger">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <AdminPageHeader
          icon={Inbox}
          title="Inbox support"
          subtitle="Conversations de l'assistant IA HARX : WhatsApp Business et chat du site."
        />
        <div className="flex items-center gap-2">
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as Channel)}
            aria-label="Canal"
            className="rounded-xl border border-violet-100 bg-white px-3 py-2 text-sm text-slate-700"
          >
            <option value="">Tous les canaux</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="web">Chat du site</option>
          </select>
          <button
            type="button"
            onClick={() => {
              void loadList();
              if (selected) void loadDetail(selected);
            }}
            aria-label="Actualiser"
            className="rounded-xl border border-violet-100 bg-white p-2 text-slate-600 hover:bg-violet-50"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="grid min-h-[480px] gap-4 lg:grid-cols-[minmax(280px,380px)_1fr]" data-testid="admin-inbox">
        <section className="overflow-auto rounded-2xl border border-violet-100/80 bg-white/90" aria-label="Conversations">
          {loading ? (
            <p className="p-4 text-sm text-slate-500">Chargement…</p>
          ) : list.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">Aucune conversation.</p>
          ) : (
            list.map((c) => (
              <button
                key={c.waId}
                type="button"
                onClick={() => open(c.waId)}
                className={`block w-full border-b border-violet-50 px-4 py-3 text-left hover:bg-violet-50/70 ${
                  selected === c.waId ? 'bg-violet-50' : ''
                }`}
              >
                <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                  {isWeb(c.waId) ? (
                    <Globe className="h-3.5 w-3.5 text-sky-600" />
                  ) : (
                    <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                  )}
                  <span className="truncate">{labelOf(c)}</span>
                  {c.handoff && (
                    <span className="rounded-full bg-amber-600 px-1.5 text-[11px] font-medium text-white">Humain</span>
                  )}
                  {c.linked && <UserCheck className="h-3.5 w-3.5 text-slate-500" aria-label="Compte lié" />}
                </span>
                <span className="block text-xs text-slate-500">
                  {formatDate(c.updatedAt)} · {c.messageCount} msg{c.language ? ` · ${c.language}` : ''}
                </span>
                <span className="block truncate text-xs text-slate-600">{c.last?.text ?? ''}</span>
              </button>
            ))
          )}
        </section>

        <section className="flex flex-col overflow-hidden rounded-2xl border border-violet-100/80 bg-white/90" aria-label="Messages">
          {!detail ? (
            <p className="p-4 text-sm text-slate-500">Sélectionnez une conversation.</p>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3 border-b border-violet-50 px-4 py-3 text-sm text-slate-700">
                <div className="min-w-0">
                <b>{labelOf(detail)}</b>
                {detail.notes.length > 0 && (
                  <span className="text-slate-500"> · notes : {detail.notes.map((n) => `${n.key}=${n.value}`).join(', ')}</span>
                )}
                {ticket && (
                  <div className="mt-0.5 text-xs text-amber-700">
                    Ticket {ticket.urgency} : {ticket.reason}
                  </div>
                )}
                </div>
                {confirmDelete ? (
                  <div className="flex shrink-0 items-center gap-2" role="alertdialog" aria-label="Confirmer la suppression">
                    <span className="text-xs text-red-700">Supprimer définitivement ?</span>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void remove()}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                    >
                      Oui, supprimer
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setConfirmDelete(false)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs"
                    >
                      Annuler
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Supprimer
                  </button>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 overflow-auto bg-slate-50/70 p-4">
                {detail.messages.map((m, i) => (
                  <div
                    key={`${m.ts}-${i}`}
                    className={`max-w-[80%] whitespace-pre-wrap break-words rounded-xl border px-3 py-2 text-sm ${
                      m.role === 'user'
                        ? 'self-start border-slate-200 bg-white'
                        : m.role === 'human_agent'
                          ? 'self-end border-sky-200 bg-sky-100'
                          : 'self-end border-emerald-200 bg-emerald-100'
                    }`}
                  >
                    <span className="mb-0.5 block text-[11px] text-slate-500">
                      {roleLabel(m.role)} · {formatDate(m.ts)}
                    </span>
                    {m.text}
                  </div>
                ))}
              </div>
              {ticket && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void send(false);
                  }}
                  className="flex gap-2 border-t border-violet-50 p-3"
                >
                  <input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Répondre au visiteur…"
                    maxLength={2000}
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={busy || !reply.trim()}
                    className="inline-flex items-center gap-1 rounded-xl bg-violet-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    Envoyer
                  </button>
                  <button
                    type="button"
                    disabled={busy || !reply.trim()}
                    onClick={() => void send(true)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:opacity-50"
                  >
                    Envoyer et clore
                  </button>
                </form>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
