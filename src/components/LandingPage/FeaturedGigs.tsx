import React from 'react';
import { ArrowRight, Briefcase, Building2, Headphones, PhoneCall, ShoppingBag, Stethoscope, Wallet, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EXAMPLE_GIGS, type ExampleGigIcon } from '../../config/exampleGigs';
import { normalizeSiteLang } from '../../lib/langRoutes';

const ICONS: Record<ExampleGigIcon, LucideIcon> = {
  Sales: PhoneCall,
  Reception: Headphones,
  Support: ShoppingBag,
  Healthcare: Stethoscope,
  RealEstate: Building2,
  Finance: Wallet,
};

interface FeaturedGigsProps {
  /** Rejoindre HARX (inscription REPS) : le bouton de chaque carte y mène. */
  onJoin: () => void;
}

/** Missions types : contenu marketing (voir config/exampleGigs.ts), indépendant des missions réelles. */
export function FeaturedGigs({ onJoin }: FeaturedGigsProps) {
  const { t, i18n } = useTranslation();
  const lang = normalizeSiteLang(i18n.language) === 'fr' ? 'fr' : 'en';
  const money = (n: number) => `€${n.toFixed(Number.isInteger(n) ? 0 : 2)}`;

  return (
    <section className="py-24 relative overflow-hidden bg-transparent" id="featured-gigs">
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
        <div className="w-96 h-96 bg-harx-500/10 rounded-full blur-3xl animate-pulse-slow" />
      </div>
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3">
        <div className="w-96 h-96 bg-harx-alt-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            {t('featuredGigs.title1', 'Discover')} <span className="bg-clip-text text-transparent bg-gradient-harx">{t('featuredGigs.title2', 'example missions')}</span>
          </h2>
          <p className="text-xl text-slate-350 max-w-2xl mx-auto leading-relaxed">
            {t('featuredGigs.desc', 'Browse the kinds of missions you can take on and start earning by representing companies.')}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3" data-testid="example-gigs">
          {EXAMPLE_GIGS.map((gig) => {
            const Icon = ICONS[gig.icon] ?? Briefcase;
            const text = gig[lang];
            const c = gig.commission;
            const chips: Array<{ value: string; label: string; tone: string }> = [
              { value: money(c.perCall), label: t('featuredGigs.perCall', 'fixed / argued call'), tone: 'bg-harx-500/10 border-harx-500/30 text-harx-300' },
              { value: money(c.perTransaction), label: t('featuredGigs.perSuccess', 'commission / transaction'), tone: 'bg-harx-alt-500/10 border-harx-alt-500/30 text-harx-alt-300' },
              { value: money(c.bonus), label: t('featuredGigs.bonus', 'performance bonus'), tone: 'bg-purple-500/10 border-purple-500/30 text-purple-300' },
            ];
            return (
              <div key={gig.id} className="group relative glass-card-premium rounded-2xl p-8 hover:border-harx-500/30 hover:-translate-y-1 transition-all duration-500 flex flex-col" data-testid={`example-gig-${gig.id}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-harx-500/5 to-harx-alt-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="relative z-10 flex-grow">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-gradient-harx rounded-xl flex items-center justify-center shadow-lg shadow-harx-500/10 group-hover:scale-110 transition-transform duration-500">
                      <Icon className="w-6 h-6 text-white" aria-hidden="true" />
                    </div>
                    <span className="inline-block px-3 py-1 bg-white/[0.04] border border-white/10 text-slate-200 text-xs font-semibold rounded-full">{text.category}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">{text.title}</h3>
                  <p className="text-slate-350 text-sm leading-relaxed mb-6">{text.description}</p>
                </div>
                <div className="mt-auto relative z-10 pt-6 border-t border-white/10">
                  <p className="text-xs text-slate-400 font-medium mb-3">{t('featuredGigs.commissions', 'Commissions')}</p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {chips.map((chip) => (
                      <div key={chip.label} className={`inline-flex flex-col gap-0.5 px-3 py-1.5 rounded-lg border ${chip.tone}`}>
                        <span className="text-sm font-black text-white">{chip.value}</span>
                        <span className="text-[9px] font-bold uppercase tracking-wide">{chip.label}</span>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={onJoin} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-gradient-harx">
                    {t('featuredGigs.apply', 'Join to apply')}
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-sm font-medium text-slate-400">{t('featuredGigs.examplesNote', 'Example missions. Amounts shown are what the professional earns.')}</p>
      </div>
    </section>
  );
}
