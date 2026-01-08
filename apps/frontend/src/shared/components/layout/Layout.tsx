import { useState, type ReactNode } from 'react';
import DesktopHeader from './DesktopHeader';
import MobileHeader from './MobileHeader';
import MobileTabBar from './MobileTabBar';
import SideMenu from './SideMenu';

function Layout({ children }: { children: ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
