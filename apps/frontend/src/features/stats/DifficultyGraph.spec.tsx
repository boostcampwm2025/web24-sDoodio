import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DifficultyGraph } from './DifficultyGraph';
import { fetchDifficultyStats } from './apis/fetchDifficultyStats.api';

vi.mock('./apis/fetchDifficultyStats.api', () => ({
  fetchDifficultyStats: vi.fn(),
}));

describe('DifficultyGraph', () => {
  const mockStats = [
    { 마음열기: 2, 시작하기: 3, 이어가기: 1, 몰입하기: 0, AI: 0 },
    { 마음열기: 1, 시작하기: 2, 이어가기: 4, 몰입하기: 2, AI: 0 },
    { 마음열기: 0, 시작하기: 0, 이어가기: 0, 몰입하기: 0, AI: 0 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('로딩 중일 때 로딩 메시지를 표시한다', () => {
    (fetchDifficultyStats as any).mockReturnValue(new Promise(() => {}));
    render(<DifficultyGraph />);
    expect(screen.getByText('데이터를 불러오는 중...')).toBeInTheDocument();
  });

  it('데이터가 없을 때 대체 메시지를 표시한다', async () => {
    (fetchDifficultyStats as any).mockResolvedValue([]);
    render(<DifficultyGraph />);
    await waitFor(() => {
      expect(screen.getByText('조금 더 쌓이면 보여줄 수 있어요.')).toBeInTheDocument();
    });
  });

  it('데이터가 있을 때 그래프와 통계를 표시한다', async () => {
    (fetchDifficultyStats as any).mockResolvedValue(mockStats);
    render(<DifficultyGraph />);

    await waitFor(() => {
      expect(screen.getByText('일주일 동안 이만큼 해내셨네요!')).toBeInTheDocument();
    });

    // 전체 개수 확인 (2+3+1 + 1+2+4+2 + 0 = 15)
    expect(screen.getByText('총 15회')).toBeInTheDocument();

    // 각 난이도별 합계 확인
    // 마음열기: 2+1 = 3
    // 시작하기: 3+2 = 5
    // 이어가기: 1+4 = 5
    // 몰입하기: 0+2 = 2
    expect(screen.getByText('3회')).toBeInTheDocument();
    expect(screen.getAllByText('5회')).toHaveLength(2);
    expect(screen.getByText('2회')).toBeInTheDocument();
  });

  it('막대를 클릭하면 해당 날짜 데이터만 표시한다', async () => {
    (fetchDifficultyStats as any).mockResolvedValue(mockStats);
    render(<DifficultyGraph />);

    await waitFor(() => {
      expect(screen.getByText('어제')).toBeInTheDocument();
    });

    // 막대(버튼)를 찾아 클릭. labels[2] 가 '어제'임.
    // 버튼을 찾기 위해 role="button"을 사용할 수도 있음.
    const bars = screen.getAllByRole('button');
    // stats.length 가 3이므로 버튼은 3개여야 함
    expect(bars).toHaveLength(3);

    // 첫 번째 막대 클릭 (mockStats[0])
    fireEvent.click(bars[0]);

    // labels[0]은 '3일 전' (stats.length가 3일 때)
    expect(screen.getByText('3일 전에는 이만큼 해내셨네요!')).toBeInTheDocument();

    // 첫 번째 데이터 합계: 2+3+1 = 6
    expect(screen.getByText('총 6회')).toBeInTheDocument();
    expect(screen.getByText('2회')).toBeInTheDocument(); // 마음열기
    expect(screen.getByText('3회')).toBeInTheDocument(); // 시작하기
    expect(screen.getByText('1회')).toBeInTheDocument(); // 이어가기
  });

  it('막대를 다시 클릭하면 전체 통계로 복구된다', async () => {
    (fetchDifficultyStats as any).mockResolvedValue(mockStats);
    render(<DifficultyGraph />);

    await waitFor(() => {
      expect(screen.getByText('어제')).toBeInTheDocument();
    });

    const bars = screen.getAllByRole('button');
    fireEvent.click(bars[0]);
    expect(screen.getByText('3일 전에는 이만큼 해내셨네요!')).toBeInTheDocument();

    fireEvent.click(bars[0]);
    expect(screen.getByText('일주일 동안 이만큼 해내셨네요!')).toBeInTheDocument();
    expect(screen.getByText('총 15회')).toBeInTheDocument();
  });
});
