import { Clock, LayoutDashboard, Phone, Users, Wallet, type LucideIcon } from 'lucide-react';

export type AdminSection = {
  to: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  end?: boolean;
};

export type AdminNavGroup = {
  label: string;
  items: AdminSection[];
};

export const ADMIN_SECTIONS: AdminSection[] = [
  {
    to: '/admin',
    label: 'Tableau de bord',
    shortLabel: 'Dashboard',
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: '/admin/users',
    label: 'Utilisateurs',
    shortLabel: 'Users',
    icon: Users,
  },
  {
    to: '/admin/wallet',
    label: 'Wallet',
    shortLabel: 'Wallet',
    icon: Wallet,
  },
  {
    to: '/admin/pricing/minutes',
    label: 'Offres minutes',
    shortLabel: 'Minutes',
    icon: Clock,
  },
  {
    to: '/admin/pricing/phone-line',
    label: 'Lignes téléphone',
    shortLabel: 'Phone',
    icon: Phone,
  },
];

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    label: 'Plateforme',
    items: ADMIN_SECTIONS.slice(0, 3),
  },
  {
    label: 'Tarification',
    items: ADMIN_SECTIONS.slice(3),
  },
];

export function findAdminSection(pathname: string) {
  const exact = ADMIN_SECTIONS.find((section) =>
    section.end ? pathname === section.to || pathname === `${section.to}/` : pathname.startsWith(section.to),
  );
  return exact || ADMIN_SECTIONS[0];
}
