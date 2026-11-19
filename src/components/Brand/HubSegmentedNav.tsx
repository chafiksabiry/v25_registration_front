import React from 'react';
import { Cloud, Globe, Layers, type LucideIcon } from 'lucide-react';
import type { MarkId } from '../../config/offers';
import './segNav.css';

const ICONS: Record<MarkId, { Icon: LucideIcon; label: string }> = {
  taas: { Icon: Layers, label: 'TAAS' },
  cloud: { Icon: Cloud, label: 'CLOUD' },
  nomad: { Icon: Globe, label: 'NOMAD' },
};

interface HubSegmentedNavProps {
  ids: readonly MarkId[];
  /** Offre courante (pastille blanche, aria-current) ; aucune sur l'accueil et les pages légales. */
  active?: MarkId | null;
  hrefFor: (id: MarkId) => string;
  onSelect: (e: React.MouseEvent<HTMLAnchorElement>, id: MarkId) => void;
  /** Libellés toujours visibles (menu mobile) ; sinon masqués visuellement sous 1100 px mais lus par les lecteurs d'écran. */
  showLabels?: boolean;
}

/** Sélecteur segmenté de l'accueil : un cadre en verre sombre, trois onglets de même largeur (icône en trait fin + sigle). */
export function HubSegmentedNav({ ids, active = null, hrefFor, onSelect, showLabels = false }: HubSegmentedNavProps) {
  return (
    <div className={`seg-nav${showLabels ? ' seg-nav--labels' : ''}`} data-testid="offer-marks">
      {ids.map((id) => {
        const { Icon, label } = ICONS[id];
        return (
          <a key={id} href={hrefFor(id)} onClick={(e) => onSelect(e, id)} className={`seg-nav__tab${active === id ? ' is-active' : ''}`} aria-current={active === id ? 'page' : undefined} data-testid={`offer-mark-${id}`}>
            <Icon className="seg-nav__icon" aria-hidden="true" />
            <span className="seg-nav__label">{label}</span>
          </a>
        );
      })}
    </div>
  );
}
