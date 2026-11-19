import React from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Les temps de l'ouverture de Téléphonie : le nom, le compte HARX, la mise en route guidée. `current` : 0, 1 ou 2.
 * Nomad Solo (`solo`) ne demande pas de nom avant le compte : deux temps seulement (compte HARX, mise en route).
 */
export function JourneyTimeline({ current, solo = false }: { current: 0 | 1 | 2; solo?: boolean }) {
  const { t } = useTranslation();
  const all = [t('callcentreJourney.name', 'Name'), t('callcentreJourney.account', 'HARX account'), t('callcentreJourney.setup', 'Setup')];
  const steps = solo ? all.slice(1) : all;
  const active = solo ? Math.max(0, current - 1) : current;
  return (
    <ol className="mt-6 flex items-center gap-2" data-testid="journey-timeline">
      {steps.map((label, i) => (
        <li key={label} className="flex flex-1 items-center gap-2 last:flex-none">
          <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${i < active ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-900' : i === active ? 'bg-gradient-to-br from-[#ff4d4d] to-[#ec4899] text-white shadow-[0_0_0_5px_rgba(255,77,109,0.22)]' : 'border border-white/20 bg-white/5 text-white/50'}`} aria-current={i === active ? 'step' : undefined}>
            {i < active ? <Check className="h-3.5 w-3.5" /> : i + 1}
          </span>
          <span className={`whitespace-nowrap text-xs font-bold ${i === active ? 'text-white' : 'text-white/55'}`}>{label}</span>
          {i < steps.length - 1 ? <span className="mx-1 h-px flex-1 bg-white/15" aria-hidden="true" /> : null}
        </li>
      ))}
    </ol>
  );
}
