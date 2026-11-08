import React from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/** Les trois temps de l'ouverture de Téléphonie : le nom, le compte HARX, la mise en route guidée. `current` : 0, 1 ou 2. */
export function JourneyTimeline({ current }: { current: 0 | 1 | 2 }) {
  const { t } = useTranslation();
  const steps = [t('callcentreJourney.name', 'Name'), t('callcentreJourney.account', 'HARX account'), t('callcentreJourney.setup', 'Setup')];
  return (
    <ol className="mt-6 flex items-center gap-2" data-testid="journey-timeline">
      {steps.map((label, i) => (
        <li key={label} className="flex flex-1 items-center gap-2 last:flex-none">
          <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${i < current ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-900' : i === current ? 'bg-gradient-to-br from-[#ff4d4d] to-[#ec4899] text-white shadow-[0_0_0_5px_rgba(255,77,109,0.22)]' : 'border border-white/20 bg-white/5 text-white/50'}`} aria-current={i === current ? 'step' : undefined}>
            {i < current ? <Check className="h-3.5 w-3.5" /> : i + 1}
          </span>
          <span className={`whitespace-nowrap text-xs font-bold ${i === current ? 'text-white' : 'text-white/55'}`}>{label}</span>
          {i < steps.length - 1 ? <span className="mx-1 h-px flex-1 bg-white/15" aria-hidden="true" /> : null}
        </li>
      ))}
    </ol>
  );
}
