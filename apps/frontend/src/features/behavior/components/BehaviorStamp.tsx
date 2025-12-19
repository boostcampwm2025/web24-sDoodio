import { ChevronRight, Stamp } from 'lucide-react';
import { StickerBoard } from '@/shared/components/StickerBoard';
import type { BehaviorStampProps } from '../types/behavior.types';

function BehaviorStamp({ info, onStamp }: BehaviorStampProps) {
  const { isStampedToday, totalStamps } = info;

  const handleStampClick = () => {
    if (!isStampedToday) {
      onStamp();
    }
  };

  return (
    <div className="flex h-full flex-col justify-between rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-bold text-gray-800">
            <Stamp size={20} className="text-indigo-500" />
            행동 도장
          </h3>
          <span className="rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-500">
            Total {totalStamps}
          </span>
        </div>
        <StickerBoard
          currentCount={info.totalStamps}
          columns={5}
          onStickerClick={handleStampClick}
        />
      </div>

      <button
        className="group mt-auto flex w-full items-center justify-center gap-1 rounded-xl py-3 text-sm text-gray-500 transition-all hover:bg-indigo-50 hover:text-indigo-600"
        type="button"
      >
        <span>전체 스탬프 보기</span>
        <ChevronRight
          size={16}
          className="translate-x-0 transform transition-transform duration-200 ease-in-out group-hover:translate-x-1"
        />
      </button>
    </div>
  );
}

export default BehaviorStamp;
