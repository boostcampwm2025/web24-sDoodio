import { MENU_ITEMS } from '@/shared/constants/menu';
import { useLocation, useNavigate } from 'react-router-dom';

function MobileTabBar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="bg-bg-light border-bg-alternative pb-safe fixed right-0 bottom-0 left-0 z-30 flex h-16 items-center justify-between border-t px-6 md:hidden">
      {MENU_ITEMS.map((tab) => {
        const Icon = tab.icon;
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            type="button"
            onClick={() => navigate(tab.path)}
            className={`flex w-12 flex-col items-center justify-center gap-1 transition-colors duration-200 ${isActive ? 'text-primary-strong' : 'text-label-disable'} `}
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
