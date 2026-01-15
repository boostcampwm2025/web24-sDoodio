import { fetchGoalStamps } from '@/features/goal/apis/fetchGoalStamps.api';
import { fetchGoal } from '@/features/goal/apis/fetchGoal.api';
import { GoalBehaviorList } from '@/features/goal/components/GoalBehaviorList';
import { GoalStampBoard } from '@/features/goal/components/GoalStampBoard';
import { type Goal, type GoalStamp } from '@web24/shared';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

export function GoalDetailPage() {
  const [goal, setGoal] = useState<Goal | null>(null);
  const { goalId } = useParams<{ goalId: string }>();
  const [stamps, setStamps] = useState<GoalStamp[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    // MEMO: goalId가 null이면 에러페이지로 이동로직 추가
    if (!goalId) return () => {};

    setIsLoading(true);

    Promise.all([fetchGoal(goalId), fetchGoalStamps(goalId)])
      .then(([goalData, stampsData]) => {
        if (cancelled) return;
        setGoal(goalData);
        setStamps(stampsData);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error('Failed to fetch goal'));
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [goalId]);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:px-6 lg:px-8">
      {/* 목표 헤더 */}
      <header className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-label-normal text-title-1 font-bold">
          {isLoading ? '불러오는 중...' : (goal?.title ?? '목표')}
        </h1>
      </header>
      {error && <p>데이터를 불러오는 데 실패했습니다.</p>}

      {/* 목표 본문(>=TABLET) */}
      <div className="hidden flex-row gap-12 md:flex">
        <div className="w-1/2">
          <p className="mb-4 text-lg">
            달성한 스탬프 <span className="text-primary-strong font-bold">{stamps.length}</span> 개
          </p>
          <GoalStampBoard stamps={stamps} />
        </div>
        <div className="w-1/2">{goalId && <GoalBehaviorList goalId={goalId} />}</div>
      </div>

      {/* 목표 본문 (<TABLET) */}
      <div className="flex flex-col overflow-hidden md:hidden">
        {/* 누적 스탬프/행동 목록 탭 */}
        <div className="bg-primary-weak/30 mb-4 flex rounded-lg p-1">
          {['누적 스탬프', '행동 목록'].map((label, i) => (
            <button
              type="button"
              key={label}
              onClick={() => swiperRef.current?.slideTo(i)}
              className={`flex-1 rounded-md py-2 text-sm transition ${activeIndex === i ? 'bg-primary-strong/90 text-bg-light font-bold shadow' : 'text-label-alternative'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 행동 리스트 */}
        <div className="flex-1">
          <Swiper
            className="overflow-hidden"
            slidesPerView={1}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          >
            <SwiperSlide className="box-border p-2">
              <p className="mb-4 text-lg">
                달성한 스탬프 <span className="text-primary-strong font-bold">{stamps.length}</span>{' '}
                개
              </p>
              <GoalStampBoard stamps={stamps} />
            </SwiperSlide>

            <SwiperSlide className="box-border p-2">
              {goalId && <GoalBehaviorList goalId={goalId} />}
            </SwiperSlide>
          </Swiper>
        </div>
      </div>
    </div>
  );
}
