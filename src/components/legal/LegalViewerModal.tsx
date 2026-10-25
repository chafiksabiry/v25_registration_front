import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { signupLanguage, signupLegalPack, type SignupAudience, type SignupLanguage } from '../../content/legal/pack';
import { LegalPackView } from './LegalPackView';

const PART_PREFIX = 'legal-part-';

/** The viewer follows its own language switch, not the page language. */
const LABELS: Record<SignupLanguage, { title: string; close: string; language: string; sections: string }> = {
  fr: { title: 'Conditions et politique de confidentialité', close: 'Fermer', language: 'Langue', sections: 'Sections' },
  en: { title: 'Terms and privacy policy', close: 'Close', language: 'Language', sections: 'Sections' },
};

/**
 * Read-only viewer for the sign-up legal documents: one scrollable document with a section
 * menu and a French/English switch. Reading is optional; acceptance happens on the form.
 */
export function LegalViewerModal({
  open,
  audience,
  initialPart,
  onClose,
}: {
  open: boolean;
  audience: SignupAudience;
  /** Index of the part to scroll to when opening (0 = general terms, 1 = role terms, 2 = privacy). */
  initialPart: number;
  onClose: () => void;
}) {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState<SignupLanguage>(signupLanguage(i18n.language));
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setLang(signupLanguage(i18n.language));
  }, [open, i18n.language]);

  const pack = signupLegalPack(lang, audience);
  const labels = LABELS[lang];

  const goTo = (index: number) => {
    const el = scrollerRef.current?.querySelector<HTMLElement>(`#${PART_PREFIX}${index}`);
    if (el && scrollerRef.current) scrollerRef.current.scrollTo({ top: el.offsetTop - 72, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const frame = requestAnimationFrame(() => {
      const scroller = scrollerRef.current;
      const el = scroller?.querySelector<HTMLElement>(`#${PART_PREFIX}${initialPart}`);
      if (scroller) scroller.scrollTop = initialPart > 0 && el ? Math.max(0, el.offsetTop - 72) : 0;
    });
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, initialPart, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6" role="presentation">
      <button
        type="button"
        aria-label={labels.close}
        className="absolute inset-0 bg-slate-950/70"
        onClick={onClose}
      />
      <div role="dialog" aria-modal="true" aria-labelledby="legal-viewer-title" className="relative flex max-h-[min(880px,92vh)] w-full max-w-3xl flex-col overflow-hidden rounded-[22px] border border-[#fecdd3] bg-white">
        <div className="flex flex-wrap items-center gap-2 border-b border-[#e5e7eb] bg-white px-4 py-3 sm:px-6">
          <h2 id="legal-viewer-title" className="mr-auto text-base font-semibold text-[#0f172a]">
            {labels.title}
          </h2>
          <div className="flex overflow-hidden rounded-lg border border-[#cbd5e1] text-xs font-semibold" role="group" aria-label={labels.language}>
            {(['fr', 'en'] as const).map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={lang === l}
                onClick={() => setLang(l)}
                className={`px-3 py-1.5 ${lang === l ? 'bg-[#e11d48] text-white' : 'bg-white text-[#475569] hover:bg-[#f1f5f9]'}`}
              >
                {l === 'fr' ? 'Français' : 'English'}
              </button>
            ))}
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-[#e11d48] hover:bg-[#fff1f2]">
            <X className="h-4 w-4" />
            <span className="sr-only">{labels.close}</span>
          </button>
          <nav className="flex w-full flex-wrap gap-1.5" aria-label={labels.sections}>
            {pack.parts.map((part, index) => (
              <button
                key={part.title}
                type="button"
                onClick={() => goTo(index)}
                className="rounded-full border border-[#e5e7eb] px-3 py-1 text-xs font-medium text-[#334155] hover:border-[#e11d48] hover:text-[#e11d48]"
              >
                {part.title}
              </button>
            ))}
          </nav>
        </div>
        <div ref={scrollerRef} className="relative overflow-y-auto overscroll-contain [overflow-anchor:none]">
          <LegalPackView pack={pack} language={lang} partIdPrefix={PART_PREFIX} />
        </div>
        <div className="border-t border-[#e5e7eb] bg-white px-4 py-3 text-right sm:px-6">
          <button type="button" onClick={onClose} className="rounded-xl bg-[#e11d48] px-5 py-2 text-sm font-semibold text-white hover:bg-[#be123c]">
            {labels.close}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
