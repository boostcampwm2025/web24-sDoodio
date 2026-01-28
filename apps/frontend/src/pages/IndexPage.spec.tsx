import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { IndexPage } from './IndexPage';

vi.mock('@/stores/useDodoChatStore', () => ({
  default: () => ({
    quote: '오늘도 화이팅',
    resetQuote: vi.fn(),
  }),
}));

vi.mock('@/features/behavior/apis/fetchBehaviors.api', () => ({
  fetchTodayBehaviors: vi.fn().mockResolvedValue([
    {
      id: '55555555-5555-4555-8555-555555555555',
      title: '물 2L 마시기',
      goalTitle: '건강한 생활',
      goalColor: 'mint',
      isChecked: false,
      difficulty: '몰입하기',
      isRecommended: true,
    },
  ]),
}));

vi.mock('@/features/goal/apis/fetchGoals.api', () => ({
  fetchGoals: vi.fn().mockResolvedValue([
    {
      id: 'goal-1',
      title: '건강한 생활',
      color: 'mint',
      createdAt: '2026-01-08T12:29:52.365Z',
      updatedAt: '2026-01-08T12:29:52.365Z',
    },
  ]),
}));

// useDodoToastStore 모킹
vi.mock('@/stores/useDodoToastStore', () => ({
  default: vi.fn(),
}));

describe('IndexPage', () => {
  const originalMatchMedia = window.matchMedia;

  beforeAll(() => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterAll(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('IndexPage가 크래시 없이 렌더링된다', async () => {
    // useDodoToastStore가 반환할 showToast 모킹
    const showToastMock = vi.fn();
    (
      (await import('@/stores/useDodoToastStore')).default as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      showToast: showToastMock,
    });

    render(
      <MemoryRouter>
        <IndexPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText('물 2L 마시기')).toBeInTheDocument();
  });
});
