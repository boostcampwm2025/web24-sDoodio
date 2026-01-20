import { useEffect, useRef, useState } from 'react';
import type { Behavior } from '@/shared/components/behavior/BehaviorCard.types';
import { GOAL_COLOR_STYLES } from '@/shared/constants/goalColor';
import { MoreHorizontal } from 'lucide-react';
import StickerCell from './StickerCell';
import { DifficultyBadge } from './DifficultyBadge';

interface BehaviorProps {
  behavior: Behavior;
  onToggle: () => void;
  onDelete?: () => void;
}

export function BehaviorCard({ behavior, onToggle, onDelete }: BehaviorProps) {
  const bgColor = GOAL_COLOR_STYLES[behavior.goalColor].bg;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const ignoreNextOutsideRef = useRef(false);
  const canDelete = Boolean(onDelete) && !behavior.isChecked;

  useEffect(() => {
    const handleClickOutside = (event: PointerEvent) => {
      if (!isMenuOpen && !isMenuVisible) return;
      if (ignoreNextOutsideRef.current) {
        ignoreNextOutsideRef.current = false;
        return;
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setIsMenuVisible(false);
      }
    };

    document.addEventListener('pointerdown', handleClickOutside);

    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, [isMenuOpen, isMenuVisible]);

  const handleCardPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!canDelete) return;
    if (event.pointerType !== 'touch') return;
    if ((event.target as HTMLElement).closest('button')) return;
    ignoreNextOutsideRef.current = true;
    setIsMenuVisible(true);
  };

  const menuTriggerClasses =
    isMenuVisible || isMenuOpen
      ? 'pointer-events-auto opacity-100'
      : 'pointer-events-none opacity-0';

  return (
    <div
      onPointerDown={handleCardPointerDown}
      className={`group bg-bg-light relative flex items-center gap-4 rounded-2xl px-7 py-5 transition-all duration-500 ${
        isMenuOpen ? 'z-30' : ''
      } ${
        behavior.isChecked
          ? 'border-bg-alternative bg-bg-light scale-[0.99] opacity-60 shadow-none saturate-50'
          : 'border-transparent shadow-(--shadow-normal) hover:-translate-y-1 hover:shadow-(--shadow-strong)'
      } `}
    >
      {/* 왼쪽 컬러 바 */}
      <div className={`absolute top-0 bottom-0 left-0 w-3.5 rounded-l-2xl ${bgColor}`} />
      <div className="flex-1 pl-3">
        <div className="mb-1 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-bg-alternative text-label-disable rounded px-2 py-0.5 text-xs font-bold">
              {behavior.goalTitle}
            </span>
            {canDelete && (
              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  aria-label="행동 삭제 메뉴"
                  onClick={() => {
                    setIsMenuVisible(true);
                    setIsMenuOpen((open) => !open);
                  }}
                  className={`text-label-alternative hover:text-label-normal transition ${menuTriggerClasses} md:pointer-events-none md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:opacity-100`}
                >
                  <MoreHorizontal size={16} />
                </button>
                {isMenuOpen && (
                  <div className="bg-bg-light border-bg-alternative absolute bottom-full left-0 z-50 mb-1 w-20 rounded-lg border p-1 shadow-(--shadow-normal)">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsMenuVisible(false);
                        onDelete?.();
                      }}
                      className="text-label-normal hover:bg-bg-alternative w-full rounded-md px-3 py-2 text-left text-xs font-semibold"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <h4
          className={`text-base font-bold transition-all duration-300 ${
            behavior.isChecked ? 'text-label-disable line-through' : 'text-label-normal'
          }`}
        >
          {behavior.title}
        </h4>
        <div className="mt-2 flex gap-2">
          <DifficultyBadge level={behavior.difficulty} />
        </div>
      </div>
      {/* 토글 버튼 */}
      <StickerCell
        isFilled={behavior.isChecked}
        isClickable
        onClick={onToggle}
        ariaLabel={`${behavior.title} 완료 토글`}
        ariaPressed={behavior.isChecked}
        stickerColor={behavior.goalColor}
      />{' '}
    </div>
  );
}
