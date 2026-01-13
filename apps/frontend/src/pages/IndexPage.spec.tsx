import { it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { fetchTodayBehaviors } from '@/features/behavior/apis/fetchBehaviors.api';
import { fetchGoals } from '@/features/goal/apis/fetchGoals.api';
import { IndexPage } from './IndexPage';

vi.mock('@/features/behavior/apis/fetchBehaviors.api');
vi.mock('@/features/goal/apis/fetchGoals.api');

vi.mock('@/stores/useDodoChatStore', () => ({
  default: () => ({
    quote: '테스트용 문구',
    resetQuote: vi.fn(),
  }),
}));

it('IndexPage가 크래시 없이 렌더링된다', async () => {
  vi.mocked(fetchTodayBehaviors).mockResolvedValue([
    {
      id: 'b1',
      title: '물 2L 마시기',
      isChecked: false,
      goalTitle: '건강',
      goalColor: 'mint',
      difficulty: '몰입하기',
      isRecommended: true,
    },
  ]);

  vi.mocked(fetchGoals).mockResolvedValue([
    {
      id: 'g1',
      title: '건강',
      color: 'mint',
      behaviorCount: 0,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  ]);

  render(
    <MemoryRouter>
      <IndexPage />
    </MemoryRouter>,
  );

  expect(await screen.findByText('테스트용 문구')).toBeInTheDocument();
});
