import { useState, type ReactNode } from 'react';
import { BehaviorPoolFab } from '@/features/behaviorPool/components/BehaviorPoolFab';
import DesktopHeader from './DesktopHeader';
import MobileHeader from './MobileHeader';
import MobileTabBar from './MobileTabBar';
import SideMenu from './SideMenu';

function Layout({ children }: { children: ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 font-sans text-gray-900">
      {/* 헤더 */}
      <DesktopHeader />
      <MobileHeader onMenuClick={() => setIsMenuOpen(true)} />

      {/* 사이드 메뉴 */}
      <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* 메인 컨텐츠 */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-20 transition-all duration-300 md:px-8 md:pb-10 md:pt-28">
        {children}
      </main>

      {/* + FAB */}
      <BehaviorPoolFab />

      {/* 모바일 탭 바 */}
      <MobileTabBar />
    </div>
  );
}

export default Layout;
