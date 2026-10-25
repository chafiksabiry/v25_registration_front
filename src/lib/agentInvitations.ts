import axios from 'axios';

/** Invitations to join a call centre, addressed to the signed-in person's e-mail. */
export interface PendingInvitation {
  id: string;
  companyId: string;
  companyName: string;
  invitedAt?: string;
}

/** Set once the person has seen the invitations screen, so it is not shown again in this session. */
export const INVITATIONS_SEEN_KEY = 'harx_invitations_seen';

const base = () => String(import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const headers = (token: string) => ({ Authorization: `Bearer ${token}` });

/** Never throws: an unavailable service must not block signing in. */
export async function fetchPendingInvitations(token: string): Promise<PendingInvitation[]> {
  try {
    const res = await axios.get(`${base()}/agent-invitations/mine`, { headers: headers(token), timeout: 8000 });
    return Array.isArray(res.data?.data) ? (res.data.data as PendingInvitation[]) : [];
  } catch {
    return [];
  }
}

export async function respondToInvitation(token: string, id: string, accept: boolean): Promise<void> {
  await axios.post(`${base()}/agent-invitations/${encodeURIComponent(id)}/${accept ? 'accept' : 'decline'}`, {}, { headers: headers(token) });
}
