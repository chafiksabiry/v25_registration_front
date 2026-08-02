export type AdminUserRow = {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  typeUser?: string | null;
  isVerified?: boolean;
  createdAt?: string;
  displayName?: string;
  displayEmail?: string;
  displayPhone?: string;
  industry?: string | null;
  profileCreatedAt?: string;
};

export function rowName(user: AdminUserRow) {
  return user.displayName || user.fullName;
}

export function rowEmail(user: AdminUserRow) {
  return user.displayEmail || user.email;
}

export function rowCreatedAt(user: AdminUserRow) {
  const value =
    user.typeUser === 'company' ? user.profileCreatedAt || user.createdAt : user.createdAt;
  return value ? new Date(value).toLocaleString('fr-FR') : '—';
}
