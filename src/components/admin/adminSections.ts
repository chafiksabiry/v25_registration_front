import { Clock, LayoutDashboard, Phone, Users, Wallet, type LucideIcon } from 'lucide-react';

export type AdminSection = {
  to: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  end?: boolean;
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
