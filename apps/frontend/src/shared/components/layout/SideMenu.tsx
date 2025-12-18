import type { SideMenuProps } from '@/shared/types/layout.types';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { BREAKPOINTS } from '@/shared/constants/breakpoints';

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
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${isOpen ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'} `}
        role="presentation"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* 슬라이딩 메뉴 */}
      <div
        className={`fixed bottom-0 right-0 top-0 z-50 w-64 transform bg-white shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} `}
      >
        <div className="flex h-full flex-col p-5">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Menu</h2>
            <button type="button" className="rounded-full p-1 hover:bg-gray-100" onClick={onClose}>
              <X size={24} className="text-gray-500" />
            </button>
          </div>

          <div className="flex-1 space-y-4">
            <div className="h-10 animate-pulse rounded-lg bg-gray-100" />
            <div className="h-10 animate-pulse rounded-lg bg-gray-100" />
            <div className="h-10 animate-pulse rounded-lg bg-gray-100" />
          </div>
        </div>
      </div>
    </>
  );
}

export default SideMenu;
