import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TodayBehaviorRatioSlider } from './TodayBehaviorRatioSlider';

// Mock debounce to execute immediately for testing
vi.mock('@/shared/utils/debounce', () => ({
  debounce: (fn: Function) => fn,
}));

describe('TodayBehaviorRatioSlider', () => {
  const mockUpdateBehaviorRatio = vi.fn();
  const user = {
    behaviorRatio: 0.6,
  } as any;

  it('초기값이 user의 behaviorRatio로 설정된다', () => {
    render(<TodayBehaviorRatioSlider user={user} updateBehaviorRatio={mockUpdateBehaviorRatio} />);

    const slider = screen.getByRole('slider') as HTMLInputElement;
    expect(parseFloat(slider.value)).toBe(0.6);
  });

  it('슬라이더 변경 시 updateBehaviorRatio가 호출된다', async () => {
    render(<TodayBehaviorRatioSlider user={user} updateBehaviorRatio={mockUpdateBehaviorRatio} />);

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '0.8' } });

    expect(mockUpdateBehaviorRatio).toHaveBeenCalledWith(0.8);
  });
});
