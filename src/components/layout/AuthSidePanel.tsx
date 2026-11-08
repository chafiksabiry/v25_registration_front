import React from 'react';
import { RepsIncomeVisual } from '../Taas/RepsIncomeVisual';
import { ResultFlowVisual } from '../Taas/ResultFlowVisual';
import { BrandText, type BrandKind } from '../BrandText';

/**
 * Panneau de gauche des écrans de connexion et d'inscription : une illustration animée propre au parcours
 * (revenu pour un REPS, résultat payé pour une entreprise, mascotte sinon) puis le texte de marque correspondant.
 */
export function AuthSidePanel({ kind }: { kind: BrandKind }) {
  return (
    <div className="relative z-10 flex h-full flex-col justify-center text-center lg:text-left">
      <div className="mb-7">
        {kind === 'rep' ? (
          <RepsIncomeVisual compact />
        ) : kind === 'company' ? (
          <ResultFlowVisual compact />
        ) : (
          <div className="relative mx-auto w-full max-w-[150px] animate-float">
            <img src={`${import.meta.env.BASE_URL || '/'}mascotte.png`} alt="HARX Mascotte" className="h-auto w-full object-contain drop-shadow-[0_10px_25px_rgba(255,77,77,0.35)]" loading="eager" />
            <div className="absolute -inset-3 -z-10 rounded-full bg-gradient-to-r from-harx-500/30 to-harx-alt-500/30 blur-xl animate-pulse-slow" />
          </div>
        )}
      </div>
      <BrandText kind={kind} />
    </div>
  );
}
