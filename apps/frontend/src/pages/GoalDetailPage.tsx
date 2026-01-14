import { fetchGoalStamps } from '@/features/goal/apis/fetchGoalStamps.api';
import { GoalBehaviorList } from '@/features/goal/components/GoalBehaviorList';
import { GoalStampBoard } from '@/features/goal/components/GoalStampBoard';
import { type Goal, type GoalStamp } from '@web24/shared';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const mockGoal: Goal = {
  id: '019bba2d-6702-79f4-b5f9-ee83fa4729f6',
  title: '건강 목표',
  color: 'pink',
};

export function GoalDetailPage() {
  const [goal] = useState<Goal>(mockGoal);
  const { goalId } = useParams<{ goalId: string }>();
  const [stamps, setStamps] = useState<GoalStamp[]>([]);

  useEffect(() => {
    // goalId가 null이면 에러페이지로 이동로직 추가
    fetchGoalStamps(goalId!).then((s) => {
      setStamps(s);
    });
  }, [goalId]);

  return (
    <div className="p-4 sm:px-6 lg:px-8">
      {/* 목표 헤더 */}
      <header className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-label-normal text-title-1 font-bold">{goal.title}</h1>
      </header>

      {/* 목표 본문 */}
      <div className="flex flex-row gap-12">
        <div className="w-full max-w-1/2">
          <p className="mb-4 text-sm">
            달성한 스탬프 <span className="text-primary-strong font-bold">{stamps.length}</span> 개
          </p>
          <GoalStampBoard stamps={stamps} />
        </div>
        <div className="w-full max-w-1/2">
          <GoalBehaviorList />
        </div>
      </div>
    </div>
  );
}
