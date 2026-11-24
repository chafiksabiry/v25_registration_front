import React from 'react';
import { installRecetteTitlePrefix, isRecette } from '../lib/appEnv';

/**
 * Repères « RECETTE » (hors production seulement, voir lib/appEnv.ts). Couleur ambre, volontairement différente du dégradé de la
 * marque, pour ne jamais être prise pour un élément de l'interface de production. Styles en ligne : identiques en accès direct et
 * dans le site HARX (qiankun). Aucun repère ne capte la souris (pointer-events: none) : rien en dessous n'est bloqué.
 */
const AMBER = '#F59E0B';
const AMBER_LIGHT = '#FDE68A';
const INK = '#3B2300';

/** Badge fixe, dans le coin en haut à gauche de l'écran (au-dessus du logo, sans le couvrir) : pages publiques, connexion, inscription. */
export function RecetteCornerBadge() {
  return (
    <div
      data-testid="recette-corner-badge"
      role="status"
      aria-label="Environnement de recette — données de test"
      title="Environnement de recette — données de test"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 2147483000,
        pointerEvents: 'none',
        background: AMBER_LIGHT,
        color: INK,
        border: `1px solid ${AMBER}`,
        borderTop: 'none',
        borderLeft: 'none',
        borderRadius: '0 0 6px 0',
        padding: '1px 10px 2px',
        font: '800 10px/14px system-ui, -apple-system, "Segoe UI", sans-serif',
        letterSpacing: '0.12em',
        textShadow: 'none',
        boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
      }}
    >
      RECETTE
    </div>
  );
}

/** Fine bande ambre en haut de l'écran (back office). */
export function RecetteStrip() {
  return (
    <div
      data-testid="recette-strip"
      aria-hidden="true"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 4, background: AMBER, zIndex: 2147483000, pointerEvents: 'none' }}
    />
  );
}

/** Badge du bandeau du back office, à côté de « Administration ». */
export function RecetteHeaderBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span
      data-testid={compact ? 'recette-header-badge-compact' : 'recette-header-badge'}
      title="Environnement de recette — données de test"
      style={{
        display: 'inline-block',
        background: AMBER_LIGHT,
        color: INK,
        border: `1px solid ${AMBER}`,
        borderRadius: 6,
        padding: '1px 6px',
        font: '800 10px/14px system-ui, -apple-system, "Segoe UI", sans-serif',
        letterSpacing: '0.06em',
        textShadow: 'none',
        whiteSpace: 'nowrap',
        verticalAlign: 'middle',
      }}
    >
      {compact ? 'RECETTE' : 'RECETTE — données de test'}
    </span>
  );
}

/**
 * Repère global, posé une fois à la racine de l'application : préfixe « [RECETTE] » du titre d'onglet et badge fixe.
 * `showBadge` : false dans le back office, qui a sa propre bande et son badge dans le bandeau. En production : rien.
 */
export default function RecetteMarker({ showBadge = true, recette = isRecette() }: { showBadge?: boolean; recette?: boolean }) {
  React.useEffect(() => {
    if (!recette) return undefined;
    return installRecetteTitlePrefix();
  }, [recette]);
  if (!recette || !showBadge) return null;
  return <RecetteCornerBadge />;
}
