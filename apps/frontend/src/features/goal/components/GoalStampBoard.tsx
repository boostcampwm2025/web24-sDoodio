import { DIFFICULTY_COLOR_STYLES } from '@/shared/constants/difficultyColor';
import { ICON_SIZE } from '@/shared/constants/icon';
import type { BehaviorDifficulty, GoalStamp } from '@web24/shared';
import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StampProps {
  readonly difficulty: BehaviorDifficulty;
  readonly isDodo: boolean;
  readonly onSelect: () => void;
}

interface GoalStampBoardProps {
  readonly stamps: GoalStamp[];
}

function Stamp({ difficulty, isDodo, onSelect }: StampProps) {
  const { bg } = DIFFICULTY_COLOR_STYLES[difficulty];

  return (
    <button
      type="button"
      aria-label={isDodo ? 'dodo-stamp' : 'stamp'}
      onClick={onSelect}
      className={`flex h-12 w-12 items-center justify-center rounded-full ${bg} scale-100 rotate-[-5deg] transform transition-transform duration-400 ease-out hover:scale-125 hover:rotate-12`}
    >
      {isDodo ? (
        <img src="/DodoFace.png" width={ICON_SIZE.md} height={ICON_SIZE.md} alt="두두 얼굴" />
      ) : (
        <Star size={ICON_SIZE.md} className="text-white" />
      )}
    </button>
  );
}

export function GoalStampBoard({ stamps }: GoalStampBoardProps) {
  const MIN_LENGTH_TO_ACTIVE_DODO_GAME = 1;
  const [dodoIndex, setDodoIndex] = useState<number | null>(null);

  const getNewDodoIndex = () => {
    if (stamps.length <= MIN_LENGTH_TO_ACTIVE_DODO_GAME) return null;

    let newIndex: number;
    do {
      newIndex = crypto.getRandomValues(new Uint32Array(1))[0] % stamps.length;
    } while (newIndex === dodoIndex);

    return newIndex;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const sendClickEvent = (_index: number) => {
    // 시도 API 전송
  };

  useEffect(() => {
    if (stamps.length <= MIN_LENGTH_TO_ACTIVE_DODO_GAME) {
      setDodoIndex(null);
      return;
    }
    const newDodoIndex = Math.floor(Math.random() * stamps.length);
    setDodoIndex(newDodoIndex);
  }, [stamps.length]);

  return (
    <div className="bg-bg-light border-primary-strong grid max-h-[60vh] w-full grid-cols-[repeat(auto-fit,minmax(56px,1fr))] gap-2 overflow-y-scroll rounded-2xl p-4">
      {stamps.map((stamp, index) => (
        <Stamp
          key={stamp.id}
          difficulty={stamp.difficulty}
          isDodo={index === dodoIndex}
          onSelect={() => {
            sendClickEvent(index);
            if (index === dodoIndex) {
              const newDodoIndex = getNewDodoIndex();
              setDodoIndex(newDodoIndex);
            }
          }}
        />
      ))}
    </div>
  );
}
