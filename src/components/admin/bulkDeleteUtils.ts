import axios from 'axios';
import type { AccountOffer } from './accountOfferUtils';

/**
 * Suppression de comptes en masse depuis la liste des utilisateurs : fonctions pures, testées.
 * Le serveur (POST /api/admin/users/bulk-delete) applique à chaque compte la suppression unitaire (maquette A3).
 */

/** Au plus 50 comptes par lot (même limite que le serveur). */
export const BULK_DELETE_MAX = 50;

/** Ce qu'il faut d'une ligne de la liste pour la sélection et la fenêtre de confirmation. */
export type BulkRow = {
  _id: string;
  fullName?: string;
  email: string;
  displayName?: string;
  displayEmail?: string;
  typeUser?: string | null;
  protectedAccount?: boolean;
  accountOffer?: AccountOffer | null;
};

/** Raison pour laquelle une ligne ne peut pas être cochée (infobulle) ; null si elle peut l'être. */
export function bulkLockReason(row: BulkRow): string | null {
  if (row.protectedAccount) return 'Compte protégé (démonstration Apple) : il ne peut jamais être supprimé.';
  if (row.typeUser === 'admin') return 'Compte administrateur : il ne peut pas être supprimé ici.';
  return null;
}

export const isBulkSelectable = (row: BulkRow): boolean => bulkLockReason(row) === null;

/** Sélection : identifiant → ligne (gardée pour afficher nom, email et offre dans la confirmation, même après un changement de page). */
export type Selection = Map<string, BulkRow>;

/** Coche / décoche une ligne. Une ligne verrouillée n'est jamais ajoutée ; rien n'est ajouté au-delà de 50 comptes. */
export function toggleRow(selection: Selection, row: BulkRow): Selection {
  const next = new Map(selection);
  if (next.has(row._id)) next.delete(row._id);
  else if (isBulkSelectable(row) && next.size < BULK_DELETE_MAX) next.set(row._id, row);
  return next;
}

/** État de la case « Tout sélectionner (page) » : toutes les lignes cochables de la page sont-elles cochées ? */
export function pageSelectionState(selection: Selection, rows: BulkRow[]): 'none' | 'some' | 'all' {
  const selectable = rows.filter(isBulkSelectable);
  if (!selectable.length) return 'none';
  const n = selectable.filter((r) => selection.has(r._id)).length;
  if (n === 0) return 'none';
  return n === selectable.length ? 'all' : 'some';
}

/** « Tout sélectionner (page) » : coche toutes les lignes cochables de la page (dans la limite de 50), ou les décoche toutes. */
export function togglePage(selection: Selection, rows: BulkRow[]): Selection {
  const next = new Map(selection);
  if (pageSelectionState(selection, rows) === 'all') {
    rows.forEach((r) => next.delete(r._id));
    return next;
  }
  for (const r of rows) {
    if (next.size >= BULK_DELETE_MAX) break;
    if (isBulkSelectable(r)) next.set(r._id, r);
  }
  return next;
}

export const selectionLabel = (n: number): string => `${n} sélectionné${n > 1 ? 's' : ''}`;

/** Texte à taper : « SUPPRIMER N ». */
export const bulkConfirmText = (n: number): string => `SUPPRIMER ${n}`;

/** La saisie correspond-elle ? Espaces autour et en trop ignorés, majuscules exigées (comme le serveur). */
export function bulkConfirmMatches(typed: string, n: number): boolean {
  return n > 0 && String(typed || '').trim().replace(/\s+/g, ' ') === bulkConfirmText(n);
}

/** Bouton de la fenêtre : « Supprimer 3 comptes définitivement » (« 1 compte » au singulier). */
export const bulkSubmitLabel = (n: number): string => `Supprimer ${n} compte${n > 1 ? 's' : ''} définitivement`;

export type BulkResultStatus = 'deleted' | 'refused' | 'failed';
export type BulkResult = { userId: string; email: string | null; status: BulkResultStatus; code?: string; confirmationEmailSent?: boolean };
export type BulkTotals = { requested: number; deleted: number; refused: number; failed: number };
export type BulkResponse = { batchId: string; results: BulkResult[]; totals: BulkTotals };

const REASON_TEXT: Record<string, string> = {
  PROTECTED_ACCOUNT: 'Compte protégé : il ne peut jamais être supprimé.',
  ADMIN_ACCOUNT: 'Compte administrateur : suppression impossible ici.',
  COMPANY_HAS_MEMBERS: 'Entreprise avec d’autres membres : suppression impossible ici.',
  ACCOUNT_NOT_FOUND: 'Compte introuvable (déjà supprimé).',
  ACCOUNT_PURGE_FAILED: 'Résiliation de l’abonnement ou remise en stock du numéro en échec. Rien n’a été supprimé : réessayez.',
  ACCOUNT_PURGE_NOT_CONFIGURED: 'Suppression indisponible : le serveur n’est pas configuré.',
};

/** Raison en français d'un refus ou d'un échec. */
export function bulkReasonText(code?: string): string {
  return (code && REASON_TEXT[code]) || 'Échec inattendu. Rien n’a été supprimé pour ce compte : réessayez.';
}

/** Regroupe les résultats par statut, dans l'ordre demandé. */
export function groupBulkResults(results: BulkResult[]): Record<BulkResultStatus, BulkResult[]> {
  return {
    deleted: results.filter((r) => r.status === 'deleted'),
    refused: results.filter((r) => r.status === 'refused'),
    failed: results.filter((r) => r.status === 'failed'),
  };
}

const REQUEST_ERROR_TEXT: Record<string, string> = {
  CONFIRMATION_MISMATCH: 'Le texte tapé ne correspond pas. Rien n’a été supprimé.',
  TOO_MANY_USERS: `Au plus ${BULK_DELETE_MAX} comptes par suppression. Rien n’a été supprimé.`,
  INVALID_USER_IDS: 'Sélection invalide. Rien n’a été supprimé.',
};

/** Erreur de la requête entière (avant tout traitement : rien n'a été supprimé). */
export function bulkRequestErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'Serveur injoignable ou délai dépassé. Rechargez la liste pour voir les comptes restants.';
    if (error.response.status === 401) return 'Session admin refusée : reconnectez-vous.';
    if (error.response.status === 403) return 'Accès administrateur requis.';
    const code = (error.response.data as { code?: string } | undefined)?.code;
    if (code && REQUEST_ERROR_TEXT[code]) return REQUEST_ERROR_TEXT[code];
  }
  return 'La suppression a échoué. Rechargez la liste pour voir les comptes restants.';
}
