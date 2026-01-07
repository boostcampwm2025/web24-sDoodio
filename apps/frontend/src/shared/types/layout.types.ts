import type { LucideIcon } from 'lucide-react';

export type RoutePath = '/' | '/all-goals' | '/stats' | '/myroom';

export interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface MenuItem {
  path: RoutePath;
  label: string;
  icon?: LucideIcon;
}
