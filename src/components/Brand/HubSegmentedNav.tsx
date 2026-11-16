import React from 'react';
import { Cloud, Globe, Layers, type LucideIcon } from 'lucide-react';
import type { MarkId } from '../../config/offers';

const ICONS: Partial<Record<MarkId, { Icon: LucideIcon; label: string }>> = {
  taas: { Icon: Layers, label: 'TAAS' },
  cloud: { Icon: Cloud, label: 'CLOUD' },
  nomad: { Icon: Globe, label: 'NOMAD' },
};

interface HubSegmentedNavProps {
  ids: readonly MarkId[];
  hrefFor: (id: MarkId) => string;
  onSelect: (e: React.MouseEvent<HTMLAnchorElement>, id: MarkId) => void;
  /** Libellés toujours visibles (menu mobile) ; sinon masqués visuellement sous 1100 px mais lus par les lecteurs d'écran. */
  showLabels?: boolean;
}

/** Sélecteur segmenté de l'accueil : un cadre en verre sombre, trois onglets de même largeur (icône en trait fin + sigle). */
export function HubSegmentedNav({ ids, hrefFor, onSelect, showLabels = false }: HubSegmentedNavProps) {
  return (
    <div className={`hub-seg${showLabels ? ' hub-seg--labels' : ''}`} data-testid="offer-marks">
      {ids.map((id) => {
        const entry = ICONS[id];
        if (!entry) return null;
        const { Icon, label } = entry;
        return (
          <a key={id} href={hrefFor(id)} onClick={(e) => onSelect(e, id)} className="hub-seg__tab" data-testid={`offer-mark-${id}`}>
            <Icon className="hub-seg__icon" aria-hidden="true" />
            <span className="hub-seg__label">{label}</span>
          </a>
        );
      })}
    </div>
  );
}
