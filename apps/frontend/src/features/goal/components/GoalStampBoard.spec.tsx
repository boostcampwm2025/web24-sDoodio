import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import type { GoalStamp } from '@web24/shared';
import { GoalStampBoard } from './GoalStampBoard';

describe('GoalStampBoard', () => {
  const stamps: GoalStamp[] = [
    { id: 'stamp-1', title: '행동 1', difficulty: '몰입하기', source: 'today' },
    { id: 'stamp-2', title: '행동 2', difficulty: '이어가기', source: 'today' },
    { id: 'stamp-3', title: '행동 3', difficulty: '마음열기', source: 'today' },
    { id: 'stamp-4', title: '행동 4', difficulty: '시작하기', source: 'today' },
  ];

  it('스탬프 개수만큼 버튼을 렌더링한다', () => {
    render(<GoalStampBoard stamps={stamps} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(stamps.length);
  });

  it('초기 렌더 시 하나의 두두 스탬프만 존재한다', () => {
    render(<GoalStampBoard stamps={stamps} />);

    const dodos = screen.getAllByLabelText('dodo-stamp');
    expect(dodos).toHaveLength(1);
  });

  it('두두 스탬프 클릭 시 두두 위치가 변경된다', async () => {
    render(<GoalStampBoard stamps={stamps} />);

    const before = screen.getByLabelText('dodo-stamp');
    fireEvent.click(before);

    await waitFor(() => {
      const after = screen.getByLabelText('dodo-stamp');
      expect(after).not.toBe(before);
    });
  });

  it('일반 스탬프 클릭 시 두두 위치는 변경되지 않는다', () => {
    render(<GoalStampBoard stamps={stamps} />);

    const before = screen.getByLabelText('dodo-stamp');

    const normalStamp = screen
      .getAllByRole('button')
      .find((btn) => btn.getAttribute('aria-label') === 'stamp')!;

    fireEvent.click(normalStamp);

    const after = screen.getByLabelText('dodo-stamp');
    expect(after).toBe(before);
  });
});
