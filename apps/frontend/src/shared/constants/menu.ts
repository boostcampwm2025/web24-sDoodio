import type { MenuItem } from '@/shared/types/layout.types';
import { Home, Grid, BarChart2, User } from 'lucide-react';

export const MENU_ITEMS: MenuItem[] = [
  { path: '/', icon: Home, label: '홈' },
  { path: '/all-behaviors', icon: Grid, label: '전체 행동' },
  { path: '/stats', icon: BarChart2, label: '통계' },
  { path: '/myroom', icon: User, label: '두두의방' },
];
