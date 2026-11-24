import { describe, expect, it } from 'vitest';
import fr from '../locales/fr/translation.json';
import en from '../locales/en/translation.json';
import es from '../locales/es/translation.json';
import ar from '../locales/ar/translation.json';
import { recoveryErrorCode, supportMailto, supportMessage, supportWhatsAppNumber, supportWhatsAppUrl } from './supportHelp';

const FR = { hello: 'Bonjour, j’ai besoin d’aide sur HARX.', codeLabel: 'Code d’erreur' };

describe('« Besoin d’aide ? » sur harx.ai (mot de passe oublié)', () => {
  it('numéro WhatsApp : même source que le bouton vert (VITE_WHATSAPP_SUPPORT_NUMBER), 212711311388 par défaut', () => {
    expect(supportWhatsAppNumber(undefined)).toBe('212711311388');
    expect(supportWhatsAppNumber('')).toBe('212711311388');
    expect(supportWhatsAppNumber('+212 7 11 31 13 88')).toBe('212711311388');
  });

  it('message : salutation et code seulement ; liens WhatsApp et e-mail avec le code', () => {
    const msg = supportMessage('PWD-SEND', FR);
    expect(msg).toBe('Bonjour, j’ai besoin d’aide sur HARX.\nCode d’erreur : PWD-SEND');
    const wa = supportWhatsAppUrl(msg, '212711311388');
    expect(wa.startsWith('https://wa.me/212711311388?text=')).toBe(true);
    expect(decodeURIComponent(new URL(wa).searchParams.get('text') || '')).toBe(msg);
    const mail = decodeURIComponent(supportMailto('PWD-SEND', msg));
    expect(mail).toContain('mailto:support@harx.ai?subject=Support HARX – PWD-SEND');
    expect(mail).toContain('Code d’erreur : PWD-SEND');
    // Jamais l'e-mail saisi ni aucune autre adresse.
    expect(mail.replace('support@harx.ai', '')).not.toContain('@');
  });

  it('codes stables selon l’erreur du serveur', () => {
    expect(recoveryErrorCode({ response: { status: 404 } }, 'email')).toBe('PWD-UNKNOWN-EMAIL');
    expect(recoveryErrorCode({ response: { status: 400, data: { error: 'EMAIL_NOT_REGISTERED' } } }, 'email')).toBe('PWD-UNKNOWN-EMAIL');
    expect(recoveryErrorCode({ response: { status: 502, data: { error: 'EMAIL_SEND_FAILED' } } }, 'email')).toBe('PWD-SEND');
    expect(recoveryErrorCode({ message: 'Network Error' }, 'email')).toBe('PWD-SERVER');
    expect(recoveryErrorCode({ response: { status: 500 } }, 'new-password')).toBe('PWD-SERVER');
    expect(recoveryErrorCode({ response: { status: 400 } }, 'verification')).toBe('PWD-CODE');
  });

  it('textes de l’encadré en fr, en, es, ar', () => {
    for (const d of [fr, en, es, ar] as unknown as Array<Record<string, Record<string, string>>>) {
      for (const k of ['title', 'intro', 'whatsapp', 'writeTo', 'code', 'hello', 'errorCode']) expect(d.support?.[k], k).toBeTruthy();
    }
    expect(fr.support.title).toBe('Besoin d’aide ?');
    expect(fr.support.whatsapp).toBe('Contacter le support sur WhatsApp');
  });
});
