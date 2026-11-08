import React from 'react';
import { Layers, Phone } from 'lucide-react';

export type OfferMarkId = 'taas' | 'telephony';

const MARKS: Record<OfferMarkId, { label: string; Icon: typeof Phone; iconClass: string; hoverIconClass: string; gradient: string; hoverTextClass: string }> = {
  telephony: {
    label: 'TELEPHONY',
    Icon: Phone,
    iconClass: 'text-[#E01070]',
    hoverIconClass: 'group-hover:text-[#E01070]',
    gradient: 'from-[#f59e0b] via-[#ec4899] to-[#a855f7]',
    hoverTextClass: 'group-hover:text-transparent',
  },
  taas: {
    label: 'TAAS',
    Icon: Layers,
    iconClass: 'text-[#E5483A]',
    hoverIconClass: 'group-hover:text-[#E5483A]',
    gradient: 'from-[#ef4444] via-[#f97316] to-[#f59e0b]',
    hoverTextClass: 'group-hover:text-transparent',
  },
};

interface OfferMarkProps {
  offer: OfferMarkId;
  /** Offre courante : pastille blanche pleine ; sinon verre dépoli translucide, à cliquer. */
  active?: boolean;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
  'data-testid'?: string;
}

/**
 * Marque d'une offre dans le bandeau : même gabarit pour TAAS et TELEPHONY (icône + nom en lettres espacées, dégradé propre à l'offre).
 * Le nom de l'offre n'est pas traduit : c'est une marque.
 */
export function OfferMark({ offer, active = false, href, onClick, className = '', ...rest }: OfferMarkProps) {
  const { label, Icon, iconClass, hoverIconClass, gradient, hoverTextClass } = MARKS[offer];
  const base = 'group inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] md:px-5 md:py-2.5 md:text-sm font-black tracking-[0.18em] transition-all duration-300';
  const look = active
    ? 'bg-white shadow-[0_6px_20px_-6px_rgba(0,0,0,0.45)] ring-1 ring-white/70'
    : 'bg-white/[0.14] ring-1 ring-white/35 backdrop-blur-md hover:bg-white hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)]';
  const content = (
    <>
      <Icon className={`h-3.5 w-3.5 md:h-4 md:w-4 ${active ? iconClass : `text-white ${hoverIconClass}`}`} aria-hidden="true" />
      <span className={`bg-gradient-to-r ${gradient} bg-clip-text ${active ? 'text-transparent' : `text-white ${hoverTextClass}`}`}>{label}</span>
    </>
  );
  return (
    <a href={href ?? '#'} onClick={onClick} aria-current={active ? 'page' : undefined} className={`${base} ${look} ${className}`} {...rest}>
      {content}
    </a>
  );
}
