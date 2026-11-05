import axios from 'axios';
import Cookies from 'js-cookie';

/** Invitations to join a company's team (secretariat or other plan), addressed to the signed-in person's e-mail. */
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

export interface InvitationAnswer {
  id: string;
  companyId: string;
  status: string;
}

export async function respondToInvitation(token: string, id: string, accept: boolean): Promise<InvitationAnswer | null> {
  const res = await axios.post(`${base()}/agent-invitations/${encodeURIComponent(id)}/${accept ? 'accept' : 'decline'}`, {}, { headers: headers(token) });
  const data = res.data?.data;
  return data && typeof data.companyId === 'string' ? (data as InvitationAnswer) : null;
}

const OBJECT_ID = /^[a-f0-9]{24}$/i;

/**
 * Après l'acceptation d'une invitation : l'entreprise qui vient d'inviter devient l'entreprise active de la personne, même si elle a déjà
 * un compte HARX (profil, autre équipe) ; la personne arrive donc dans l'espace de l'entreprise qui l'a invitée.
 * `companyId` est partagé (cookie et stockage) avec l'application Téléphonie, qui ne le retient que s'il fait partie de ses emplois.
 */
export function rememberInvitedCompany(companyId: string): void {
  if (!OBJECT_ID.test(companyId)) return;
  try {
    localStorage.setItem('companyId', companyId);
    localStorage.setItem('employerCompanyId', companyId);
    Cookies.set('companyId', companyId, { path: '/', sameSite: 'Lax' });
  } catch {
    /* storage unavailable: the app resolves the company from the account */
  }
}
