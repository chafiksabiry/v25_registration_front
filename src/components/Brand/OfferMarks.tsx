import React from 'react';
import { Cloud, Globe, Layers, Phone } from 'lucide-react';
import type { MarkId } from '../../config/offers';

export type OfferMarkId = MarkId;

/** Une marque d'offre : mêmes dimensions pour toutes, seuls le nom, l'icône et le dégradé changent. */
const MARKS: Record<OfferMarkId, { label: string; Icon: typeof Phone; gradient: string; badge: string; hoverText: string; glow: string }> = {
  telephony: {
    label: 'TELEPHONY',
    Icon: Phone,
    gradient: 'from-[#f59e0b] via-[#ec4899] to-[#a855f7]',
    badge: 'from-[#f59e0b] via-[#ec4899] to-[#a855f7]',
    hoverText: 'group-hover:text-transparent',
    glow: 'shadow-[0_8px_26px_-6px_rgba(168,85,247,0.7)]',
  },
  cloud: {
    label: 'CLOUD',
    Icon: Cloud,
    gradient: 'from-[#f59e0b] via-[#ec4899] to-[#a855f7]',
    badge: 'from-[#f59e0b] via-[#ec4899] to-[#a855f7]',
    hoverText: 'group-hover:text-transparent',
    glow: 'shadow-[0_8px_26px_-6px_rgba(168,85,247,0.7)]',
  },
  nomad: {
    label: 'NOMAD',
    Icon: Globe,
    gradient: 'from-[#ec4899] via-[#d946ef] to-[#a855f7]',
    badge: 'from-[#ec4899] via-[#d946ef] to-[#a855f7]',
    hoverText: 'group-hover:text-transparent',
    glow: 'shadow-[0_8px_26px_-6px_rgba(217,70,239,0.7)]',
  },
  taas: {
    label: 'TAAS',
    Icon: Layers,
    gradient: 'from-[#ef4444] via-[#f97316] to-[#f59e0b]',
    badge: 'from-[#ef4444] via-[#f97316] to-[#f59e0b]',
    hoverText: 'group-hover:text-transparent',
    glow: 'shadow-[0_8px_26px_-6px_rgba(249,115,22,0.7)]',
  },
};

interface OfferMarkProps {
  offer: OfferMarkId;
  /** Offre courante : carte blanche lumineuse, pastille d'icône en dégradé et trait de couleur dessous ; sinon verre dépoli, à cliquer. */
  active?: boolean;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  /** Gabarit plus étroit, pour les trois pastilles de l'accueil (TAAS, CLOUD, NOMAD). */
  compact?: boolean;
  className?: string;
  'data-testid'?: string;
}

/**
 * Marque d'une offre dans le bandeau. TAAS et TELEPHONY partagent exactement le même gabarit (largeur et hauteur fixes) :
 * le nom de l'offre n'est pas traduit, c'est une marque.
 */
export function OfferMark({ offer, active = false, href, onClick, compact = false, className = '', ...rest }: OfferMarkProps) {
  const { label, Icon, gradient, badge, hoverText, glow } = MARKS[offer];
  const width = compact ? 'w-[7.75rem] md:w-[8.5rem] lg:w-[10rem]' : 'w-[10.25rem] md:w-[11.5rem]';
  const size = `relative inline-flex h-11 ${width} shrink-0 items-center justify-center gap-2 overflow-hidden rounded-2xl text-[13px] font-black tracking-[0.18em] transition-all duration-300 md:h-12 md:text-sm`;
  const look = active
    ? `bg-white ring-1 ring-white/80 ${glow}`
    : 'bg-white/[0.12] ring-1 ring-white/35 backdrop-blur-md hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_10px_28px_-8px_rgba(0,0,0,0.55)]';
  return (
    <a href={href ?? '#'} onClick={onClick} aria-current={active ? 'page' : undefined} className={`group ${size} ${look} ${className}`} {...rest}>
      <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${active ? badge : 'from-white/25 to-white/10'} transition-colors`} aria-hidden="true">
        <Icon className={`h-3.5 w-3.5 ${active ? 'text-white' : 'text-white group-hover:text-[#E01070]'}`} />
      </span>
      <span className={`bg-gradient-to-r ${gradient} bg-clip-text ${active ? 'text-transparent' : `text-white ${hoverText}`}`}>{label}</span>
      {active ? <span className={`absolute inset-x-5 bottom-0 h-[3px] rounded-t-full bg-gradient-to-r ${gradient}`} aria-hidden="true" /> : null}
    </a>
  );
}
