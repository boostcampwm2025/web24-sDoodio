import { MENU_ITEMS } from '@/shared/constants/menu';
import { useLocation, useNavigate } from 'react-router-dom';

function MobileTabBar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="pb-safe fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-between border-t border-gray-200 bg-white px-6 md:hidden">
      {MENU_ITEMS.map((tab) => {
        const Icon = tab.icon;
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            type="button"
            onClick={() => navigate(tab.path)}
            className={`flex w-12 flex-col items-center justify-center gap-1 transition-colors duration-200 ${isActive ? 'text-indigo-600' : 'text-gray-400'} `}
          >
            {Icon && <Icon size={24} />}
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default MobileTabBar;
