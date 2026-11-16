import React from 'react';
import { ArrowRight, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { isRoleComingSoon } from '../../config/offers';
import { withLangPrefix, normalizeSiteLang } from '../../lib/langRoutes';

interface PostGigCtaProps {
  /** Aspect quand « Publier un gig » est « bientôt disponible » (production). */
  soonClassName: string;
  /** Aspect quand il est ouvert (recette, VITE_RECETTE_UNLOCK_OFFERS=true). */
  openClassName: string;
  'data-testid': string;
}

/**
 * « Publier un gig » (TAAS Company). Production : pastille « Bientôt disponible », non cliquable. Recette : lien réel
 * vers l'inscription entreprise (même écran que le choix « Company » de /auth/choice). Une seule règle : isRoleComingSoon.
 */
export function PostGigCta({ soonClassName, openClassName, 'data-testid': testId }: PostGigCtaProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const label = t('choicePage.companyTitle', 'Post a Gig');
  if (isRoleComingSoon('company')) {
    return (
      <span className={soonClassName} aria-disabled="true" data-testid={testId}>
        <Lock className="h-4 w-4" aria-hidden="true" />
        {label} · {t('choicePage.comingSoon', 'Coming soon')}
      </span>
    );
  }
  const href = withLangPrefix('/auth/register-company', normalizeSiteLang(i18n.language));
  return (
    <a
      href={href}
      className={openClassName}
      data-testid={testId}
      onClick={(e) => {
        e.preventDefault();
        localStorage.setItem('pendingUserType', 'company');
        navigate('/auth/register-company', { state: { returnTo: '/auth/choice' } });
      }}
    >
      {label}
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </a>
  );
}
