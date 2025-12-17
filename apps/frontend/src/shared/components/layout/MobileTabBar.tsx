import type { RoutePath } from '@/shared/types/layout.types';
import { Home, BarChart2, User, Grid } from 'lucide-react';
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function MobileTabBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs: { path: RoutePath; icon: ReactNode; label: string }[] = [
    { path: '/', icon: <Home size={24} />, label: '홈' },
    { path: '/all-habits', icon: <Grid size={24} />, label: '전체' },
    { path: '/stats', icon: <BarChart2 size={24} />, label: '통계' },
    { path: '/myroom', icon: <User size={24} />, label: '두두의 방' },
  ];

  return (
    <nav className="pb-safe fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-between border-t border-gray-200 bg-white px-6 md:hidden">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            type="button"
            onClick={() => navigate(tab.path)}
            className={`flex w-12 flex-col items-center justify-center gap-1 transition-colors duration-200 ${isActive ? 'text-indigo-600' : 'text-gray-400'} `}
          >
            {tab.icon}
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default MobileTabBar;
