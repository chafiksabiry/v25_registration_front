import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getLegalDocument, type LegalDocId } from '../../content/legal';
import logoPink from '../LandingPage/assets/logo-pink.png';

export type SignupLegalDocId = Extract<LegalDocId, 'terms' | 'privacy'>;

export function bothSignupDocsRead(readIds: SignupLegalDocId[]): boolean {
  return readIds.includes('terms') && readIds.includes('privacy');
}

/**
 * Popup used by company and rep signup. The document stays in a scroll area;
 * reaching the bottom marks it as read.
 */
export function LegalScrollModal({
  docId,
  onClose,
  onReachedEnd,
}: {
  docId: SignupLegalDocId | null;
  onClose: () => void;
  onReachedEnd: (id: SignupLegalDocId) => void;
}) {
  const { t, i18n } = useTranslation();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const reachedRef = useRef(false);
  const [reached, setReached] = useState(false);

  const doc = docId ? getLegalDocument(docId, i18n.language) : null;

  const markReached = () => {
    if (!docId || reachedRef.current) return;
    reachedRef.current = true;
    setReached(true);
    onReachedEnd(docId);
  };

  useEffect(() => {
    if (!docId) return undefined;
    reachedRef.current = false;
    setReached(false);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);

    const frame = requestAnimationFrame(() => {
      const el = scrollerRef.current;
      if (el) el.scrollTop = 0;
      if (el && el.scrollHeight <= el.clientHeight + 8) markReached();
    });

    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [docId, i18n.language]);

  const onScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 48) markReached();
  };

  if (!docId || !doc) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        aria-label={t('register.legalClose', 'Close')}
        className="absolute inset-0 bg-[#fff1f2]/80"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-scroll-title"
        className="relative flex max-h-[min(860px,90vh)] w-full max-w-2xl flex-col overflow-hidden rounded-[22px] border border-[#fecdd3] bg-white"
      >
        <div className="relative shrink-0 bg-[#ec4899]">
          <img src={logoPink} alt="HARX" className="block h-auto w-full" />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-[#e11d48] hover:bg-white"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">{t('register.legalClose', 'Close')}</span>
          </button>
        </div>
        <div className="border-b border-[#ffe4e6] bg-white px-7 py-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#e11d48]">
            {t('register.legalScrollHint', 'Scroll to the bottom to confirm you have read this document.')}
          </p>
          <h2 id="legal-scroll-title" className="mt-2 text-2xl font-semibold leading-tight text-[#0f172a]">
            {doc.title}
          </h2>
          <p className="mt-2 text-sm text-[#64748b]">
            {t('legal.lastUpdated', 'Last updated')}: {doc.lastUpdated}
          </p>
        </div>

        <div
          ref={scrollerRef}
          onScroll={onScroll}
          className="min-h-0 flex-1 overflow-y-auto bg-white px-7 py-6"
        >
          <p className="mb-6 text-[15px] leading-relaxed text-[#64748b]">{doc.intro}</p>
          <div className="space-y-4">
            {doc.sections.map((section) => (
              <section key={section.title} className="rounded-2xl border border-[#ffe4e6] bg-[#fff7f8] px-5 py-4">
                <h3 className="mb-2 text-base font-semibold text-[#0f172a]">{section.title}</h3>
                <div className="space-y-3">
                  {section.paragraphs.map((paragraph, index) => (
                    <p key={index} className="text-sm leading-relaxed text-[#475569]">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
          <p className="mt-6 text-xs leading-relaxed text-[#9f1239]">
            {doc.contactNote}
          </p>
        </div>

        <div className="border-t border-[#ffe4e6] bg-[#fff7f8] px-7 py-4 text-sm">
          {reached ? (
            <p className="font-semibold text-[#047857]">
              {t('register.legalReached', 'You reached the end of this document.')}
            </p>
          ) : (
            <p className="text-[#9f1239]">
              {t(
                'register.legalDocHint',
                'Scroll this document to the bottom to mark it as read.'
              )}
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
