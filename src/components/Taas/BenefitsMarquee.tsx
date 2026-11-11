import React from 'react';
import { Clock, Globe, Laptop, PhoneCall, Target, Bot, Users2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/** Bandeau défilant REPS : les atouts et les trois composantes de rémunération, repris des libellés existants. */
export function BenefitsMarquee() {
  const { t } = useTranslation();
  const items = [
    { Icon: PhoneCall, label: t('taasPages.payFixed', 'Fixed amount per argued call') },
    { Icon: Clock, label: t('forReps.benefit1Title', 'Flexible Work') },
    { Icon: Bot, label: t('taasPages.payCommission', 'Commission per transaction') },
    { Icon: Globe, label: t('forReps.benefit3Title', 'Global Network') },
    { Icon: Target, label: t('taasPages.payBonus', 'Performance bonus') },
    { Icon: Users2, label: t('forReps.benefit2Title', 'Growth Opportunities') },
    { Icon: Laptop, label: t('forReps.benefit4Title', 'Advanced Tools') },
  ];
  const row = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-white/[0.03] py-4" aria-hidden="true" data-testid="reps-marquee">
      <div className="taas-marquee gap-4">
        {row.map(({ Icon, label }, i) => (
          <span key={i} className="mr-4 inline-flex shrink-0 items-center gap-2.5 rounded-full border border-white/12 bg-white/[0.05] px-5 py-2 text-sm font-bold text-white/85">
            <Icon className="h-4 w-4 text-fuchsia-300" />
            {label}
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#070711] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#070711] to-transparent" />
    </div>
  );
}
