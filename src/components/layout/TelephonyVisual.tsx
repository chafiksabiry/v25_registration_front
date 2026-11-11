import React from 'react';
import { Bot, PhoneCall, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/** Illustration animée de Téléphonie : un appel entrant, la mascotte HARX qui décroche, l'IA qui assiste. Pure illustration, sans donnée réelle. */
export function TelephonyVisual() {
  const { t } = useTranslation();
  const bars = [0.35, 0.7, 0.5, 0.95, 0.6, 0.85, 0.4, 0.75, 0.55, 0.9, 0.45, 0.65];
  return (
    <div className="relative mx-auto w-full max-w-[17rem]" aria-hidden="true">
      <div className="pointer-events-none absolute -inset-8 rounded-full bg-gradient-to-br from-rose-500/30 via-fuchsia-500/20 to-violet-500/25 blur-3xl" />
      <div className="taas-float relative rounded-[1.5rem] border border-white/20 bg-gradient-to-b from-white/[0.14] to-white/[0.05] p-4 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-xs font-black text-white">
            <span className="auth-ring inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400 text-slate-900"><PhoneCall className="h-3.5 w-3.5" /></span>
            {t('telephonyVisual.incoming', 'Incoming call')}
          </p>
          <span className="rounded-full border border-white/25 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white/65">{t('taasVisual.illustration', 'Illustration')}</span>
        </div>
        <div className="mt-2 flex justify-center">
          <img src={`${import.meta.env.BASE_URL || '/'}mascotte.png`} alt="" className="h-24 w-auto object-contain drop-shadow-[0_10px_25px_rgba(236,72,153,0.5)]" />
        </div>
        <div className="mt-2 flex h-9 items-center justify-center gap-1">
          {bars.map((h, i) => <span key={i} className="auth-wave-bar block w-1.5 rounded-full bg-gradient-to-t from-[#ff4d4d] to-[#ec4899]" style={{ height: `${h * 100}%`, animationDelay: `${i * 90}ms` }} />)}
        </div>
        <div className="mt-3 flex items-center justify-between rounded-xl bg-white/10 px-3 py-2 text-[11px] font-bold text-white">
          <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-amber-300" />{t('telephonyVisual.country', 'A number from your country')}</span>
          <span className="flex items-center gap-1 rounded-md bg-violet-400/25 px-1.5 py-0.5 text-violet-200"><Bot className="h-3 w-3" />IA</span>
        </div>
      </div>
    </div>
  );
}
