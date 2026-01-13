import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useGoals } from '@/features/goal/hooks/useGoals';
import { useAllBehaviors } from '@/features/goal/hooks/useAllBehaviors';
import { AllGoalsPage } from './AllGoalsPage';

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('@/features/goal/hooks/useGoals');
vi.mock('@/features/goal/hooks/useAllBehaviors');

describe('AllGoalsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('목표 로딩 중일 때 로딩 문구를 보여준다', () => {
    vi.mocked(useGoals).mockReturnValue({
      goals: undefined,
      isLoading: true,
    } as any);

    vi.mocked(useAllBehaviors).mockReturnValue({
      allBehaviors: [],
      isLoading: false,
    } as any);

    render(
      <MemoryRouter>
        <AllGoalsPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('목표를 불러오고 있어요...')).toBeInTheDocument();
  });

  it('목표 목록이 렌더링된다', () => {
    vi.mocked(useGoals).mockReturnValue({
      isLoading: false,
      goals: [
        {
          id: 'goal-1',
          title: '건강',
          color: 'mint',
          behaviorCount: 1,
        },
        {
          id: 'goal-2',
          title: '독서',
          color: 'beige',
          behaviorCount: 0,
        },
      ],
    } as any);

    vi.mocked(useAllBehaviors).mockReturnValue({
      allBehaviors: [],
      isLoading: false,
    } as any);

    render(
      <MemoryRouter>
        <AllGoalsPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('전체 목표')).toBeInTheDocument();
    expect(screen.getByText('건강')).toBeInTheDocument();
    expect(screen.getByText('독서')).toBeInTheDocument();
    expect(screen.getByText(/목표를 관리하고 있어요/)).toBeInTheDocument();
  });

  it('전부 펼치기 버튼을 클릭하면 전부 접기로 바뀐다', () => {
    vi.mocked(useGoals).mockReturnValue({
      isLoading: false,
      goals: [
        {
          id: 'goal-1',
          title: '건강',
          color: 'mint',
          behaviorCount: 1,
        },
      ],
    } as any);

    vi.mocked(useAllBehaviors).mockReturnValue({
      allBehaviors: [],
      isLoading: false,
    } as any);

    render(
      <MemoryRouter>
        <AllGoalsPage />
      </MemoryRouter>,
    );

    const toggleButton = screen.getByRole('button', { name: '전부 펼치기' });
    fireEvent.click(toggleButton);

    expect(screen.getByRole('button', { name: '전부 접기' })).toBeInTheDocument();
  });

  it('목표 추가 버튼 클릭 시 /goals/new 로 이동한다', () => {
    vi.mocked(useGoals).mockReturnValue({
      isLoading: false,
      goals: [],
    } as any);

    vi.mocked(useAllBehaviors).mockReturnValue({
      allBehaviors: [],
      isLoading: false,
    } as any);

    render(
      <MemoryRouter>
        <AllGoalsPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: '목표 추가' }));

    expect(navigateMock).toHaveBeenCalledWith('/goals/new');
  });
});
