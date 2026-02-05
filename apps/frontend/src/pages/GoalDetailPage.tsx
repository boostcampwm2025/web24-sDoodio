import { GoalBehaviorList } from '@/features/goal/components/GoalBehaviorList';
import { GoalStampBoard } from '@/features/goal/components/GoalStampBoard';
import { type GoalColor } from '@web24/shared';
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import GoalDetailPageHeader from '@/features/goal/components/GoalDetailPageHeader';
import { toast } from 'react-toastify';
import { useGoalQuery } from '@/features/goal/hooks/useGoalQuery';
import { useGoalStampsQuery } from '@/features/goal/hooks/useGoalStampsQuery';
import { useGoalBehaviorsDetailQuery } from '@/features/goal/hooks/useGoalBehaviorsDetailQuery';
import { useUpdateGoalMutation } from '@/features/goal/hooks/useUpdateGoalMutation';

export function GoalDetailPage() {
  const { goalId = '' } = useParams<{ goalId: string }>();
  const navigate = useNavigate();

  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<any>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editColor, setEditColor] = useState<GoalColor>('beige');

  const { data: goal, isLoading: isGoalLoading, error: goalError } = useGoalQuery(goalId);
  const { data: stamps = [] } = useGoalStampsQuery(goalId);
  const { data: behaviors = [], isLoading: isBehaviorsLoading } =
    useGoalBehaviorsDetailQuery(goalId);

  const updateGoalMutation = useUpdateGoalMutation(goalId);

  useEffect(() => {
    if (!goalId) {
      toast('잘못된 접근입니다.');
      navigate('/all-goals');
    }
  }, [goalId, navigate]);

  useEffect(() => {
    if (goal) {
      setEditTitle(goal.title);
      setEditColor(goal.color);
    }
  }, [goal]);

  // 수정 핸들러
  const handleUpdate = () => {
    if (!goalId || !goal) return;
    updateGoalMutation.mutate(
      { title: editTitle, color: editColor },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      },
    );
  };

  // 수정 취소 핸들러
  const handleCancel = () => {
    if (goal) {
      setEditTitle(goal.title);
      setEditColor(goal.color);
    }
    setIsEditing(false);
  };

  return (
    <div className="mx-auto max-w-7xl p-4 sm:px-6 lg:px-8">
      {/* 목표 헤더 */}
      <GoalDetailPageHeader
        goal={goal}
        isLoading={isGoalLoading}
        isEditing={isEditing}
        editColor={editColor}
        editTitle={editTitle}
        onChangeTitle={setEditTitle}
        onChangeColor={setEditColor}
        onStartEdit={() => setIsEditing(true)}
        onCancel={handleCancel}
        onSave={handleUpdate}
      />
      {goalError && <p>데이터를 불러오는 데 실패했습니다.</p>}

      {/* 목표 본문(>=TABLET) */}
      <div className="hidden flex-row gap-12 md:flex">
        <div className="w-1/2">
          <p className="mb-4 text-lg">
            달성한 스탬프 <span className="text-primary-strong font-bold">{stamps.length}</span> 개
          </p>
          <GoalStampBoard stamps={stamps} />
        </div>
        <div className="w-1/2">
          {goalId && (
            <GoalBehaviorList
              goalId={goalId}
              behaviors={behaviors}
              isLoading={isBehaviorsLoading}
            />
          )}
        </div>
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
              {goalId && (
                <GoalBehaviorList
                  goalId={goalId}
                  behaviors={behaviors}
                  isLoading={isBehaviorsLoading}
                />
              )}
            </SwiperSlide>
          </Swiper>
        </div>
      </div>
    </div>
  );
}
