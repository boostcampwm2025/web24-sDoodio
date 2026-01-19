import { useScroll } from '@/shared/hooks/useScroll';
import { Bell } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { MENU_ITEMS } from '@/shared/constants/menu';
import { toast } from 'react-toastify';
import useAuthStore from '@/stores/useAuthStore';

function DesktopHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const isScrolled = useScroll(10);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isProfileOpen) {
      return () => {};
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  return (
    <header
      className={`bg-bg-normal border-bg-alternative fixed top-0 right-0 left-0 z-30 hidden justify-center border-b transition-all duration-300 ease-in-out md:flex ${isScrolled ? 'h-16 shadow-[var(--shadow-normal)]' : 'h-24 shadow-none'} `}
    >
      <div className="flex h-full w-full max-w-5xl items-center justify-between px-8">
        {/* 로고 */}
        <button
          type="button"
          className="flex cursor-pointer items-center gap-2"
          onClick={() => navigate('/')}
        >
          <div className="bg-primary-strong text-bg-light flex h-8 w-8 items-center justify-center rounded-lg font-bold">
            DW
          </div>
          <span className="text-heading-2 text-label-normal font-bold tracking-tight">뚜웰</span>
        </button>

        {/* 메뉴 */}
        <nav className="flex items-center gap-12">
          {MENU_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className={`text-label-1 relative cursor-pointer px-1 py-2 font-semibold transition-colors duration-200 ${isActive ? 'text-primary-strong' : 'text-label-disable hover:text-primary-normal'} `}
              >
                {item.label}
                {isActive && (
                  <span className="animate-in fade-in zoom-in bg-primary-strong absolute bottom-0 left-0 h-0.5 w-full rounded-full duration-200" />
                )}
              </button>
            );
          })}
        </nav>

        {/* 우측 아이콘 */}
        <div className="flex items-center gap-3">
          <button
            className="text-label-disable hover:text-label-normal relative p-2 transition-colors"
            type="button"
            onClick={() => {
              toast('구현 예정입니다.');
            }}
          >
            <Bell size={20} />
            <span className="bg-goal-2 border-bg-light absolute top-2 right-2 h-1.5 w-1.5 rounded-full border" />
          </button>
          {user ? (
            <div className="relative" ref={profileRef}>
              <button
                className="hover:border-primary-strong text-label-2 text-label-alternative bg-bg-light border-primary-weak flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border font-bold transition-all"
                type="button"
                onClick={() => setIsProfileOpen((prev) => !prev)}
              >
                {user.nickname.charAt(0)}
              </button>
              {isProfileOpen ? (
                <div className="border-bg-alternative bg-bg-light shadow-emphasize absolute right-0 mt-2 w-36 rounded-xl border p-2">
                  <button
                    type="button"
                    className="hover:bg-bg-alternative w-full rounded-lg px-3 py-2 text-left text-sm text-[#d84343]"
                    onClick={async () => {
                      await logout();
                      setIsProfileOpen(false);
                      navigate('/login');
                    }}
                  >
                    로그아웃
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export default DesktopHeader;
