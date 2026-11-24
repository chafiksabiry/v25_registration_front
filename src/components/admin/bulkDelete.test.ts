import { AxiosError, type AxiosResponse } from 'axios';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { BulkDeleteDialogView, BulkDeleteResults, BulkSelectionBar } from './AdminBulkDelete';
import {
  BULK_DELETE_MAX,
  bulkConfirmMatches,
  bulkConfirmText,
  bulkLockReason,
  bulkReasonText,
  bulkRequestErrorMessage,
  bulkSubmitLabel,
  groupBulkResults,
  isBulkSelectable,
  pageSelectionState,
  selectionLabel,
  togglePage,
  toggleRow,
  type BulkResponse,
  type BulkRow,
  type Selection,
} from './bulkDeleteUtils';

const row = (n: number, over: Partial<BulkRow> = {}): BulkRow => ({
  _id: `id${n}`,
  fullName: `Compte ${n}`,
  email: `compte${n}@exemple.fr`,
  typeUser: 'call-center',
  accountOffer: { offer: 'nomad' },
  ...over,
});
const apple = row(90, { email: 'chafik.sabiry4apple@harx.ai', protectedAccount: true });
const admin = row(91, { typeUser: 'admin' });
const empty: Selection = new Map();

describe('sélection : cases par ligne et « Tout sélectionner (page) »', () => {
  it('compte protégé et administrateur : case désactivée, avec une infobulle', () => {
    expect(isBulkSelectable(row(1))).toBe(true);
    expect(bulkLockReason(row(1))).toBeNull();
    expect(bulkLockReason(apple)).toMatch(/protégé/);
    expect(bulkLockReason(admin)).toMatch(/administrateur/);
    expect(isBulkSelectable(apple)).toBe(false);
    expect(isBulkSelectable(admin)).toBe(false);
  });

  it('cocher / décocher une ligne ; une ligne verrouillée n’est jamais ajoutée', () => {
    let s = toggleRow(empty, row(1));
    expect([...s.keys()]).toEqual(['id1']);
    s = toggleRow(s, apple);
    s = toggleRow(s, admin);
    expect([...s.keys()]).toEqual(['id1']);
    s = toggleRow(s, row(1));
    expect(s.size).toBe(0);
    expect(empty.size).toBe(0);
  });

  it('« Tout sélectionner (page) » coche les seules lignes cochables, puis les décoche', () => {
    const rows = [row(1), apple, row(2), admin];
    expect(pageSelectionState(empty, rows)).toBe('none');
    const all = togglePage(empty, rows);
    expect([...all.keys()]).toEqual(['id1', 'id2']);
    expect(pageSelectionState(all, rows)).toBe('all');
    expect(pageSelectionState(toggleRow(all, row(1)), rows)).toBe('some');
    expect(togglePage(all, rows).size).toBe(0);
    expect(pageSelectionState(empty, [apple, admin])).toBe('none');
  });

  it('sélection gardée d’une page à l’autre ; jamais plus de 50 comptes', () => {
    const page1 = Array.from({ length: 25 }, (_, i) => row(i));
    const page2 = Array.from({ length: 25 }, (_, i) => row(100 + i));
    const page3 = [row(200), row(201)];
    let s = togglePage(empty, page1);
    s = togglePage(s, page2);
    expect(s.size).toBe(50);
    s = togglePage(s, page3);
    s = toggleRow(s, row(300));
    expect(s.size).toBe(BULK_DELETE_MAX);
  });

  it('barre de sélection : « N sélectionné(s) » et « Supprimer la sélection », absente sans sélection', () => {
    expect(selectionLabel(1)).toBe('1 sélectionné');
    expect(selectionLabel(3)).toBe('3 sélectionnés');
    const html = renderToStaticMarkup(React.createElement(BulkSelectionBar, { count: 3, onClear: () => {}, onDelete: () => {} }));
    expect(html).toContain('3 sélectionnés');
    expect(html).toContain('Supprimer la sélection');
    expect(html).toContain('admin-btn-danger-outline');
    expect(renderToStaticMarkup(React.createElement(BulkSelectionBar, { count: 0, onClear: () => {}, onDelete: () => {} }))).toBe('');
  });
});

describe('confirmation : « SUPPRIMER N » exigé', () => {
  it('texte exact (espaces tolérés, majuscules exigées)', () => {
    expect(bulkConfirmText(3)).toBe('SUPPRIMER 3');
    expect(bulkConfirmMatches('SUPPRIMER 3', 3)).toBe(true);
    expect(bulkConfirmMatches('  SUPPRIMER   3 ', 3)).toBe(true);
    for (const t of ['', 'SUPPRIMER', 'SUPPRIMER 2', 'supprimer 3', 'SUPPRIMER 30']) expect(bulkConfirmMatches(t, 3)).toBe(false);
    expect(bulkConfirmMatches('SUPPRIMER 0', 0)).toBe(false);
  });

  const view = (typed: string, rows = [row(1), row(2, { accountOffer: { offer: 'cloud', product: 'receptionist' } }), row(3)]) =>
    renderToStaticMarkup(React.createElement(BulkDeleteDialogView, { rows, typed, busy: false, error: null, onTyped: () => {}, onClose: () => {}, onSubmit: () => {} }));
  const submitTag = (html: string) => /<button[^>]*data-testid="bulk-delete-submit"[^>]*>/.exec(html)?.[0] || '';

  it('fenêtre : comptes (nom, email, offre), 4 conséquences, bouton « Supprimer N comptes définitivement »', () => {
    const html = view('');
    expect(html).toContain('Supprimer définitivement 3 comptes ?');
    for (const n of [1, 2, 3]) {
      expect(html).toContain(`Compte ${n}`);
      expect(html).toContain(`compte${n}@exemple.fr`);
    }
    expect(html).toContain('data-offer="nomad"');
    expect(html).toContain('Receptionist');
    expect(html).toContain('Abonnement Stripe résilié immédiatement');
    expect(html).toContain('Numéros remis en stock');
    expect(html).toContain('Données personnelles supprimées');
    expect(html).toContain('Emails libérés');
    expect(html).toContain('SUPPRIMER 3');
    expect(html).toContain('Supprimer 3 comptes définitivement');
    expect(bulkSubmitLabel(1)).toBe('Supprimer 1 compte définitivement');
  });

  it('bouton désactivé tant que « SUPPRIMER N » n’est pas tapé', () => {
    expect(submitTag(view(''))).toContain('disabled');
    expect(submitTag(view('SUPPRIMER 2'))).toContain('disabled');
    expect(submitTag(view('SUPPRIMER 3'))).not.toContain('disabled');
  });

  it('erreur de la requête entière : message en français, rien n’a été supprimé', () => {
    const err = (status: number, data: unknown) =>
      new AxiosError('x', 'ERR', undefined, undefined, { status, data, statusText: '', headers: {}, config: {} as never } as AxiosResponse);
    expect(bulkRequestErrorMessage(err(400, { code: 'CONFIRMATION_MISMATCH' }))).toMatch(/ne correspond pas/);
    expect(bulkRequestErrorMessage(err(400, { code: 'TOO_MANY_USERS' }))).toMatch(/50 comptes/);
    expect(bulkRequestErrorMessage(err(401, {}))).toMatch(/reconnectez-vous/);
    expect(bulkRequestErrorMessage(new AxiosError('net'))).toMatch(/injoignable/);
  });
});

describe('résultats : supprimés / refusés (raison) / en échec', () => {
  const response: BulkResponse = {
    batchId: 'b1',
    totals: { requested: 5, deleted: 2, refused: 2, failed: 1 },
    results: [
      { userId: 'id1', email: 'compte1@exemple.fr', status: 'deleted', confirmationEmailSent: true },
      { userId: 'id90', email: 'chafik.sabiry4apple@harx.ai', status: 'refused', code: 'PROTECTED_ACCOUNT' },
      { userId: 'id2', email: 'compte2@exemple.fr', status: 'deleted', confirmationEmailSent: false },
      { userId: 'id3', email: 'compte3@exemple.fr', status: 'refused', code: 'COMPANY_HAS_MEMBERS' },
      { userId: 'id4', email: 'compte4@exemple.fr', status: 'failed', code: 'ACCOUNT_PURGE_FAILED' },
    ],
  };

  it('regroupement et raisons en français', () => {
    const g = groupBulkResults(response.results);
    expect(g.deleted.map((r) => r.userId)).toEqual(['id1', 'id2']);
    expect(g.refused.map((r) => r.userId)).toEqual(['id90', 'id3']);
    expect(g.failed.map((r) => r.userId)).toEqual(['id4']);
    expect(bulkReasonText('PROTECTED_ACCOUNT')).toMatch(/protégé/);
    expect(bulkReasonText('ADMIN_ACCOUNT')).toMatch(/administrateur/);
    expect(bulkReasonText('COMPANY_HAS_MEMBERS')).toMatch(/autres membres/);
    expect(bulkReasonText('ACCOUNT_NOT_FOUND')).toMatch(/déjà supprimé/);
    expect(bulkReasonText('ACCOUNT_PURGE_FAILED')).toMatch(/réessayez/);
    expect(bulkReasonText('X')).toMatch(/Échec inattendu/);
  });

  it('panneau : totaux, trois sections, raison par compte, e-mail non envoyé signalé', () => {
    const html = renderToStaticMarkup(React.createElement(BulkDeleteResults, {
      response,
      names: { id1: 'Compte 1', id2: 'Compte 2', id3: 'Compte 3', id4: 'Compte 4', id90: 'Démo Apple' },
      onClose: () => {},
    }));
    expect(html).toContain('2 supprimés · 2 refusés · 1 en échec, sur 5 demandés.');
    expect(html).toContain('Supprimés (2)');
    expect(html).toContain('Refusés (2)');
    expect(html).toContain('En échec (1)');
    expect(html).toContain('Démo Apple');
    expect(html).toContain(bulkReasonText('PROTECTED_ACCOUNT'));
    expect(html).toContain(bulkReasonText('COMPANY_HAS_MEMBERS'));
    expect(html).toContain(bulkReasonText('ACCOUNT_PURGE_FAILED'));
    expect(html).toContain('E-mail de confirmation non envoyé.');
  });

  it('section vide non affichée', () => {
    const html = renderToStaticMarkup(React.createElement(BulkDeleteResults, {
      response: { batchId: 'b', totals: { requested: 1, deleted: 1, refused: 0, failed: 0 }, results: [{ userId: 'id1', email: 'a@b.fr', status: 'deleted', confirmationEmailSent: true }] },
      names: {},
      onClose: () => {},
    }));
    expect(html).toContain('bulk-results-deleted');
    expect(html).not.toContain('bulk-results-refused');
    expect(html).not.toContain('bulk-results-failed');
  });
});
