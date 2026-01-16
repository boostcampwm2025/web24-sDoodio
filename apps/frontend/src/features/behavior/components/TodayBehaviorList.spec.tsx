import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import type { Behavior } from '@/shared/components/behavior/BehaviorCard.types';
import { TodayBahaviorList } from './TodayBehaviorList';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock SwiperTabs
vi.mock('./SwiperTabs', () => ({
  SwiperTabs: ({ tabs, onChange }: { tabs: string[]; onChange: (val: string) => void }) => (
    <div data-testid="swiper-tabs">
      {tabs.map((tab) => (
        <button type="button" key={tab} onClick={() => onChange(tab)}>
          {tab}
        </button>
      ))}
    </div>
  ),
}));

const renderWithRouter = (ui: React.ReactElement) => render(ui, { wrapper: BrowserRouter });

describe('TodayBehaviorList', () => {
  const mockBehaviors: Behavior[] = [
    {
      id: '1',
      title: 'Behavior 1',
      goalTitle: '운동',
      goalColor: 'mint',
      isChecked: false,
      difficulty: '몰입하기',
      isRecommended: false,
    },
    {
      id: '2',
      title: 'Behavior 2',
      goalTitle: '독서',
      goalColor: 'blue',
      isChecked: true,
      difficulty: '마음열기',
      isRecommended: false,
    },
  ];
  const mockGoals = ['운동', '독서'];

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('헤더에 올바른 제목과 행동 개수를 표시한다', () => {
    renderWithRouter(
      <TodayBahaviorList goals={mockGoals} behaviors={mockBehaviors} onToggle={vi.fn()} />,
    );
    expect(screen.getByText('오늘의 행동')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('전체 행동 리스트를 기본으로 렌더링한다', () => {
    renderWithRouter(
      <TodayBahaviorList goals={mockGoals} behaviors={mockBehaviors} onToggle={vi.fn()} />,
    );
    expect(screen.getByText('Behavior 1')).toBeInTheDocument();
    expect(screen.getByText('Behavior 2')).toBeInTheDocument();
  });

  it('목표 탭을 클릭하면 필터링된 행동 리스트를 보여준다', () => {
    renderWithRouter(
      <TodayBahaviorList goals={mockGoals} behaviors={mockBehaviors} onToggle={vi.fn()} />,
    );

    const swiperTabs = screen.getByTestId('swiper-tabs');
    const exerciseTab = within(swiperTabs).getByText('운동');
    fireEvent.click(exerciseTab);

    expect(screen.getByText('Behavior 1')).toBeInTheDocument();
    expect(screen.queryByText('Behavior 2')).not.toBeInTheDocument();
  });

  it('행동 카드를 클릭하면 onToggle이 호출된다', () => {
    const onToggleMock = vi.fn();
    renderWithRouter(
      <TodayBahaviorList goals={mockGoals} behaviors={mockBehaviors} onToggle={onToggleMock} />,
    );

    const toggleButton = screen.getByLabelText('Behavior 1 완료 토글');
    fireEvent.click(toggleButton);

    expect(onToggleMock).toHaveBeenCalledWith('1');
  });

  it('추가 버튼 클릭 시 새 목표 페이지로 이동한다', () => {
    renderWithRouter(
      <TodayBahaviorList goals={mockGoals} behaviors={mockBehaviors} onToggle={vi.fn()} />,
    );

    const addButton = screen.getByRole('button', { name: '목표' });
    fireEvent.click(addButton);

    expect(mockNavigate).toHaveBeenCalledWith('/goals/new');
  });
});
