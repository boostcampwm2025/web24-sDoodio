import { useEffect, useRef, useState } from 'react';
import type { Behavior } from '@/shared/components/behavior/BehaviorCard.types';
import { GOAL_COLOR_STYLES } from '@/shared/constants/goalColor';
import { Trash2 } from 'lucide-react';
import Modal from 'react-modal';
import StickerCell from './StickerCell';
import { DifficultyBadge } from './DifficultyBadge';

interface BehaviorProps {
  behavior: Behavior;
  onToggle: () => void;
  onDelete?: () => void;
}

export function BehaviorCard({ behavior, onToggle, onDelete }: BehaviorProps) {
  const bgColor = GOAL_COLOR_STYLES[behavior.goalColor].bg;
  const [isActionVisible, setIsActionVisible] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const canDelete = Boolean(onDelete) && !behavior.isChecked;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsActionVisible(false);
      }
    };

    if (isActionVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isActionVisible]);

  const handleCardPointerDown = (e: React.PointerEvent) => {
    // 버튼이나 인터랙티브 요소 클릭 시 무시
    if ((e.target as HTMLElement).closest('button')) return;

    if (canDelete) {
      // 터치 환경인지 확인
      const isTouch = globalThis.matchMedia('(pointer: coarse)').matches;
      if (isTouch) {
        setIsActionVisible(!isActionVisible);
      }
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setIsActionVisible(false);
  };

  return (
    <div
      ref={cardRef}
      onPointerDown={handleCardPointerDown}
      className={`group bg-bg-light relative flex items-center gap-4 rounded-2xl px-7 py-5 transition-all duration-500 ${
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
              <button
                type="button"
                aria-label="행동 삭제"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setIsDeleteModalOpen(true);
                }}
                className={`hover:text-accent-red text-label-alternative/40 transition-all duration-300 ${
                  isActionVisible || isDeleteModalOpen
                    ? 'pointer-events-auto translate-x-0 opacity-100'
                    : 'pointer-events-none -translate-x-2 opacity-0 group-hover:pointer-events-auto group-hover:translate-x-0 group-hover:opacity-100'
                } `}
              >
                <Trash2 size={16} />
              </button>
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
      <div onPointerDown={(e) => e.stopPropagation()}>
        <StickerCell
          isFilled={behavior.isChecked}
          isClickable
          onClick={onToggle}
          ariaLabel={`${behavior.title} 완료 토글`}
          ariaPressed={behavior.isChecked}
          stickerColor={behavior.goalColor}
        />{' '}
      </div>
      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={closeDeleteModal}
        shouldCloseOnOverlayClick
        overlayClassName="fixed inset-0 z-50 bg-black/30"
        className="bg-bg-light fixed top-1/2 left-1/2 w-[min(24rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6 shadow-(--shadow-strong) focus:outline-none"
        contentLabel="행동 삭제 확인"
      >
        <h4 className="text-label-normal text-base font-bold">행동을 삭제할까요?</h4>
        <p className="text-label-alternative mt-2 text-sm">
          삭제하면 오늘의 행동 목록에서 사라집니다.
        </p>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={closeDeleteModal}
            className="bg-bg-alternative text-label-normal hover:bg-bg-alternative/80 rounded-lg px-4 py-2 text-sm font-semibold transition"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => {
              closeDeleteModal();
              onDelete?.();
            }}
            className="bg-difficulty-4 text-bg-light rounded-lg px-4 py-2 text-sm font-semibold transition hover:bg-[#c53a3a]"
          >
            삭제
          </button>
        </div>
      </Modal>
    </div>
  );
}
