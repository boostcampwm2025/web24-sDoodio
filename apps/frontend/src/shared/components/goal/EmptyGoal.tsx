import { ICON_SIZE } from '@/shared/constants/icon';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function EmptyGoal() {
  const navigate = useNavigate();

  return (
    <div className="flex h-full min-h-[50vh] flex-col items-center justify-center gap-6">
      <div className="bg-bg-alternative/60 flex flex-col items-center justify-center gap-4 rounded-3xl p-10 text-center">
        <img
          src="/DodoFace.png"
          alt="두두 놀란 얼굴"
          height={ICON_SIZE['3xl']}
          width={ICON_SIZE['3xl']}
          className="opacity-80"
        />
        <div className="flex flex-col gap-2">
          <p className="text-heading-2 font-bold">아직 등록된 목표가 없어요</p>
          <p className="text-label-alternative font-semibold">새로운 목표를 만들어볼까요?</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/goals/new')}
          className="bg-primary text-bg-base hover:bg-primary/90 mt-2 flex flex-row items-center gap-2 rounded-full px-6 py-3 font-semibold transition-colors"
        >
          <Plus size={ICON_SIZE.md} />
          <span>목표 추가하기</span>
        </button>
      </div>
    </div>
  );
}
