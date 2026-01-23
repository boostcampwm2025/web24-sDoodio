import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { AllBehaviorStatItem, GoalBehaviorStat } from '@web24/shared';
import { AccumulatedBehaviorStats } from './AccumulatedBehaviorStats';

vi.mock('@nivo/pie', () => ({
  ResponsivePie: () => <div data-testid="pie-chart" />,
}));

vi.mock('@/features/behavior/components/SwiperTabs', () => ({
  SwiperTabs: ({ tabs, onChange }: any) => (
    <div>
      {tabs.map((tab: any) => (
        <button type="button" key={tab.value} onClick={() => onChange(tab.value)}>
          {tab.label}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('@/shared/components/behavior/DifficultyBadge', () => ({
  DifficultyBadge: ({ level }: any) => <span>{level}</span>,
}));

describe('AccumulatedBehaviorStats', () => {
  const allTopBehaviors: AllBehaviorStatItem = {
    totalCount: 10,
    items: [
      {
        id: 'b1',
        behaviorTitle: '행동 A',
        behaviorDifficulty: '시작하기',
        count: 6,
        goalTitle: '목표 1',
        goalColor: 'pink',
      },
      {
        id: 'b2',
        behaviorTitle: '행동 B',
        behaviorDifficulty: '이어가기',
        count: 4,
        goalTitle: '목표 2',
        goalColor: 'blue',
      },
    ],
  };

  const goalTopBehaviors: GoalBehaviorStat[] = [
    {
      id: 'g1',
      goalTitle: '목표 1',
      goalColor: 'pink',
      totalCount: 6,
      items: [
        {
          id: 'b1',
          behaviorTitle: '행동 A',
          behaviorDifficulty: '시작하기',
          count: 6,
        },
      ],
    },
    {
      id: 'g2',
      goalTitle: '목표 2',
      goalColor: 'blue',
      totalCount: 4,
      items: [
        {
          id: 'b2',
          behaviorTitle: '행동 B',
          behaviorDifficulty: '이어가기',
          count: 4,
        },
      ],
    },
  ];

  it('기본으로 ALL 데이터가 렌더링된다', () => {
    render(
      <AccumulatedBehaviorStats
        allTopBehaviors={allTopBehaviors}
        goalTopBehaviors={goalTopBehaviors}
      />,
    );

    expect(screen.getByText('행동 A')).toBeInTheDocument();
    expect(screen.getByText('행동 B')).toBeInTheDocument();
    expect(screen.getByText('6회')).toBeInTheDocument();
    expect(screen.getByText('4회')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('goal 탭 클릭 시 해당 goal 데이터만 표시된다', () => {
    render(
      <AccumulatedBehaviorStats
        allTopBehaviors={allTopBehaviors}
        goalTopBehaviors={goalTopBehaviors}
      />,
    );

    fireEvent.click(screen.getAllByText('목표 1')[0]);

    expect(screen.getByText('행동 A')).toBeInTheDocument();
    expect(screen.queryByText('행동 B')).not.toBeInTheDocument();
  });

  it('goal → ALL로 다시 전환하면 전체 데이터가 다시 표시된다', () => {
    render(
      <AccumulatedBehaviorStats
        allTopBehaviors={allTopBehaviors}
        goalTopBehaviors={goalTopBehaviors}
      />,
    );

    fireEvent.click(screen.getAllByText('목표 1')[0]);
    fireEvent.click(screen.getByText('ALL'));

    expect(screen.getByText('행동 A')).toBeInTheDocument();
    expect(screen.getByText('행동 B')).toBeInTheDocument();
  });
});
