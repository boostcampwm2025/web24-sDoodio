import { BEHAVIOR_DIFFICULTIES, type BehaviorDifficulty } from '@web24/shared';
import { StatInsightCardShell } from './StatInsightCardShell';

type WeeklyDifficultyCardProps = {
  counts: Record<BehaviorDifficulty, number>;
};

const NON_AI_DIFFICULTIES = BEHAVIOR_DIFFICULTIES.filter((diff) => diff !== 'AI');

export function WeeklyDifficultyCard({ counts }: WeeklyDifficultyCardProps) {
  const total = NON_AI_DIFFICULTIES.reduce((sum, diff) => sum + (counts[diff] ?? 0), 0);
  let main = '이번 주에는 아직 수행 기록이 없어요.';
  let sub = '조금 더 쌓이면 알려드릴게요.';

  if (total > 0) {
    const topDifficulty = NON_AI_DIFFICULTIES.reduce((top, diff) =>
      counts[diff] > counts[top] ? diff : top,
    );
    main = `이번 주에는 ${topDifficulty}가 가장 많았어요.`;
    sub = `이번 주 총 ${total}회 수행했어요.`;
  }

  return <StatInsightCardShell main={main} sub={sub} />;
}
