import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StatsPage } from './StatsPage';

vi.mock('@nivo/pie', async () => {
  const actual = await vi.importActual<any>('@nivo/pie');
  return {
    ...actual,
    ResponsivePie: ({ data, onMouseEnter, onMouseLeave }: any) => (
      <div data-testid="pie-chart">
        {data.map((d: any) => (
          <button
            type="button"
            key={d.id}
            data-testid={`pie-${d.id}`}
            onMouseEnter={() => onMouseEnter?.({ id: d.id })}
            onMouseLeave={() => onMouseLeave?.()}
          >
            {d.label}
          </button>
        ))}
      </div>
    ),
  };
});

describe('StatsPage', () => {
  it('페이지가 정상 렌더링된다', () => {
    render(<StatsPage />);
    expect(screen.getByText(/지금까지 행동을 총/i)).toBeInTheDocument();
  });

  it('리스트 hover 시 active 스타일이 적용된다', () => {
    render(<StatsPage />);

    const listButtons = screen.getAllByRole('button');

    const listItem = listButtons.find(
      (el) => el.textContent?.includes('물 한 잔 마시기') && !el.dataset.testid?.startsWith('pie'),
    )!;

    fireEvent.mouseEnter(listItem);
    expect(listItem.className).toContain('scale-[1.02]');

    fireEvent.mouseLeave(listItem);
    expect(listItem.className).not.toContain('scale-[1.02]');
  });

  it('파이 hover 시 리스트와 동일한 activeId 흐름을 탄다', () => {
    render(<StatsPage />);

    const pieSlice = screen.getByTestId('pie-b1');
    fireEvent.mouseEnter(pieSlice);

    const listButtons = screen.getAllByRole('button');
    const listItem = listButtons.find(
      (el) => el.textContent?.includes('물 한 잔 마시기') && el.className.includes('scale-[1.02]'),
    );

    expect(listItem).toBeTruthy();
  });

  it('goal 탭 선택 시 goalTitle이 사라진다', () => {
    render(<StatsPage />);

    const goalTab = screen.getByRole('button', { name: '건강 관리' });
    fireEvent.click(goalTab);

    expect(screen.queryByText('건강 관리')).toBeInTheDocument();

    const goalTitles = screen.queryAllByText('건강 관리');
    expect(goalTitles.length).toBeLessThan(2);
  });
});
