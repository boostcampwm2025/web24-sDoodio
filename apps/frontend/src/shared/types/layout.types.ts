import type { ComponentType, SVGProps } from 'react';

export type RoutePath = '/' | '/all-goals' | '/stats' | '/dodo-room';

export type MenuIcon = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

export interface MenuItem {
  path: RoutePath;
  label: string;
  icon?: MenuIcon;
}
