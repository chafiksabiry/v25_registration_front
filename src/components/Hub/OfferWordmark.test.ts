import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { WORDMARKS, WORDMARK_STROKE_WIDTH } from '../../config/offerWordmarks';
import { OfferWordmark } from './OfferWordmark';
import { HubSegmentedNav } from '../Brand/HubSegmentedNav';

const render = (id: 'taas' | 'cloud' | 'nomad') => renderToStaticMarkup(React.createElement(OfferWordmark, { offer: id, label: id.toUpperCase() }));

describe('wordmarks des offres', () => {
  it('trois dessins distincts, même trait de 4,2 unités', () => {
    expect(Object.keys(WORDMARKS).sort()).toEqual(['cloud', 'nomad', 'taas']);
    const sigs = Object.values(WORDMARKS).map((w) => w.viewBox + w.paths.map((p) => p.d + (p.transform ?? '')).join('|'));
    expect(new Set(sigs).size).toBe(3);
    expect(WORDMARK_STROKE_WIDTH).toBe(4.2);
    expect(WORDMARKS.nomad.viewBox).toBe('-6 -6 482 52');
    expect(WORDMARKS.taas.viewBox).toBe('-6 -6 420 52');
    expect(WORDMARKS.cloud.viewBox).toBe('-6 -6 480 52');
    expect(WORDMARKS.nomad.paths).toHaveLength(5);
    expect(WORDMARKS.taas.paths).toHaveLength(4);
    expect(WORDMARKS.cloud.paths).toHaveLength(5);
  });

  for (const id of ['taas', 'cloud', 'nomad'] as const) {
    it(`${id} : texte masqué lisible, SVG aria-hidden, dir ltr, trait en currentColor`, () => {
      const html = render(id);
      expect(html).toContain(`<span class="sr-only">${id.toUpperCase()}</span>`);
      expect(html).toMatch(/<svg[^>]*aria-hidden="true"/);
      expect(html).toMatch(/<svg[^>]*dir="ltr"/);
      expect(html).toContain('stroke="currentColor"');
      expect(html).toContain('stroke-width="4.2"');
      expect(html).toContain('fill="none"');
      expect(html).toContain('stroke-linejoin="miter"');
      expect(html).toContain('stroke-linecap="butt"');
      expect(html).not.toMatch(/animate|<style/);
    });
  }

  it('même dessin partout : seule la classe de taille change (carte par défaut, onglet du bandeau)', () => {
    const card = render('nomad');
    const tab = renderToStaticMarkup(React.createElement(OfferWordmark, { offer: 'nomad', label: 'NOMAD', className: 'seg-nav__wordmark' }));
    expect(card).toContain('class="hub-wordmark"');
    expect(tab).toContain('class="seg-nav__wordmark"');
    expect(tab.replace('seg-nav__wordmark', 'hub-wordmark')).toBe(card);
  });

  it('bandeau : chaque onglet porte le logotype de son offre et son nom lisible', () => {
    const html = renderToStaticMarkup(
      React.createElement(HubSegmentedNav, { ids: ['taas', 'cloud', 'nomad'], active: 'cloud', hrefFor: (id: string) => `/${id}`, onSelect: () => undefined }),
    );
    for (const id of ['taas', 'cloud', 'nomad'] as const) {
      expect(html).toContain(`<span class="sr-only">${id.toUpperCase()}</span>`);
      expect(html).toContain(`viewBox="${WORDMARKS[id].viewBox}"`);
    }
    expect(html.match(/class="seg-nav__wordmark"/g)).toHaveLength(3);
    expect(html).toMatch(/class="seg-nav__tab is-active"[^>]*aria-current="page"[^>]*data-testid="offer-mark-cloud"/);
  });
});
