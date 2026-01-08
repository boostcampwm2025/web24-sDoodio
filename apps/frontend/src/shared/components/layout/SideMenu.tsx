import { useEffect } from 'react';
import { X } from 'lucide-react';
import { BREAKPOINTS } from '@/shared/constants/breakpoints';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

function SideMenu({ isOpen, onClose }: SideMenuProps) {
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
        className={`bg-bg-light fixed top-0 right-0 bottom-0 z-50 w-64 transform shadow-[var(--shadow-strong)] transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} `}
      >
        <div className="flex h-full flex-col p-5">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-label-normal text-xl font-bold">Menu</h2>
            <button
              type="button"
              className="hover:bg-bg-alternative rounded-full p-1 transition-colors"
              onClick={onClose}
            >
              <X size={24} className="text-label-disable" />
            </button>
          </div>

          <div className="flex-1 space-y-4">
            <div className="bg-bg-alternative h-10 animate-pulse rounded-lg" />
            <div className="bg-bg-alternative h-10 animate-pulse rounded-lg" />
            <div className="bg-bg-alternative h-10 animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    </>
  );
}

export default SideMenu;
