import { Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const navigate = useNavigate();

  return (
    <header className="bg-bg-normal/90 border-bg-alternative fixed top-0 right-0 left-0 z-30 flex h-14 items-center justify-between border-b px-4 backdrop-blur-sm md:hidden">
      <button type="button" onClick={() => navigate('/')}>
        <h1 className="text-label-normal text-lg font-bold">뚜웰</h1>
      </button>
      <div className="flex items-center gap-1">
        <button
          className="text-label-normal active:bg-bg-alternative rounded-full p-2"
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
