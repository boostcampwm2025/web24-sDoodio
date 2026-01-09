import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
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
      id: '1',
      title: '물 2L 마시기',
      goalTitle: '건강한 생활',
      goalColor: 'bg-goal-mint',
      isChecked: false,
      difficulty: '몰입하기',
      isRecommended: true,
    },
  ]),
}));

describe('IndexPage', () => {
  it('IndexPage가 크래시 없이 렌더링된다', async () => {
    render(
      <MemoryRouter>
        <IndexPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText('물 2L 마시기')).toBeInTheDocument();
  });
});
