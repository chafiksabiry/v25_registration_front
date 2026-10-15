import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getLegalDocument, type LegalDocId } from '../../content/legal';

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
        className="absolute inset-0 bg-slate-950/75"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-scroll-title"
        className="relative flex max-h-[min(860px,90vh)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">
              {t('register.legalScrollHint', 'Scroll to the bottom to confirm you have read this document.')}
            </p>
            <h2 id="legal-scroll-title" className="mt-1 text-lg font-semibold text-white">
              {doc.title}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {t('legal.lastUpdated', 'Last updated')}: {doc.lastUpdated}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">{t('register.legalClose', 'Close')}</span>
          </button>
        </div>

        <div
          ref={scrollerRef}
          onScroll={onScroll}
          className="min-h-0 flex-1 overflow-y-auto px-5 py-5"
        >
          <p className="mb-6 text-sm leading-relaxed text-slate-300">{doc.intro}</p>
          <div className="space-y-6">
            {doc.sections.map((section) => (
              <section key={section.title}>
                <h3 className="mb-2 text-sm font-semibold text-white">{section.title}</h3>
                <div className="space-y-3">
                  {section.paragraphs.map((paragraph, index) => (
                    <p key={index} className="text-sm leading-relaxed text-slate-300">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
          <p className="mt-8 border-t border-white/10 pt-4 text-xs leading-relaxed text-slate-400">
            {doc.contactNote}
          </p>
        </div>

        <div className="border-t border-white/10 px-5 py-3 text-xs">
          {reached ? (
            <p className="font-medium text-emerald-300">
              {t('register.legalReached', 'You reached the end of this document.')}
            </p>
          ) : (
            <p className="text-slate-400">
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
