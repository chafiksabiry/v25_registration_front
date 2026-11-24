import React from 'react';
import { HelpCircle, Mail, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SUPPORT_EMAIL, supportMailto, supportMessage, supportWhatsAppUrl } from '../lib/supportHelp';

/** Encadré « Besoin d'aide ? » sous un message d'erreur de harx.ai (maquette validée le 24/11/2026). Code seul : la personne n'est pas connectée. */
export default function SupportHelp({ code }: { code: string }) {
  const { t } = useTranslation();
  const message = supportMessage(code, { hello: t('support.hello', 'Bonjour, j’ai besoin d’aide sur HARX.'), codeLabel: t('support.errorCode', 'Code d’erreur') });
  return (
    <div className="mt-4 rounded-2xl border border-rose-200/30 bg-slate-950/50 px-4 py-3 text-start" role="region" aria-label={t('support.title', 'Besoin d’aide ?')} data-testid="support-help" data-code={code}>
      <p className="flex items-center gap-2 text-sm font-bold text-white">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 via-pink-600 to-rose-600 text-white"><HelpCircle className="h-4 w-4" aria-hidden="true" /></span>
        {t('support.title', 'Besoin d’aide ?')}
      </p>
      <p className="mt-1 text-sm text-rose-100/80">{t('support.intro', 'Écrivez-nous : le code ci-dessous est déjà dans le message.')}</p>
      <a href={supportWhatsAppUrl(message)} target="_blank" rel="noopener noreferrer" className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-1.5 whitespace-normal py-2 text-center sm:whitespace-nowrap sm:py-0 rounded-xl bg-gradient-to-r from-orange-500 via-pink-600 to-rose-600 px-1 text-[13px] font-bold text-white sm:gap-2 sm:px-3 sm:text-sm" data-testid="support-help-whatsapp">
        <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" /><span>{t('support.whatsapp', 'Contacter le support sur WhatsApp')}</span>
      </a>
      <a href={supportMailto(code, message)} className="mt-1 flex min-h-[44px] items-center justify-center gap-2 text-sm font-bold text-white underline underline-offset-2" data-testid="support-help-email">
        <Mail className="h-4 w-4 shrink-0" aria-hidden="true" /> {t('support.writeTo', 'Écrire à')} {SUPPORT_EMAIL}
      </a>
      <p className="text-xs text-rose-100/60" data-testid="support-help-ref">{t('support.code', 'Code')} : <span className="font-mono font-bold text-rose-50" dir="ltr">{code}</span></p>
    </div>
  );
}
