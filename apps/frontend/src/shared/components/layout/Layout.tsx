import { useEffect, useState, type ReactNode } from 'react';
import { useScroll } from '@/shared/hooks/useScroll';
import DesktopHeader from './DesktopHeader';
import MobileHeader from './MobileHeader';
import MobileTabBar from './MobileTabBar';
import SideMenu from './SideMenu';

const HEADER_HEIGHTS = {
  mobile: 56,
  desktop: 96,
  desktopScrolled: 64,
} as const;

function Layout({ children }: { children: ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isScrolled = useScroll(10);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)');
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    let height: number = HEADER_HEIGHTS.mobile;
    if (isDesktop) {
      height = isScrolled ? HEADER_HEIGHTS.desktopScrolled : HEADER_HEIGHTS.desktop;
    }
    root.style.setProperty('--header-h', `${height}px`);
  }, [isDesktop, isScrolled]);

  return (
    <div className="text-label-normal flex min-h-screen flex-col font-sans">
      {/* 헤더 */}
      <DesktopHeader />
      <MobileHeader onMenuClick={() => setIsMenuOpen(true)} />

      {/* 사이드 메뉴 */}
      <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* 메인 컨텐츠 */}
      <main className="mx-auto w-full flex-1 px-4 pt-20 pb-24 transition-all duration-300 md:px-8 md:pt-28 md:pb-10">
        {children}
      </main>

      {/* 모바일 탭 바 */}
      <MobileTabBar />
    </div>
  );
}

export default Layout;
