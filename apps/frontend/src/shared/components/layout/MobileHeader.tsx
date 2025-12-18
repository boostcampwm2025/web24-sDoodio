import { Menu, Bell } from 'lucide-react';

function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white/90 px-4 backdrop-blur-sm md:hidden">
      <h1 className="text-lg font-bold text-gray-800">뚜웰</h1>
      <div className="flex items-center gap-1">
        <button className="rounded-full p-2 text-gray-500 active:bg-gray-100" type="button">
          <Bell size={22} />
        </button>
        <button
          className="rounded-full p-2 text-gray-800 active:bg-gray-100"
          type="button"
          onClick={onMenuClick}
        >
          <Menu size={24} />
        </button>
      </div>
    </header>
  );
}

export default MobileHeader;
