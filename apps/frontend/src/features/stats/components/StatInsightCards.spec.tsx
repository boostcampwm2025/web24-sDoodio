import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AvgRefreshCard } from './AvgRefreshCard';
import { AvgCompletedCard } from './AvgCompletedCard';
import { OriginCompletedCard } from './OriginCompletedCard';
import { GoalBehaviorCountCard } from './GoalBehaviorCountCard';
import { CheckInTotalCard } from './CheckInTotalCard';
import { DuduCatchTotalCard } from './DuduCatchTotalCard';
import { CompletionTimeCard } from './CompletionTimeCard';
import { DailyDifficultyCard } from './DailyDifficultyCard';
import { WeeklyDifficultyCard } from './WeeklyDifficultyCard';
import { TotalDifficultyCard } from './TotalDifficultyCard';
import { NotDoneCountsCard } from './NotDoneCountsCard';

describe('Stat insight cards', () => {
  const difficultyCounts = {
    마음열기: 1,
    시작하기: 2,
    이어가기: 3,
    몰입하기: 4,
    AI: 0,
  };

  const completionBuckets = {
    '1~7': 1,
    '7~10': 2,
    '10~17': 0,
    '17~20': 5,
    '20~1': 3,
  };

  it('AvgRefreshCard가 평균 새로고침 문구를 표시한다', () => {
    render(<AvgRefreshCard value={3.5} />);
    expect(screen.getByText('일 평균 3.5회 새로고침했어요.')).toBeInTheDocument();
    expect(screen.getByText('최근 7일 기준이에요.')).toBeInTheDocument();
  });

  it('AvgCompletedCard가 평균 수행 문구를 표시한다', () => {
    render(<AvgCompletedCard value={2} />);
    expect(screen.getByText('일 평균 2회 수행했어요.')).toBeInTheDocument();
    expect(screen.getByText('최근 7일 기준이에요.')).toBeInTheDocument();
  });

  it('OriginCompletedCard가 추출 완료가 많은 경우 문구를 표시한다', () => {
    render(<OriginCompletedCard counts={{ system: 3, user: 1 }} />);
    expect(screen.getByText('두두만 믿고 따라오세요!')).toBeInTheDocument();
    expect(
      screen.getByText('추출한 행동 완료 3회 · 직접 추가한 행동 완료 1회'),
    ).toBeInTheDocument();
  });

  it('GoalBehaviorCountCard가 목표와 행동 규모를 표시한다', () => {
    render(<GoalBehaviorCountCard goalDegree="LESS" behaviorDegree="MORE" />);
    expect(screen.getByText('목표 규모가 적은 편이에요.')).toBeInTheDocument();
    expect(screen.getByText('행동은 많은 편이에요.')).toBeInTheDocument();
  });

  it('CheckInTotalCard가 접속 기록이 없을 때 문구를 표시한다', () => {
    render(<CheckInTotalCard count={0} />);
    expect(screen.getByText('아직 접속 기록이 없어요.')).toBeInTheDocument();
  });

  it('DuduCatchTotalCard가 두두 잡은 횟수를 표시한다', () => {
    render(<DuduCatchTotalCard count={2} />);
    expect(screen.getByText('두두를 2번 잡았어요.')).toBeInTheDocument();
    expect(screen.getByText('최근 집계 기준이에요.')).toBeInTheDocument();
  });

  it('CompletionTimeCard가 가장 많이 완료한 시간대를 표시한다', () => {
    render(<CompletionTimeCard buckets={completionBuckets} />);
    expect(screen.getByText('가장 많이 완료한 시간대는 17~20시예요.')).toBeInTheDocument();
    expect(screen.getByText('완료 시간을 기준으로 집계했어요.')).toBeInTheDocument();
  });

  it('DailyDifficultyCard가 어제 가장 많이 한 난이도를 표시한다', () => {
    render(<DailyDifficultyCard counts={difficultyCounts} />);
    expect(screen.getByText('어제 가장 많이 한 난이도는 몰입하기예요.')).toBeInTheDocument();
    expect(screen.getByText('어제 총 10회 수행했어요.')).toBeInTheDocument();
  });

  it('WeeklyDifficultyCard가 이번 주 난이도 통계를 표시한다', () => {
    render(<WeeklyDifficultyCard counts={difficultyCounts} />);
    expect(screen.getByText('이번 주에는 몰입하기가 가장 많았어요.')).toBeInTheDocument();
    expect(screen.getByText('이번 주 총 10회 수행했어요.')).toBeInTheDocument();
  });

  it('TotalDifficultyCard가 누적 난이도 통계를 표시한다', () => {
    render(<TotalDifficultyCard counts={difficultyCounts} />);
    expect(screen.getByText('누적 기준으로 몰입하기가 가장 많아요.')).toBeInTheDocument();
    expect(screen.getByText('지금까지 총 10회 수행했어요.')).toBeInTheDocument();
  });

  it('NotDoneCountsCard가 미완료 행동 수를 표시한다', () => {
    render(<NotDoneCountsCard counts={{ system: 2, user: 1 }} />);
    expect(screen.getByText('완료하지 못한 행동이 3개 있어요.')).toBeInTheDocument();
    expect(screen.getByText('추출 2개 · 직접 1개')).toBeInTheDocument();
  });
});
