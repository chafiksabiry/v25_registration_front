import { describe, expect, it } from 'vitest';
import { identityAdminUrl, supportInboxSocketUrl } from '../../lib/api';
import { backoffMs } from './useSupportInboxSocket';

describe('supportInboxSocketUrl', () => {
  it('https -> wss, chemin /support-inbox, sans jeton dans l’URL', () => {
    expect(supportInboxSocketUrl('https://api.example.com/api/whatsapp/admin')).toBe('wss://api.example.com/support-inbox');
  });
  it('http -> ws et barre finale ignorée', () => {
    expect(supportInboxSocketUrl('http://127.0.0.1:4599/api/whatsapp/admin/')).toBe('ws://127.0.0.1:4599/support-inbox');
  });
});

describe('identityAdminUrl', () => {
  it('page Admin › Identité de l’orchestrateur (demande « Identité » de l’Inbox)', () => {
    expect(identityAdminUrl('https://api.example.com/api/whatsapp/admin')).toBe('https://api.example.com/admin/identity');
    expect(identityAdminUrl('http://127.0.0.1:4599/api/whatsapp/admin/')).toBe('http://127.0.0.1:4599/admin/identity');
  });
});

describe('backoffMs', () => {
  it('croît par doublement avec un peu d’aléa, plafonné à 30 s', () => {
    expect(backoffMs(0, 0.5)).toBe(1000);
    expect(backoffMs(1, 0.5)).toBe(2000);
    expect(backoffMs(3, 0.5)).toBe(8000);
    expect(backoffMs(20, 0.5)).toBe(30000);
    expect(backoffMs(2, 0)).toBe(3200);
    expect(backoffMs(2, 1)).toBe(4800);
  });
});
