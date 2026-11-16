import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const checkUserType = vi.fn();
const setProduct = vi.fn(() => Promise.resolve());

vi.mock('./api', () => ({ auth: { checkUserType: (id: string) => checkUserType(id), setProduct: (...a: unknown[]) => setProduct(...a) } }));
vi.mock('./agentInvitations', () => ({ INVITATIONS_SEEN_KEY: 'seen', fetchPendingInvitations: vi.fn(() => Promise.resolve([])) }));
vi.mock('./appNavigation', () => ({ hardNavigate: vi.fn() }));
vi.mock('./authSync', () => ({ readStoredAuthToken: vi.fn(() => null) }));
vi.mock('axios', () => ({ default: { get: vi.fn(() => Promise.reject(new Error('no network'))) } }));
vi.mock('js-cookie', () => ({ default: { set: vi.fn(), remove: vi.fn(), get: vi.fn() } }));

import { getPostLoginRedirectUrl } from './authRedirect';

function memoryStorage() {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => (m.has(k) ? m.get(k)! : null),
    setItem: (k: string, v: string) => void m.set(k, String(v)),
    removeItem: (k: string) => void m.delete(k),
    clear: () => m.clear(),
  };
}

const TAAS_MAIN = '/company/#/dashboard/main';
const TAAS_PASSWORD = '/company/#/dashboard/account-settings?changePassword=1';

beforeEach(() => {
  vi.stubGlobal('localStorage', memoryStorage());
  vi.stubGlobal('sessionStorage', memoryStorage());
  checkUserType.mockReset();
  setProduct.mockClear();
});
afterEach(() => vi.unstubAllGlobals());

/** Arrival link ?product=callcentre remembered by the sign-in page. */
const arrivedFromCallcentreLink = () => localStorage.setItem('harx_product', 'callcentre');
const login = () => getPostLoginRedirectUrl('u1', 'tok');

describe('company-member (invited administrator / manager)', () => {
  it('temporary password + product only from the link -> Telephony', async () => {
    arrivedFromCallcentreLink();
    checkUserType.mockResolvedValue({ userType: 'company-member', mustChangePassword: true, employerCompanyId: 'c1' });
    expect(await login()).toBe('/telephony');
  });

  it('temporary password + product on the account -> Telephony', async () => {
    checkUserType.mockResolvedValue({ userType: 'company-member', mustChangePassword: true, product: 'callcentre' });
    expect(await login()).toBe('/telephony');
  });

  it('regular sign-in (manager) + product only from the link -> Telephony', async () => {
    arrivedFromCallcentreLink();
    checkUserType.mockResolvedValue({ userType: 'company-member', employerCompanyId: 'c1' });
    expect(await login()).toBe('/telephony');
  });

  it('regular sign-in + product on the account -> Telephony', async () => {
    checkUserType.mockResolvedValue({ userType: 'company-member', product: 'callcentre' });
    expect(await login()).toBe('/telephony');
  });

  it('no product -> TAAS unchanged (temporary password and regular)', async () => {
    checkUserType.mockResolvedValue({ userType: 'company-member', mustChangePassword: true });
    expect(await login()).toBe(TAAS_PASSWORD);
    checkUserType.mockResolvedValue({ userType: 'company-member' });
    expect(await login()).toBe(TAAS_MAIN);
  });

  it('explicit TAAS product on the account and no link -> TAAS unchanged', async () => {
    checkUserType.mockResolvedValue({ userType: 'company-member', mustChangePassword: true, product: 'taas' });
    expect(await login()).toBe(TAAS_PASSWORD);
    checkUserType.mockResolvedValue({ userType: 'company-member', product: 'taas' });
    expect(await login()).toBe(TAAS_MAIN);
  });

  it('keeps the forced-password flag so Telephony shows its password screen', async () => {
    arrivedFromCallcentreLink();
    checkUserType.mockResolvedValue({ userType: 'company-member', mustChangePassword: true });
    await login();
    expect(localStorage.getItem('mustChangePassword')).toBe('1');
  });
});

describe('invited agent without forced password', () => {
  it('product only from the link -> Telephony', async () => {
    arrivedFromCallcentreLink();
    checkUserType.mockResolvedValue({ userType: 'rep', employerCompanyId: 'c1' });
    expect(await login()).toBe('/telephony');
  });

  it('product on the account -> Telephony', async () => {
    checkUserType.mockResolvedValue({ userType: 'rep', employerCompanyId: 'c1', product: 'callcentre' });
    expect(await login()).toBe('/telephony');
  });

  it('no product -> REPS dashboard unchanged', async () => {
    checkUserType.mockResolvedValue({ userType: 'rep', employerCompanyId: 'c1' });
    expect(await login()).toMatch(/\/dashboard$/);
    expect(await login()).not.toContain('/telephony');
  });

  it('explicit TAAS product and no link -> REPS dashboard unchanged', async () => {
    checkUserType.mockResolvedValue({ userType: 'rep', employerCompanyId: 'c1', product: 'taas' });
    expect(await login()).toMatch(/\/dashboard$/);
  });
});
