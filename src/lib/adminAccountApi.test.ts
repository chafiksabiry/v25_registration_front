import { beforeEach, describe, expect, it, vi } from 'vitest';

const http = vi.hoisted(() => ({
  get: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
  post: vi.fn(),
}));

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>();
  const instance = { ...http, interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } } };
  return { ...actual, default: { ...actual.default, create: () => instance } };
});

const { adminApi } = await import('./api');

describe('adminApi : désactivation et suppression (contrat avec v25_registration_backend)', () => {
  beforeEach(() => {
    Object.values(http).forEach((f) => f.mockReset());
  });
  it('PATCH /admin/users/:id/status { disabled, reason }', async () => {
    http.patch.mockResolvedValue({ data: { success: true, data: { disabled: true } } });
    await adminApi.setUserStatus('u1', { disabled: true, reason: 'Fraude' });
    expect(http.patch).toHaveBeenCalledWith('/admin/users/u1/status', { disabled: true, reason: 'Fraude' });
  });
  it('DELETE /admin/users/:id avec l’email retapé', async () => {
    http.delete.mockResolvedValue({ data: { success: true, data: { emailFreed: true } } });
    const out = await adminApi.deleteUser('u1', 'marie.dupont@exemple.fr');
    expect(http.delete).toHaveBeenCalledWith('/admin/users/u1', { data: { confirmEmail: 'marie.dupont@exemple.fr' } });
    expect(out.data.emailFreed).toBe(true);
  });
  it('liste : filtre « status »', async () => {
    http.get.mockResolvedValue({ data: { data: { users: [], pagination: { pages: 1 } } } });
    await adminApi.users({ page: 1, status: 'disabled' });
    expect(http.get).toHaveBeenCalledWith('/admin/users', { params: { page: 1, status: 'disabled' } });
  });
});
