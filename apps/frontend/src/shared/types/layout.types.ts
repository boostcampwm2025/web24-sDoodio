import type { LucideIcon } from 'lucide-react';

export type RoutePath = '/' | '/all-behaviors' | '/stats' | '/myroom';

export interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export type MenuItem = {
  path: RoutePath;
  label: string;
  icon?: LucideIcon;
};
