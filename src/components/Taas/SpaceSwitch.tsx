import React from 'react';
import { Building2, Headphones } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TAAS_COMPANY, TAAS_REPS } from '../../lib/taasPaths';

/**
 * Commutateur des deux espaces de TAAS, posé dans la partie sombre de la page (à la place du repère COMPANY / REPS),
 * jamais dans le bandeau rose : COMPANY (publier un gig) et REPS (trouver des gigs).
 */
export function SpaceSwitch({ current }: { current: 'company' | 'reps' }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const items = [
    { id: 'company' as const, path: TAAS_COMPANY, Icon: Building2, tag: t('choicePage.companyTag', 'COMPANY'), sub: t('choicePage.companyTitle', 'Post a Gig') },
    { id: 'reps' as const, path: TAAS_REPS, Icon: Headphones, tag: t('choicePage.repTag', 'REPS'), sub: t('choicePage.repTitle', 'Find Gigs') },
  ];
  return (
    <div className="taas-switch" role="tablist" aria-label="TAAS" data-testid="space-switch">
      <span className="taas-switch__glider" data-pos={current} aria-hidden="true" />
      {items.map(({ id, path, Icon, tag, sub }) => (
        <a
          key={id}
          href={path}
          role="tab"
          aria-selected={current === id}
          data-testid={`space-${id}`}
          onClick={(e) => {
            e.preventDefault();
            if (current !== id) navigate(path);
          }}
          className="taas-switch__item"
        >
          <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span className="flex flex-col text-left leading-tight">
            <span className="text-sm font-black tracking-[0.16em]">{tag}</span>
            <span className="text-[11px] font-semibold opacity-80">{sub}</span>
          </span>
        </a>
      ))}
    </div>
  );
}
