import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { guessPhoneCountry, isMissingPhoneError, isPlausiblePhone, isValidOptionalPhone, phonePlaceholder } from './phoneField';

describe('téléphone facultatif à l’inscription', () => {
  it('accepte un champ vide', () => {
    expect(isValidOptionalPhone('')).toBe(true);
    expect(isValidOptionalPhone('   ')).toBe(true);
  });

  it('accepte un numéro plausible, refuse le reste', () => {
    for (const ok of ['+33 6 12 34 56 78', '06 12 34 56 78', '+44 7700 900123', '+1 (201) 555-0123', '+212.6.12.34.56.78']) {
      expect(isPlausiblePhone(ok)).toBe(true);
      expect(isValidOptionalPhone(ok)).toBe(true);
    }
    for (const bad of ['123', 'abc', '+33 6 12 34 5x 78', '+1234567890123456']) {
      expect(isValidOptionalPhone(bad)).toBe(false);
    }
  });
});

describe('exemple de numéro selon le pays', () => {
  it('suit la région de la langue du navigateur', () => {
    expect(phonePlaceholder({ browser: ['en-GB', 'en'] })).toBe('+44 7700 900123');
    expect(phonePlaceholder({ browser: ['en-US'] })).toBe('+1 201 555 0123');
    expect(phonePlaceholder({ browser: ['fr-FR'] })).toBe('+33 6 12 34 56 78');
    expect(phonePlaceholder({ browser: ['fr-BE'] })).toBe('+32 470 12 34 56');
    expect(phonePlaceholder({ browser: ['ar-MA'] })).toBe('+212 6 12 34 56 78');
    expect(guessPhoneCountry({ browser: ['de', 'fr-CH'] })).toBe('CH');
  });

  it('sans région, suit la langue du site ; jamais l’exemple américain par défaut', () => {
    expect(phonePlaceholder({ browser: ['fr'], siteLang: 'fr' })).toBe('+33 6 12 34 56 78');
    expect(phonePlaceholder({ browser: [], siteLang: 'en' })).toBe('+44 7700 900123');
    expect(phonePlaceholder({ browser: [], siteLang: 'es' })).toBe('+34 612 34 56 78');
    expect(phonePlaceholder({})).not.toContain('555) 000');
  });
});

describe('refus du serveur faute de téléphone', () => {
  it('est reconnu', () => {
    expect(isMissingPhoneError('User validation failed: phone: Path `phone` is required.')).toBe(true);
    expect(isMissingPhoneError('Email already registered')).toBe(false);
    expect(isMissingPhoneError(undefined)).toBe(false);
  });
});

describe('RegistrationDialog.tsx', () => {
  const src = readFileSync(fileURLToPath(new URL('../components/RegistrationDialog.tsx', import.meta.url)), 'utf8');
  it('n’exige plus le téléphone et n’envoie plus de SMS automatiquement à l’inscription', () => {
    expect(src).toContain('isValidOptionalPhone');
    expect(src).not.toMatch(/await auth\.sendOTP\(RegisterResult/);
  });
  it('n’affiche plus le numéro américain fixe', () => {
    expect(src).not.toContain('+1 (555) 000-0000');
    expect(src).toContain('phonePlaceholder(');
  });
});
