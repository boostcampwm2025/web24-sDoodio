import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AllGoalsPage } from './AllGoalsPage';

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe('AllGoalsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('목표 로딩 중일 때 로딩 문구를 보여준다', () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AllGoalsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText('목표를 불러오고 있어요...')).toBeInTheDocument();
  });

  it('목표 목록이 렌더링된다', () => {
    const queryClient = new QueryClient();

    queryClient.setQueryData(
      ['goals'],
      [
        { id: 'goal-1', title: '건강', color: 'mint', behaviorCount: 1 },
        { id: 'goal-2', title: '독서', color: 'beige', behaviorCount: 0 },
      ],
    );

    queryClient.setQueryData(['allBehaviors'], []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AllGoalsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText('전체 목표')).toBeInTheDocument();
    expect(screen.getByText('건강')).toBeInTheDocument();
    expect(screen.getByText('독서')).toBeInTheDocument();
    expect(screen.getByText(/목표를 관리하고 있어요/)).toBeInTheDocument();
  });

  it('전부 펼치기 버튼을 클릭하면 전부 접기로 바뀐다', async () => {
    const queryClient = new QueryClient();

    queryClient.setQueryData(
      ['goals'],
      [
        {
          id: 'goal-1',
          title: '건강',
          color: 'mint',
          behaviorCount: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    );

    queryClient.setQueryData(['allBehaviors', { isAllExpanded: false }], []);
    queryClient.setQueryData(['allBehaviors', { isAllExpanded: true }], []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AllGoalsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const toggleButton = await screen.findByRole('button', { name: '전부 펼치기' });

    fireEvent.click(toggleButton);

    const collapsedButton = await screen.findByRole('button', { name: '전부 접기' });
    expect(collapsedButton).toBeInTheDocument();
  });
  it('목표 추가 버튼 클릭 시 /goals/new 로 이동한다', () => {
    const queryClient = new QueryClient();

    queryClient.setQueryData(['goals'], []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AllGoalsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /목표 추가/ }));

    expect(navigateMock).toHaveBeenCalledWith('/goals/new');
  });
});
