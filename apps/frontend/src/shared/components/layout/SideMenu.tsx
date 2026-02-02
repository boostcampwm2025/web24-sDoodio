import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BREAKPOINTS } from '@/shared/constants/breakpoints';
import useAuthStore from '@/stores/useAuthStore';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  // 스크롤 잠금
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'; // 스크롤 금지
    } else {
      document.body.style.overflow = 'unset'; // 스크롤 복구
    }
    return () => {
      document.body.style.overflow = 'unset'; // 컴포넌트 언마운트 시 복구
    };
  }, [isOpen]);

  // 데스크탑 크기가 되면 닫기
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= BREAKPOINTS.TABLET && isOpen) {
        onClose();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, onClose]);

  return (
    <>
      {/* 오버레이 */}
      <div
        className={`bg-label-normal/40 fixed inset-0 z-40 transition-opacity duration-300 ${isOpen ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'} `}
        role="presentation"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* 슬라이딩 메뉴 */}
      <div
        className={`bg-bg-light fixed top-0 right-0 bottom-0 z-50 w-64 transform shadow-(--shadow-strong) transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} `}
      >
        <div className="flex h-full flex-col p-5">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-label-normal text-xl font-bold">메뉴</h2>
            <button
              type="button"
              className="hover:bg-bg-alternative rounded-full p-1 transition-colors"
              onClick={onClose}
            >
              <X size={24} className="text-label-disable" />
            </button>
          </div>

          <div className="flex-1 space-y-4">
            <button
              type="button"
              className="hover:bg-bg-alternative text-label-normal w-full rounded-lg px-3 py-2 text-left text-sm transition-colors"
              onClick={() => {
                navigate('/mypage');
                onClose();
              }}
            >
              마이페이지
            </button>
          </div>

          {user ? (
            <button
              type="button"
              className="hover:bg-bg-alternative w-full rounded-lg px-3 py-2 text-left text-sm text-[#d84343]"
              onClick={async () => {
                await logout();
                onClose();
                navigate('/login');
              }}
            >
              로그아웃
            </button>
          ) : null}
        </div>
      </div>
    </>
  );
}

export default SideMenu;
