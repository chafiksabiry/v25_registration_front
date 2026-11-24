import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import RecetteMarker, { RecetteCornerBadge, RecetteHeaderBadge } from '../components/RecetteMarker';
import { RECETTE_TITLE_PREFIX, installRecetteTitlePrefix, isNonProduction, isRecette, withRecettePrefix } from './appEnv';

describe('Détection recette / production (VITE_APP_ENV, puis adresse)', () => {
  it('variable « recette » : hors production, quelle que soit l’adresse', () => {
    expect(isNonProduction('recette', 'harx.ai')).toBe(true);
    expect(isNonProduction(' Recette ', '')).toBe(true);
    expect(isNonProduction('staging', 'harx.ai')).toBe(true);
  });

  it('variable « production » : production, même sur une adresse de recette (la variable l’emporte)', () => {
    expect(isNonProduction('production', 'harx.ai')).toBe(false);
    expect(isNonProduction('PRODUCTION', 'harx26register-recette.netlify.app')).toBe(false);
    expect(isNonProduction('production', 'localhost')).toBe(false);
  });

  it('variable absente : adresses de production = production', () => {
    for (const host of ['harx.ai', 'www.harx.ai', 'harx26register.netlify.app', 'harx26callcenter.netlify.app', '']) {
      expect(isNonProduction(undefined, host)).toBe(false);
      expect(isNonProduction('', host)).toBe(false);
      expect(isNonProduction(null, host)).toBe(false);
    }
  });

  it('variable absente : filet de sécurité sur « recette », « deploy-preview-- » et « localhost »', () => {
    expect(isNonProduction(undefined, 'harx26register-recette.netlify.app')).toBe(true);
    expect(isNonProduction(undefined, 'harx26connection-recette.netlify.app')).toBe(true);
    expect(isNonProduction(undefined, 'deploy-preview--42--harx26register.netlify.app')).toBe(true);
    expect(isNonProduction(undefined, 'deploy-preview-42--harx26register.netlify.app')).toBe(false);
    expect(isNonProduction(undefined, 'localhost')).toBe(true);
    expect(isNonProduction(undefined, 'HARX26REGISTER-RECETTE.NETLIFY.APP')).toBe(true);
  });

  it('isRecette lit VITE_APP_ENV', () => {
    expect(isRecette({ VITE_APP_ENV: 'recette' }, 'harx.ai')).toBe(true);
    expect(isRecette({}, 'harx.ai')).toBe(false);
    expect(isRecette(undefined, 'harx.ai')).toBe(false);
  });
});

describe('Titre d’onglet « [RECETTE] »', () => {
  it('préfixe une seule fois', () => {
    expect(withRecettePrefix('HARX — Utilisateurs')).toBe('[RECETTE] HARX — Utilisateurs');
    expect(withRecettePrefix('[RECETTE] HARX')).toBe('[RECETTE] HARX');
    expect(RECETTE_TITLE_PREFIX).toBe('[RECETTE] ');
  });

  it('installRecetteTitlePrefix préfixe le titre courant', () => {
    const doc = { title: 'HARX — Accueil', head: null } as unknown as Document;
    installRecetteTitlePrefix(doc)();
    expect(doc.title).toBe('[RECETTE] HARX — Accueil');
    installRecetteTitlePrefix(doc);
    expect(doc.title).toBe('[RECETTE] HARX — Accueil');
  });
});

describe('Repères affichés', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('production : RecetteMarker ne rend rien', () => {
    expect(renderToStaticMarkup(React.createElement(RecetteMarker, { recette: false }))).toBe('');
    expect(renderToStaticMarkup(React.createElement(RecetteMarker, { recette: false, showBadge: true }))).toBe('');
  });

  it('production (variable absente, adresse hors recette) : rien par défaut', () => {
    vi.stubEnv('VITE_APP_ENV', '');
    // Environnement de test sans fenêtre : adresse vide = production.
    expect(isRecette()).toBe(false);
    expect(renderToStaticMarkup(React.createElement(RecetteMarker))).toBe('');
  });

  it('variable « production » : rien', () => {
    vi.stubEnv('VITE_APP_ENV', 'production');
    expect(renderToStaticMarkup(React.createElement(RecetteMarker))).toBe('');
  });

  it('recette : badge « RECETTE » (sauf dans le back office, qui a le sien)', () => {
    const html = renderToStaticMarkup(React.createElement(RecetteMarker, { recette: true }));
    expect(html).toContain('data-testid="recette-corner-badge"');
    expect(html).toContain('>RECETTE<');
    expect(html).toContain('pointer-events:none');
    expect(renderToStaticMarkup(React.createElement(RecetteMarker, { recette: true, showBadge: false }))).toBe('');
  });

  it('variable « recette » : badge par défaut', () => {
    vi.stubEnv('VITE_APP_ENV', 'recette');
    expect(renderToStaticMarkup(React.createElement(RecetteMarker))).toContain('recette-corner-badge');
  });

  it('badge du back office : « RECETTE — données de test »', () => {
    expect(renderToStaticMarkup(React.createElement(RecetteHeaderBadge))).toContain('RECETTE — données de test');
    expect(renderToStaticMarkup(React.createElement(RecetteHeaderBadge, { compact: true }))).toContain('>RECETTE<');
    expect(renderToStaticMarkup(React.createElement(RecetteCornerBadge))).toContain('position:fixed');
  });
});
