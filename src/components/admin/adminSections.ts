import { LayoutDashboard, Users, type LucideIcon } from 'lucide-react';

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
];
