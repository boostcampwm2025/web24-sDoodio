import { GoalBehaviorList } from '@/features/goal/components/GoalBehaviorList';
import { GoalStampBoard } from '@/features/goal/components/GoalStampBoard';
import { type Goal, type GoalStamp } from '@web24/shared';
import { useState } from 'react';

const generateMockStamps = (cnt: number): GoalStamp[] => {
  const difficulties: GoalStamp['difficulty'][] = [
    '마음열기',
    '시작하기',
    '이어가기',
    '몰입하기',
    'AI',
  ];

  return Array.from({ length: cnt }, (_, i) => ({
    id: String(i + 1),
    difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
  }));
};

const mockGoal: Goal = {
  id: 'goal-1',
  title: '건강 목표',
  color: 'pink',
};

export function GoalDetailPage() {
  const [goal] = useState<Goal>(mockGoal);
  const mockStamps: GoalStamp[] = generateMockStamps(100);

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
            달성한 스탬프 <span className="text-primary-strong font-bold">{mockStamps.length}</span>{' '}
            개
          </p>
          <GoalStampBoard stamps={mockStamps} />
        </div>
        <div className="w-full max-w-1/2">
          <GoalBehaviorList />
        </div>
      </div>
    </div>
  );
}
