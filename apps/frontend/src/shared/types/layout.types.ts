import type { LucideIcon } from 'lucide-react';

export type RoutePath = '/' | '/all-goals' | '/stats' | '/myroom';

export interface MenuItem {
  path: RoutePath;
  label: string;
  icon?: LucideIcon;
}
