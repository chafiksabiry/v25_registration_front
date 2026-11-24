import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  CheckCheck,
  Globe,
  Inbox,
  Info,
  LifeBuoy,
  Loader2,
  Mail,
  BarChart3,
  MessageCircle,
  RefreshCw,
  Search,
  Send,
  Trash2,
  UserCheck,
} from 'lucide-react';
import {
  identityAdminUrl,
  supportInboxApi,
  type SupportConversationDetail,
  type SupportConversationSummary,
  type SupportMessage,
  type SupportTicket,
} from '../../lib/api';
import { AdminPageHeader } from './adminPageShell';
import { useSupportInboxSocket, type InboxSignal } from './useSupportInboxSocket';
import AgentPanel from './supportAgent/AgentPanel';
import AgentMetrics from './supportAgent/AgentMetrics';
import { supportAgentApi, type AgentPendingItem } from '../../lib/supportAgentApi';

type Filter = 'all' | 'todo' | 'whatsapp' | 'web' | 'email' | 'salesiq' | 'identity';
type Channel = 'whatsapp' | 'web' | 'email' | 'salesiq' | 'identity';

/** Relecture de secours : rapide quand le temps réel est coupé, rare quand il est actif (le serveur signale chaque changement). */
const POLL_OFFLINE_MS = 15000;
const POLL_LIVE_MS = 120000;
// identity: = demande créée par le serveur quand un dossier de vérification d'identité passe en revue humaine.
const channelOf = (id: string): Channel =>
  id.startsWith('web:') ? 'web' : id.startsWith('email:') ? 'email' : id.startsWith('salesiq:') ? 'salesiq' : id.startsWith('identity:') ? 'identity' : 'whatsapp';
const CHANNEL_LABEL: Record<Channel, string> = { whatsapp: 'WhatsApp', web: 'Chat du site', email: 'E-mail support@harx.ai', salesiq: 'SalesIQ', identity: 'Vérification d’identité' };
const labelOf = (c: { waId: string; profileName?: string }) => {
  const ch = channelOf(c.waId);
  return ch === 'web' ? 'Visiteur du site' : ch === 'email' ? c.profileName || 'E-mail' : ch === 'salesiq' ? 'Visiteur SalesIQ' : ch === 'identity' ? 'Vérification d’identité' : c.profileName || `+${c.waId}`;
};
const initialOf = (c: { waId: string; profileName?: string }) => {
  const ch = channelOf(c.waId);
  return ch === 'web' ? 'V' : ch === 'salesiq' ? 'S' : ch === 'identity' ? 'I' : (c.profileName || (ch === 'email' ? '@' : '#')).trim().charAt(0).toUpperCase();
};
const roleLabel = (role: string) =>
  role === 'user' ? 'Visiteur' : role === 'human_agent' ? 'Équipe HARX' : role === 'system' ? 'HARX (automatique)' : 'Assistant IA';

function relativeTime(iso: string, now = Date.now()): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const min = Math.floor((now - t) / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'hier';
  if (d < 7) return `il y a ${d} j`;
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

const timeOf = (iso: string) => new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

function dayLabel(iso: string, now = new Date()): string {
  const d = new Date(iso);
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (same(d, now)) return "Aujourd'hui";
  if (same(d, yesterday)) return 'Hier';
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

/** *gras* (balisage WhatsApp) -> <strong> ; le reste est du texte brut : aucun HTML n'est jamais injecté. */
function renderText(text: string): React.ReactNode[] {
  return text.split(/(\*[^*\n]+\*)/g).map((part, i) =>
    /^\*[^*\n]+\*$/.test(part) ? <strong key={i}>{part.slice(1, -1)}</strong> : <React.Fragment key={i}>{part}</React.Fragment>,
  );
}

function Avatar({ c, size = 40 }: { c: { waId: string; profileName?: string }; size?: number }) {
  const ch = channelOf(c.waId);
  const bg = ch === 'web' ? 'bg-sky-500' : ch === 'email' ? 'bg-indigo-500' : ch === 'salesiq' ? 'bg-fuchsia-500' : ch === 'identity' ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${bg}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden="true"
    >
      {initialOf(c)}
      <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white ring-1 ring-slate-200">
        {ch === 'web' ? (
          <Globe className="h-2.5 w-2.5 text-sky-600" />
        ) : ch === 'email' ? (
          <Mail className="h-2.5 w-2.5 text-indigo-600" />
        ) : ch === 'salesiq' ? (
          <LifeBuoy className="h-2.5 w-2.5 text-fuchsia-600" />
        ) : ch === 'identity' ? (
          <UserCheck className="h-2.5 w-2.5 text-amber-600" />
        ) : (
          <MessageCircle className="h-2.5 w-2.5 text-emerald-600" />
        )}
      </span>
    </span>
  );
}

/**
 * Inbox du support : conversations de l'assistant IA HARX (WhatsApp Business et chat du site). Réservée aux administrateurs
 * (page derrière AdminRoute, jeton admin vérifié par le serveur). Tout le contenu est rendu en texte, jamais en HTML.
 */
export default function AdminInboxPage() {
  const [all, setAll] = useState<SupportConversationSummary[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<SupportConversationDetail | null>(null);
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [, setTick] = useState(0);
  const [unread, setUnread] = useState<Set<string>>(new Set());
  const [newBelow, setNewBelow] = useState(false);
  // Agent support IA : demandes qui attendent le fondateur (brouillon à envoyer, décision), vue « Indicateurs », relecture du panneau.
  const [agentPending, setAgentPending] = useState<Map<string, AgentPendingItem>>(new Map());
  const [view, setView] = useState<'inbox' | 'metrics'>('inbox');
  const [agentTick, setAgentTick] = useState(0);
  const messageCount = useRef(0);
  const debounce = useRef<number | undefined>(undefined);
  const logRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const openedId = useRef<string | null>(null);

  const loadList = useCallback(async () => {
    try {
      const data = await supportInboxApi.conversations('', 100);
      setAll(data.conversations);
      setError(null);
      setLastSync(Date.now());
      supportAgentApi
        .pending()
        .then((p) => setAgentPending(new Map(p.items.map((x) => [x.waId, x]))))
        .catch(() => setAgentPending(new Map()));
    } catch {
      setError('Impossible de charger les conversations.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDetail = useCallback(async (id: string) => {
    try {
      const d = await supportInboxApi.conversation(id);
      if (openedId.current !== id) return;
      setDetail(d);
      setAgentTick((n) => n + 1);
      if (d.handoff?.active) {
        const t = await supportInboxApi.tickets();
        if (openedId.current === id) setTicket(t.tickets.find((x) => x.waId === id && x.status !== 'resolved') ?? null);
      } else {
        setTicket(null);
      }
    } catch {
      setError('Impossible de charger la conversation.');
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadList(), openedId.current ? loadDetail(openedId.current) : Promise.resolve()]);
    setRefreshing(false);
  }, [loadList, loadDetail]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  // Temps réel : chaque signal du serveur relit la liste (et la conversation ouverte), regroupés sur 300 ms.
  const onSignal = useCallback(
    (signal: InboxSignal) => {
      if (signal.reason === 'deleted' && signal.waId === openedId.current) {
        openedId.current = null;
        setSelected(null);
        setDetail(null);
        setTicket(null);
        setConfirmDelete(false);
      }
      if (signal.reason === 'message' && signal.waId !== openedId.current) {
        setUnread((prev) => (prev.has(signal.waId) ? prev : new Set(prev).add(signal.waId)));
      }
      window.clearTimeout(debounce.current);
      debounce.current = window.setTimeout(() => {
        void loadList();
        if (openedId.current) void loadDetail(openedId.current);
      }, 300);
    },
    [loadList, loadDetail],
  );
  const socketStatus = useSupportInboxSocket(onSignal);
  useEffect(() => () => window.clearTimeout(debounce.current), []);

  useEffect(() => {
    const timer = window.setInterval(
      () => {
        void loadList();
        if (openedId.current) void loadDetail(openedId.current);
        setTick((n) => n + 1);
      },
      socketStatus === 'live' ? POLL_LIVE_MS : POLL_OFFLINE_MS,
    );
    return () => window.clearInterval(timer);
  }, [loadList, loadDetail, socketStatus]);

  // Défilement : on suit les nouveaux messages seulement si l'on était déjà en bas ; à l'ouverture, toujours en bas.
  // `ticket` est dans les dépendances : la bannière et la zone de réponse apparaissent après le chargement et réduisent la fenêtre.
  useEffect(() => {
    const el = logRef.current;
    const count = detail?.messages.length ?? 0;
    if (el && stickToBottom.current) {
      el.scrollTo({ top: el.scrollHeight });
      setNewBelow(false);
    } else if (el && count > messageCount.current && messageCount.current > 0) {
      setNewBelow(true); // l'on lit plus haut : on signale les nouveaux messages sans faire sauter la lecture
    }
    messageCount.current = count;
  }, [detail, ticket]);

  const open = (id: string) => {
    openedId.current = id;
    stickToBottom.current = true;
    messageCount.current = 0;
    setNewBelow(false);
    setUnread((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setSelected(id);
    setDetail(null);
    setTicket(null);
    setReply('');
    setConfirmDelete(false);
    void loadDetail(id);
  };

  const close = useCallback(() => {
    openedId.current = null;
    setSelected(null);
    setDetail(null);
    setTicket(null);
    setConfirmDelete(false);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && openedId.current && !(e.target instanceof HTMLTextAreaElement)) close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);

  const counts = useMemo(
    () => ({
      all: all.length,
      todo: all.filter((c) => c.handoff).length,
      whatsapp: all.filter((c) => channelOf(c.waId) === 'whatsapp').length,
      web: all.filter((c) => channelOf(c.waId) === 'web').length,
      email: all.filter((c) => channelOf(c.waId) === 'email').length,
      salesiq: all.filter((c) => channelOf(c.waId) === 'salesiq').length,
      identity: all.filter((c) => channelOf(c.waId) === 'identity').length,
    }),
    [all],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((c) => {
      if (filter === 'todo' && !c.handoff) return false;
      if ((filter === 'whatsapp' || filter === 'web' || filter === 'email' || filter === 'salesiq' || filter === 'identity') && channelOf(c.waId) !== filter) return false;
      if (!q) return true;
      return `${labelOf(c)} ${c.waId} ${c.last?.text ?? ''}`.toLowerCase().includes(q);
    });
  }, [all, filter, query]);

  const remove = async () => {
    if (!selected || busy) return;
    setBusy(true);
    try {
      await supportInboxApi.deleteConversation(selected);
      setAll((prev) => prev.filter((c) => c.waId !== selected));
      close();
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
      stickToBottom.current = true;
      if (selected) await loadDetail(selected);
      await loadList();
    } catch {
      setError("L'envoi de la réponse a échoué.");
    } finally {
      setBusy(false);
    }
  };

  const groups = useMemo(() => {
    const out: Array<{ day: string; items: SupportMessage[] }> = [];
    for (const m of detail?.messages ?? []) {
      const day = dayLabel(m.ts);
      const last = out[out.length - 1];
      if (last && last.day === day) last.items.push(m);
      else out.push({ day, items: [m] });
    }
    return out;
  }, [detail]);

  const chips: Array<{ id: Filter; label: string; n: number; tone?: string }> = [
    { id: 'all', label: 'Toutes', n: counts.all },
    { id: 'todo', label: 'À traiter', n: counts.todo, tone: 'amber' },
    { id: 'whatsapp', label: 'WhatsApp', n: counts.whatsapp },
    { id: 'web', label: 'Site', n: counts.web },
    { id: 'email', label: 'E-mail', n: counts.email },
    { id: 'salesiq', label: 'SalesIQ', n: counts.salesiq },
    { id: 'identity', label: 'Identité', n: counts.identity },
  ];

  const syncLabel = lastSync ? `Actualisé ${relativeTime(new Date(lastSync).toISOString())}` : '';

  return (
    <div className="space-y-4 admin-stagger">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <AdminPageHeader
          icon={Inbox}
          title="Inbox support"
          subtitle="Conversations de l'assistant IA HARX : WhatsApp Business, chat du site et SalesIQ."
        />
        <div className="flex items-center gap-3 sm:pt-2">
          <button
            type="button"
            onClick={() => setView((v) => (v === 'metrics' ? 'inbox' : 'metrics'))}
            aria-pressed={view === 'metrics'}
            className="inline-flex items-center gap-1.5 rounded-xl border border-violet-100 bg-white px-3 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-50"
            data-testid="toggle-metrics"
          >
            <BarChart3 className="h-4 w-4" />
            {view === 'metrics' ? 'Conversations' : 'Indicateurs'}
          </button>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
              socketStatus === 'live' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
            }`}
            role="status"
            aria-live="polite"
            title={socketStatus === 'live' ? 'Les nouveaux messages apparaissent instantanément.' : 'Temps réel indisponible : relecture toutes les 15 secondes.'}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                socketStatus === 'live' ? 'bg-emerald-500' : 'animate-pulse bg-amber-500'
              }`}
            />
            {socketStatus === 'live' ? 'En direct' : socketStatus === 'connecting' ? 'Connexion…' : 'Reconnexion…'}
          </span>
          {syncLabel && socketStatus !== 'live' && <span className="hidden text-xs text-slate-500 sm:inline">{syncLabel}</span>}
          <button
            type="button"
            onClick={() => void refresh()}
            aria-label="Actualiser"
            className="rounded-xl border border-violet-100 bg-white p-2 text-slate-600 hover:bg-violet-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => void refresh()} className="font-semibold underline">
            Réessayer
          </button>
        </div>
      )}

      {view === 'metrics' ? (
        <AgentMetrics />
      ) : (
      <div
        className="grid h-[calc(100vh-19rem)] min-h-[460px] gap-4 lg:grid-cols-[minmax(300px,380px)_1fr]"
        data-testid="admin-inbox"
      >
        {/* Liste */}
        <section
          className={`${selected ? 'hidden lg:flex' : 'flex'} min-h-0 flex-col overflow-hidden rounded-2xl border border-violet-100/80 bg-white/90`}
          aria-label="Conversations"
        >
          <div className="space-y-2.5 border-b border-violet-50 p-3">
            <label className="relative block">
              <span className="sr-only">Rechercher</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un nom, un numéro, un message…"
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
              />
            </label>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrer">
              {chips.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={filter === c.id}
                  onClick={() => setFilter(c.id)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500 ${
                    filter === c.id
                      ? 'bg-violet-600 text-white'
                      : c.tone === 'amber' && c.n > 0
                        ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c.label} <span className="opacity-80">{c.n}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex animate-pulse gap-3 border-b border-violet-50 px-4 py-3">
                  <div className="h-10 w-10 rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/2 rounded bg-slate-200" />
                    <div className="h-3 w-4/5 rounded bg-slate-100" />
                  </div>
                </div>
              ))
            ) : visible.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-12 text-center text-sm text-slate-500">
                <Inbox className="h-8 w-8 text-slate-300" />
                {all.length === 0 ? 'Aucune conversation pour le moment.' : 'Aucune conversation ne correspond à ce filtre.'}
              </div>
            ) : (
              visible.map((c) => (
                <button
                  key={c.waId}
                  type="button"
                  onClick={() => open(c.waId)}
                  aria-current={selected === c.waId}
                  className={`flex w-full gap-3 border-b border-violet-50 px-4 py-3 text-left transition-colors hover:bg-violet-50/70 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-violet-500 ${
                    selected === c.waId ? 'bg-violet-50' : ''
                  }`}
                >
                  <Avatar c={c} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-slate-900">
                        <span className={`truncate ${unread.has(c.waId) ? 'font-bold' : ''}`}>{labelOf(c)}</span>
                        {unread.has(c.waId) && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-violet-600" role="img" aria-label="Nouveau message" />
                        )}
                        {c.linked && <UserCheck className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-label="Compte lié" />}
                      </span>
                      <span className="shrink-0 text-[11px] text-slate-400">{relativeTime(c.updatedAt)}</span>
                    </span>
                    <span className="mt-0.5 flex items-center gap-1.5">
                      {c.handoff && (
                        <span className="shrink-0 rounded-full bg-amber-500 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-white">
                          À traiter
                        </span>
                      )}
                      {agentPending.get(c.waId) && (
                        <span className="shrink-0 rounded-full bg-violet-600 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-white" data-testid="agent-badge">
                          {agentPending.get(c.waId)!.state === 'awaiting_founder' ? 'Décision IA' : 'Brouillon IA'}
                        </span>
                      )}
                      <span className="truncate text-xs text-slate-500">
                        {c.last ? `${c.last.role === 'user' || c.last.role === 'system' ? '' : 'IA : '}${c.last.text}` : ''}
                      </span>
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </section>

        {/* Détail */}
        <section
          className={`${selected ? 'flex' : 'hidden lg:flex'} min-h-0 flex-col overflow-hidden rounded-2xl border border-violet-100/80 bg-white/90`}
          aria-label="Messages"
        >
          {!selected ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center text-slate-500">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                <MessageCircle className="h-7 w-7" />
              </span>
              <p className="text-sm font-medium text-slate-700">Sélectionnez une conversation</p>
              <p className="max-w-xs text-xs">Lisez les échanges de l'assistant IA et répondez aux visiteurs transmis à l'équipe.</p>
            </div>
          ) : !detail ? (
            <div className="flex flex-1 items-center justify-center text-slate-400" role="status" aria-label="Chargement">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <>
              <header className="flex items-center gap-3 border-b border-violet-50 px-4 py-3">
                <button
                  type="button"
                  onClick={close}
                  aria-label="Retour à la liste"
                  className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <Avatar c={detail} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{labelOf(detail)}</p>
                  <p className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                    <span>{channelOf(detail.waId) === 'whatsapp' ? `WhatsApp · +${detail.waId}` : CHANNEL_LABEL[channelOf(detail.waId)]}</span>
                    {detail.language && <span>· {detail.language}</span>}
                    {detail.linked && <span>· compte lié</span>}
                    {detail.notes.length > 0 && <span className="truncate">· {detail.notes.map((n) => `${n.key} : ${n.value}`).join(', ')}</span>}
                  </p>
                </div>
                {confirmDelete ? (
                  <div className="flex shrink-0 items-center gap-2" role="alertdialog" aria-label="Confirmer la suppression">
                    <span className="hidden text-xs text-red-700 sm:inline">Supprimer définitivement ?</span>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void remove()}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      Oui, supprimer
                    </button>
                    <button type="button" disabled={busy} onClick={() => setConfirmDelete(false)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs">
                      Annuler
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Supprimer</span>
                  </button>
                )}
              </header>

              {ticket && (
                <div className="flex items-start gap-2 border-b border-amber-100 bg-amber-50 px-4 py-2 text-xs text-amber-900">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    <b>Ticket {ticket.urgency === 'high' ? 'urgent' : ticket.urgency === 'low' ? 'peu urgent' : 'normal'}</b> : {ticket.reason}
                    {ticket.summary ? ` — ${ticket.summary}` : ''}
                  </span>
                </div>
              )}

              <div className="relative flex min-h-0 flex-1 flex-col">
              <div
                ref={logRef}
                onScroll={(e) => {
                  const el = e.currentTarget;
                  stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
                  if (stickToBottom.current) setNewBelow(false);
                }}
                className="min-h-[96px] flex-1 space-y-1 overflow-y-auto bg-slate-50/80 px-4 py-3"
                role="log"
                aria-live="polite"
              >
                {groups.map((g) => (
                  <div key={g.day} className="space-y-2">
                    <div className="sticky top-0 z-[1] flex justify-center py-1">
                      <span className="rounded-full bg-white/95 px-3 py-0.5 text-[11px] font-medium capitalize text-slate-500 shadow-sm ring-1 ring-slate-200">
                        {g.day}
                      </span>
                    </div>
                    {g.items.map((m, i) => {
                      const mine = m.role !== 'user';
                      return (
                        <div key={`${m.ts}-${i}`} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm shadow-sm sm:max-w-[75%] ${
                              m.role === 'user'
                                ? 'rounded-bl-md bg-white text-slate-800 ring-1 ring-slate-200'
                                : m.role === 'human_agent'
                                  ? 'rounded-br-md bg-sky-100 text-slate-900 ring-1 ring-sky-200'
                                  : 'rounded-br-md bg-emerald-100 text-slate-900 ring-1 ring-emerald-200'
                            }`}
                          >
                            {mine && <span className="mb-0.5 block text-[11px] font-semibold text-slate-500">{roleLabel(m.role)}</span>}
                            {renderText(m.text)}
                            <span className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-400">
                              {timeOf(m.ts)}
                              {mine && <CheckCheck className="h-3 w-3" />}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              {newBelow && (
                <button
                  type="button"
                  onClick={() => {
                    const el = logRef.current;
                    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
                    setNewBelow(false);
                  }}
                  className="absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg hover:bg-violet-700"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                  Nouveaux messages
                </button>
              )}
              </div>

              {['whatsapp', 'web', 'email'].includes(channelOf(detail.waId)) && (
                <AgentPanel
                  waId={detail.waId}
                  refreshKey={agentTick}
                  onChanged={() => {
                    stickToBottom.current = true;
                    void loadList();
                    if (openedId.current) void loadDetail(openedId.current);
                  }}
                />
              )}

              {ticket && channelOf(detail.waId) !== 'identity' ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void send(false);
                  }}
                  className="border-t border-violet-50 bg-white p-3"
                >
                  <div className="flex items-end gap-2">
                    <textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          void send(false);
                        }
                      }}
                      rows={2}
                      maxLength={2000}
                      placeholder="Répondre au visiteur…"
                      className="min-h-[44px] flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
                    />
                    <div className="flex flex-col gap-1.5">
                      <button
                        type="submit"
                        disabled={busy || !reply.trim()}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
                      >
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        Envoyer
                      </button>
                      <button
                        type="button"
                        disabled={busy || !reply.trim()}
                        onClick={() => void send(true)}
                        className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                      >
                        Envoyer et clore
                      </button>
                    </div>
                  </div>
                  <p className="mt-1 flex justify-between text-[11px] text-slate-400">
                    <span>Entrée : envoyer · Maj+Entrée : retour à la ligne</span>
                    <span>{reply.length}/2000</span>
                  </p>
                </form>
              ) : (
                <div className="flex items-center gap-2 border-t border-violet-50 bg-white px-4 py-3 text-xs text-slate-500">
                  <Info className="h-3.5 w-3.5 shrink-0" />
                  {channelOf(detail.waId) === 'identity' ? (
                    detail.handoff?.active ? (
                      <span>
                        Dossier d’identité à vérifier : décidez dans la{' '}
                        <a href={identityAdminUrl()} target="_blank" rel="noreferrer" className="font-medium text-violet-700 underline">
                          page Identité
                        </a>
                        . La demande se ferme d’elle-même à la décision.
                      </span>
                    ) : (
                      'Dossier d’identité traité : demande close.'
                    )
                  ) : channelOf(detail.waId) === 'salesiq'
                    ? detail.handoff?.active
                      ? 'Demande à traiter par l’équipe : répondez au visiteur depuis Zoho SalesIQ (cette copie est en lecture seule).'
                      : 'Conversation SalesIQ en lecture seule : pour répondre au visiteur, utilisez Zoho SalesIQ.'
                    : "Aucun ticket ouvert : l'assistant IA répond seul à cette conversation."}
                </div>
              )}
            </>
          )}
        </section>
      </div>
      )}
    </div>
  );
}
