import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '../LandingPage/Logo';
import { LanguageSelector } from '../LanguageSelector';
import { Footer } from '../LandingPage/Footer';
import { getLegalDocument, LEGAL_DOC_IDS, type LegalDocId } from '../../content/legal';
import { usePageTitle } from '../../lib/tracking/usePageTitle';

const HARX_NAV_GRADIENT = 'linear-gradient(90deg, #E51A4C 0%, #E01070 55%, #E6188D 100%)';

function isLegalDocId(value: string | undefined): value is LegalDocId {
  return !!value && (LEGAL_DOC_IDS as string[]).includes(value);
}

function docIdFromPath(pathname: string): LegalDocId {
  const segment = pathname.replace(/\/+$/, '').split('/').filter(Boolean).pop();
  return isLegalDocId(segment) ? segment : 'privacy';
}

export function LegalPage() {
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation();
  const id = docIdFromPath(pathname);
  const doc = getLegalDocument(id, i18n.language);

  usePageTitle(`${doc.title} | HARX`);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <header
        className="sticky top-0 z-40 shadow-lg"
        style={{ background: HARX_NAV_GRADIENT }}
      >
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" aria-label="HARX home">
            <Logo className="h-10 w-auto" />
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-white/95 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              {t('legal.backHome', 'Back to home')}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <article className="max-w-4xl mx-auto px-4 py-10 md:py-14">
          <p className="text-sm text-gray-400 mb-3">
            {t('legal.lastUpdated', 'Last updated')}: {doc.lastUpdated}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{doc.title}</h1>
          <p className="text-gray-300 text-lg leading-relaxed mb-10">{doc.intro}</p>

          <nav
            className="flex flex-wrap gap-2 mb-10"
            aria-label={t('legal.otherPolicies', 'Other policies')}
          >
            {LEGAL_DOC_IDS.map((otherId) => {
              const other = getLegalDocument(otherId, i18n.language);
              const active = otherId === id;
              return (
                <Link
                  key={otherId}
                  to={`/${otherId}`}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    active
                      ? 'bg-harx-500 border-harx-500 text-white'
                      : 'border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white'
                  }`}
                >
                  {other.title}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-8">
            {doc.sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl font-semibold text-white mb-3">{section.title}</h2>
                <div className="space-y-3">
                  {section.paragraphs.map((p, idx) => (
                    <p key={idx} className="text-gray-300 leading-relaxed">
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <p className="mt-12 pt-8 border-t border-gray-800 text-gray-400 text-sm leading-relaxed">
            {doc.contactNote}
          </p>
          <p className="mt-4 text-xs text-gray-500">
            {t(
              'legal.disclaimer',
              'This page is provided for informational purposes and does not constitute legal advice. Please consult counsel for your specific situation.'
            )}
          </p>
        </article>
      </main>

      <Footer />
    </div>
  );
}

export default LegalPage;
