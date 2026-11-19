import { describe, expect, it } from 'vitest';
import { audienceFromSearch } from './signInAudience';

describe('audienceFromSearch', () => {
  it('lit ?audience=team et ?audience=company', () => {
    expect(audienceFromSearch('?audience=team')).toBe('team');
    expect(audienceFromSearch('?product=callcentre&audience=company')).toBe('company');
  });
  it('ignore une valeur absente ou inconnue', () => {
    expect(audienceFromSearch('')).toBeNull();
    expect(audienceFromSearch('?audience=admin')).toBeNull();
  });
});
