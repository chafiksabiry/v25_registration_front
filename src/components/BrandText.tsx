import React from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/** Texte du panneau de gauche des écrans de connexion et d'inscription. Propre au Call Centre quand le visiteur vient de ce produit. */
export function BrandText({ callCentre = false }: { callCentre?: boolean }) {
  const { t } = useTranslation();
  if (!callCentre) {
    return (
      <>
        <h1 className="text-3xl font-extrabold leading-tight mb-4">
          {t('signIn.brandTitle1', 'Start Your')} <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-harx-400 to-harx-alt-400">{t('signIn.brandTitle2', 'Journey Today')}</span>
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          {t('signIn.brandDesc', 'Access premium AI tools, real-time customer support analytics, and join a global community of customer service professionals.')}
        </p>
      </>
    );
  }
  const points = ['point1', 'point2', 'point3', 'point4'];
  return (
    <>
      <h1 className="text-3xl font-extrabold leading-tight mb-4">
        {t('callcentreBrand.title1', 'Your call centre,')} <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-harx-400 to-harx-alt-400">{t('callcentreBrand.title2', 'up and running in 10 minutes')}</span>
      </h1>
      <p className="text-slate-400 text-sm leading-relaxed mb-5">{t('callcentreBrand.desc')}</p>
      <ul className="space-y-2.5 text-left">
        {points.map((k) => (
          <li key={k} className="flex items-start gap-2.5 text-sm text-slate-200">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-harx-400" />
            <span>{t(`callcentreBrand.${k}`)}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
