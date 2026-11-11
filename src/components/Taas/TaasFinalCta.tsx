import React from 'react';
import { ArrowRight, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { isRoleComingSoon } from '../../config/offers';

const bookDemo = () => {
  window.open('https://harxtechnologies.zohobookings.com/#/WebsiteBooking', '_blank');
};

/** Appel final unique de chaque page : COMPANY (démonstration ; « Publier un gig » bientôt) ou REPS (rejoindre HARX). */
export function TaasFinalCta({ kind, onJoin }: { kind: 'company' | 'reps'; onJoin?: () => void }) {
  const { t } = useTranslation();
  const company = kind === 'company';
  return (
    <section className="relative overflow-hidden bg-[#070711] px-4 py-20 text-white" data-testid={`final-cta-${kind}`}>
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-rose-600/25 blur-[110px]" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-fuchsia-600/25 blur-[110px]" />
      </div>
      <div className="relative mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-harx-500 to-harx-alt-500 p-10 text-center shadow-2xl shadow-harx-500/30 md:p-14">
        <h2 className="text-3xl font-black md:text-4xl">{company ? t('taasPages.finalCompanyTitle', 'Ready to pay for results?') : t('taasWidgets.joinTitle', 'Ready to take your first mission?')}</h2>
        <p className="mx-auto mt-3 max-w-xl text-base font-medium text-white/90">{company ? t('taasPages.finalCompanyText', 'Book a demo: we show you how to define a result and its price.') : t('taasWidgets.joinText', 'Create your profile and apply to the missions that suit you.')}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {company ? (
            <>
              <button type="button" onClick={bookDemo} className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-7 text-sm font-bold text-harx-700 transition-transform hover:scale-[1.03]">
                {t('hero.bookDemo', 'Book a Demo')}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <span className="inline-flex h-12 cursor-not-allowed items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-6 text-sm font-bold text-white/90" aria-disabled={isRoleComingSoon('company') || undefined} data-testid="final-company-soon">
                <Lock className="h-4 w-4" aria-hidden="true" />
                {t('choicePage.companyTitle', 'Post a Gig')} · {t('choicePage.comingSoon', 'Coming soon')}
              </span>
            </>
          ) : (
            <button type="button" onClick={onJoin} data-testid="reps-join-cta" className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-7 text-sm font-bold text-harx-700 transition-transform hover:scale-[1.03]">
              {t('taasWidgets.joinCta', 'Join HARX')}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
