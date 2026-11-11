import React from 'react';
import { CheckCircle2, ClipboardCheck, MessageSquareText, PhoneCall, Search, Smile, Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/** Bandeau défilant des types de résultats (mêmes intitulés que les cas d'usage plus bas). */
export function UseCaseMarquee() {
  const { t } = useTranslation();
  const items = [
    { Icon: PhoneCall, label: t('forClients.uc1Title', 'Welcome Calls') },
    { Icon: ClipboardCheck, label: t('forClients.uc2Title', 'Confirmation & Follow-up') },
    { Icon: Smile, label: t('forClients.uc3Title', 'Satisfaction Surveys') },
    { Icon: Search, label: t('forClients.uc4Title', 'Lead Qualification') },
    { Icon: MessageSquareText, label: t('forClients.uc5Title', 'Information Requests') },
    { Icon: Video, label: t('forClients.uc6Title', 'Product Demonstrations') },
  ];
  const row = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-white/[0.03] py-4" aria-hidden="true" data-testid="usecase-marquee">
      <div className="taas-marquee gap-4">
        {row.map(({ Icon, label }, i) => (
          <span key={i} className="mr-4 inline-flex shrink-0 items-center gap-2.5 rounded-full border border-white/12 bg-white/[0.05] px-5 py-2 text-sm font-bold text-white/85">
            <Icon className="h-4 w-4 text-harx-300" />
            {label}
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#070711] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#070711] to-transparent" />
    </div>
  );
}
