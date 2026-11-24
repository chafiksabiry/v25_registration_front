import axios from 'axios';

/**
 * API de l'agent support IA (serveur comporchestrator, /api/whatsapp/admin/agent/*), mêmes règles d'accès que l'Inbox :
 * jeton admin du tableau de bord en en-tête Authorization. Fichier séparé de lib/api.ts (aucun changement des appels existants).
 */
const agentBase = () =>
  `${String(
    import.meta.env.VITE_COMPORCHESTRATOR_BACK_URL ||
      import.meta.env.VITE_COMPANY_ORCHESTRATOR_URL ||
      'https://v25comporchestratorback-production.up.railway.app',
  ).replace(/\/$/, '')}/api/whatsapp/admin/agent`;

const call = async <T>(method: 'get' | 'post', path: string, data?: unknown): Promise<T> => {
  const token = localStorage.getItem('token');
  const response = await axios.request<T>({
    method,
    url: `${agentBase()}${path}`,
    data,
    timeout: 60000,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return response.data;
};

export type AgentDraft = {
  id: string;
  kind: 'reply' | 'holding' | 'final';
  text: string;
  status: 'pending' | 'sent' | 'superseded';
  createdAt: string;
  sentAt: string | null;
  sentBy: 'agent' | 'founder' | null;
  edited: boolean;
  reason: string;
};

export type AgentEscalation = {
  categories: string[];
  category: string;
  label: string;
  summary: string;
  diagnosis: string;
  recommendation: string;
  legalCc: string | null;
  incident: { code: string; customers: number } | null;
  notified?: { email: string; webhook: string };
  decision: { action: 'approve' | 'correct'; note: string; at: string } | null;
};

export type AgentLogEntry = { at: string; action: string; reason?: string; text?: string; sources?: string[]; by?: string; model?: string | null };

export type AgentCase = {
  ticketId: string;
  waId: string;
  channel: string;
  state: 'new' | 'draft_pending' | 'awaiting_customer' | 'awaiting_founder' | 'closed';
  language: string;
  verified: boolean;
  hasAccount: boolean;
  classification: { motif: string; product: string; severity: string } | null;
  errorCodes: string[];
  drafts: AgentDraft[];
  escalation: AgentEscalation | null;
  log: AgentLogEntry[];
  createdAt: string;
  firstResponseAt: string | null;
  closedAt: string | null;
  closeReason: string;
};

export type AgentPendingItem = { waId: string; ticketId: string; state: AgentCase['state']; pendingDrafts: number; category: string | null };

export type AgentMetrics = {
  enabled: boolean;
  mode: 'draft' | 'autonomous';
  period: { from: string; to: string; days: number };
  requests: { total: number; byChannel: Record<string, number>; byMotif: Record<string, number> };
  resolvedWithoutHuman: { closed: number; withoutHuman: number; share: number | null };
  firstResponseMinutes: { count: number; median: number | null; average: number | null };
  escalations: { total: number; byCategory: Record<string, number> };
  openOver24h: { total: number; items: Array<{ ticketId: string; channel: string; motif: string; state: string; ageHours: number }> };
};

export const supportAgentApi = {
  status: () => call<{ enabled: boolean; mode: string; model: string; blockers: string[]; gmail: { enabled: boolean; address: string; blockers: string[] } }>('get', '/status'),
  cases: (waId: string) => call<{ enabled: boolean; mode: string; cases: AgentCase[] }>('get', `/cases?waId=${encodeURIComponent(waId)}`),
  pending: () => call<{ enabled: boolean; mode: string; items: AgentPendingItem[] }>('get', '/pending'),
  sendDraft: (ticketId: string, draftId: string, text?: string) =>
    call<{ sent: boolean; case: AgentCase }>('post', `/cases/${encodeURIComponent(ticketId)}/drafts/${encodeURIComponent(draftId)}/send`, text == null ? {} : { text }),
  decide: (ticketId: string, action: 'approve' | 'correct', note = '') =>
    call<{ ok: boolean; case: AgentCase }>('post', `/cases/${encodeURIComponent(ticketId)}/decision`, { action, note }),
  close: (ticketId: string) => call<{ case: AgentCase }>('post', `/cases/${encodeURIComponent(ticketId)}/close`),
  run: (ticketId: string) => call<{ case?: AgentCase }>('post', `/tickets/${encodeURIComponent(ticketId)}/run`),
  metrics: (days = 7) => call<AgentMetrics>('get', `/metrics?days=${days}`),
};

export const MOTIF_LABEL: Record<string, string> = {
  billing_payment: 'Paiement, facture',
  subscription_plan: 'Abonnement, offre',
  phone_number: 'Numéro',
  calls: 'Appels',
  identity_verification: 'Vérification d’identité',
  account_access: 'Accès au compte',
  mobile_app: 'Application mobile',
  onboarding: 'Mise en route',
  minutes_tokens: 'Minutes, jetons',
  technical_error: 'Erreur technique',
  legal: 'Juridique',
  other: 'Autre',
  unclassified: 'Non classé',
};
export const PRODUCT_LABEL: Record<string, string> = { nomad: 'NOMAD', cloud: 'CLOUD', taas: 'TAAS', unknown: 'Produit inconnu' };
export const SEVERITY_LABEL: Record<string, string> = { low: 'Gravité basse', normal: 'Gravité normale', high: 'Gravité haute', critical: 'Gravité critique' };
export const CATEGORY_LABEL: Record<string, string> = {
  refund_commercial: 'Remboursement, avoir, geste commercial ou prix',
  cancellation: 'Résiliation',
  number_change: 'Changement ou libération de numéro',
  account_deletion: 'Suppression de compte',
  identity_decision: 'Décision d’identité',
  legal: 'Juridique',
  incident: 'Incident multi-clients',
  uncertain: 'Doute de l’agent',
};
export const CHANNEL_NAME: Record<string, string> = { whatsapp: 'WhatsApp', web: 'Chat du site', email: 'E-mail', salesiq: 'SalesIQ', identity: 'Identité' };
export const LANGUAGE_NAME: Record<string, string> = { fr: 'français', en: 'anglais', es: 'espagnol', ar: 'arabe' };
