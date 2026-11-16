import React from 'react';
import { WORDMARKS, WORDMARK_STROKE_WIDTH } from '../../config/offerWordmarks';

interface OfferWordmarkProps {
  offer: 'taas' | 'cloud' | 'nomad';
  /** Texte lisible (TAAS / CLOUD / NOMAD) pour lecteurs d'écran et référencement ; le dessin est décoratif. */
  label: string;
}

/** Sigle de l'offre en wordmark SVG en trait (currentColor). Jamais miroité en RTL (dir="ltr"), sans animation. */
export function OfferWordmark({ offer, label }: OfferWordmarkProps) {
  const { viewBox, paths } = WORDMARKS[offer];
  return (
    <>
      <span className="sr-only">{label}</span>
      <svg
        className="hub-wordmark"
        viewBox={viewBox}
        dir="ltr"
        aria-hidden="true"
        focusable="false"
        fill="none"
        stroke="currentColor"
        strokeWidth={WORDMARK_STROKE_WIDTH}
        strokeLinejoin="miter"
        strokeLinecap="butt"
      >
        {paths.map((p, i) => (
          <path key={i} d={p.d} transform={p.transform} />
        ))}
      </svg>
    </>
  );
}
