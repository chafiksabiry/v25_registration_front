import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

/** Numéro WhatsApp Business de l'agent IA (chiffres uniquement, avec indicatif pays, sans « + »). */
const raw = import.meta.env.VITE_WHATSAPP_AGENT_NUMBER;
const WHATSAPP_NUMBER = typeof raw === 'string' ? raw.replace(/\D/g, '') : '';

/** Bouton flottant : ouvre une conversation WhatsApp avec l'agent IA HARX. Masqué sans numéro configuré et dans l'admin. */
export default function WhatsAppButton() {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  if (!WHATSAPP_NUMBER || pathname.includes('/admin')) return null;

  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t('whatsappButton.prefill'))}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('whatsappButton.aria')}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-[#1ebe5a] focus:outline-none focus:ring-2 focus:ring-white/70"
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
        <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35zM12.05 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88a9.82 9.82 0 0 1 6.99 2.9 9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.89 9.88zM20.52 3.45A11.8 11.8 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.31-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.16-3.43-8.46z" />
      </svg>
      <span>{t('whatsappButton.label')}</span>
    </a>
  );
}
