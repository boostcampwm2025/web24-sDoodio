import { BEHAVIOR_DIFFICULTIES, type BehaviorDifficulty } from '@web24/shared';
import { StatInsightCardShell } from './StatInsightCardShell';

type TotalDifficultyCardProps = {
  counts: Record<BehaviorDifficulty, number>;
};

const NON_AI_DIFFICULTIES = BEHAVIOR_DIFFICULTIES.filter((diff) => diff !== 'AI');

export function TotalDifficultyCard({ counts }: TotalDifficultyCardProps) {
  const total = NON_AI_DIFFICULTIES.reduce((sum, diff) => sum + (counts[diff] ?? 0), 0);
  let main = '아직 누적 수행 기록이 없어요.';
  let sub = '조금 더 쌓이면 알려드릴게요.';

  if (total > 0) {
    const topDifficulty = NON_AI_DIFFICULTIES.reduce(
      (top, diff) => (counts[diff] > counts[top] ? diff : top),
      NON_AI_DIFFICULTIES[0] ?? '마음열기',
    );
    main = `누적 기준으로 ${topDifficulty}가 가장 많아요.`;
    sub = `지금까지 총 ${total}회 수행했어요.`;
  }

  return <StatInsightCardShell main={main} sub={sub} />;
}
