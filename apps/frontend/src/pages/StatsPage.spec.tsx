import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { fetchTopBehaviors } from '@/features/stat/apis/fetchTopBehaviors.api';
import { fetchTotalCompletedCount } from '@/features/stat/apis/fetchTotalCompletedCount.api';
import { StatsPage } from './StatsPage';

// API mock
vi.mock('@/features/stat/apis/fetchTopBehaviors.api', () => ({
  fetchTopBehaviors: vi.fn(),
}));

vi.mock('@/features/stat/apis/fetchTotalCompletedCount.api', () => ({
  fetchTotalCompletedCount: vi.fn(),
}));

vi.mock('@nivo/pie', () => ({
  ResponsivePie: () => <div data-testid="pie-chart" />,
}));

// SwiperTabs mock
vi.mock('@/features/behavior/components/SwiperTabs', () => ({
  SwiperTabs: ({ tabs, onChange }: any) => (
    <div>
      {tabs.map((tab: any) => (
        <button
          type="button"
          key={tab.value}
          data-testid={`tab-${tab.value}`}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  ),
}));

const mockResponse = {
  all: {
    totalCount: 10,
    items: [
      {
        id: 'b1',
        behaviorTitle: '운동',
        behaviorDifficulty: '몰입하기',
        goalTitle: '건강',
        goalColor: 'mint',
        count: 6,
      },
      {
        id: 'b2',
        behaviorTitle: '독서',
        behaviorDifficulty: '이어가기',
        goalTitle: '성장',
        goalColor: 'lavender',
        count: 4,
      },
    ],
  },
  goals: [
    {
      id: 'g1',
      goalTitle: '건강',
      goalColor: 'mint',
      totalCount: 6,
      items: [
        {
          id: 'b1',
          behaviorTitle: '운동',
          behaviorDifficulty: '몰입하기',
          count: 6,
        },
      ],
    },
  ],
};

describe('StatsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchTopBehaviors).mockResolvedValue(mockResponse as any);
    vi.mocked(fetchTotalCompletedCount).mockResolvedValue({
      totalCompletedCount: 184,
    } as any);
  });

  it('마운트 시 fetchTopBehaviors가 호출된다', async () => {
    render(<StatsPage />);

    expect(fetchTopBehaviors).toHaveBeenCalledTimes(1);

    // 데이터 로딩 확인
    expect(await screen.findByText('운동')).toBeInTheDocument();
  });

  it('기본 상태(ALL)에서 전체 행동이 렌더링된다', async () => {
    render(<StatsPage />);

    expect(await screen.findByText('운동')).toBeInTheDocument();
    expect(screen.getByText('독서')).toBeInTheDocument();

    // 차트 렌더 확인
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('goal 탭 클릭 시 해당 goal 데이터만 표시된다', async () => {
    render(<StatsPage />);

    // 초기 데이터 로딩
    await screen.findByText('운동');

    // 건강(goal g1) 탭 클릭
    fireEvent.click(screen.getByTestId('tab-g1'));

    // 운동은 남고
    expect(screen.getByText('운동')).toBeInTheDocument();

    // 독서는 사라짐
    expect(screen.queryByText('독서')).not.toBeInTheDocument();
  });

  it('goal → ALL로 다시 전환하면 전체 데이터가 다시 표시된다', async () => {
    render(<StatsPage />);

    await screen.findByText('운동');

    // goal 클릭
    fireEvent.click(screen.getByTestId('tab-g1'));
    expect(screen.queryByText('독서')).not.toBeInTheDocument();

    // ALL 클릭
    fireEvent.click(screen.getByTestId('tab-ALL'));

    expect(screen.getByText('운동')).toBeInTheDocument();
    expect(screen.getByText('독서')).toBeInTheDocument();
  });
});
