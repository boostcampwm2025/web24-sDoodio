import type { MenuItem } from '@/shared/types/layout.types';
import DodoFace from '@/assets/DodoFace.svg?react';
import { Home, Grid, BarChart2 } from 'lucide-react';

export const MENU_ITEMS: MenuItem[] = [
  { path: '/', icon: Home, label: '홈' },
  { path: '/all-goals', icon: Grid, label: '전체 목표' },
  { path: '/stats', icon: BarChart2, label: '통계' },
  { path: '/dodo-room', icon: DodoFace, label: '두두의방' },
];
