import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { IndexPage } from './IndexPage';

vi.mock('@/stores/useDodoChatStore', () => ({
  default: () => ({
    quote: '오늘도 화이팅',
    resetQuote: vi.fn(),
  }),
}));

describe('IndexPage', () => {
  it('IndexPage가 크래시 없이 렌더링된다', () => {
    render(<IndexPage />);

    expect(screen.getAllByText('물 2L 마시기')).toHaveLength(4);
  });
});
