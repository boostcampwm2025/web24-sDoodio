import { useScroll } from '@/shared/hooks/useScroll';
import { Bell } from 'lucide-react';
import type { RoutePath } from '@/shared/types/layout.types';
import { useLocation, useNavigate } from 'react-router-dom';

function DesktopHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const isScrolled = useScroll(10);

  const menuItems: { path: RoutePath; label: string }[] = [
    { path: '/', label: '홈' },
    { path: '/all-habits', label: '전체 습관' },
    { path: '/stats', label: '통계' },
    { path: '/myroom', label: '두두의방' },
  ];

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-30 hidden justify-center border-b border-gray-100 bg-white transition-all duration-300 ease-in-out md:flex ${isScrolled ? 'h-16 shadow-sm' : 'h-24 shadow-none'} `}
    >
      <div className="flex h-full w-full max-w-5xl items-center justify-between px-8">
        {/* 로고 */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 font-bold text-white">
            DW
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-800">뚜웰</span>
        </div>

        {/* 메뉴 */}
        <nav className="flex items-center gap-12">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className={`relative px-1 py-2 text-sm font-semibold transition-colors duration-200 ${isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-500'} `}
              >
                {item.label}
                {isActive && (
                  <span className="animate-in fade-in zoom-in absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-indigo-600 duration-200" />
                )}
              </button>
            );
          })}
        </nav>

        {/* 우측 아이콘 */}
        <div className="flex items-center gap-3">
          <button
            className="relative p-2 text-gray-400 transition-colors hover:text-gray-600"
            type="button"
          >
            <Bell size={20} />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full border border-white bg-red-500" />
          </button>
          <div className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-gradient-to-tr from-indigo-100 to-purple-100 text-sm font-bold text-indigo-700 transition-all hover:border-indigo-300">
            U
          </div>
        </div>
      </div>
    </header>
  );
}

export default DesktopHeader;
