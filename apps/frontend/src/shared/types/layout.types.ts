import type { LucideIcon } from 'lucide-react';

export type RoutePath = '/' | '/all-goals' | '/stats' | '/dodo-room';

export interface MenuItem {
  path: RoutePath;
  label: string;
  icon?: LucideIcon;
}
