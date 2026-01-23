import { BEHAVIOR_DIFFICULTIES, type BehaviorDifficulty } from '@web24/shared';
import { StatInsightCardShell } from './StatInsightCardShell';

type DailyDifficultyCardProps = {
  counts: Record<BehaviorDifficulty, number>;
};

const NON_AI_DIFFICULTIES = BEHAVIOR_DIFFICULTIES.filter((diff) => diff !== 'AI');

export function DailyDifficultyCard({ counts }: DailyDifficultyCardProps) {
  const total = NON_AI_DIFFICULTIES.reduce((sum, diff) => sum + (counts[diff] ?? 0), 0);
  let main = '어제는 아직 수행 기록이 없어요.';
  let sub = '조금 더 쌓이면 알려드릴게요.';

  if (total > 0) {
    const topDifficulty = NON_AI_DIFFICULTIES.reduce((top, diff) =>
      counts[diff] > counts[top] ? diff : top,
    );
    main = `어제 가장 많이 한 난이도는 ${topDifficulty}예요.`;
    sub = `어제 총 ${total}회 수행했어요.`;
  }

  return <StatInsightCardShell main={main} sub={sub} />;
}
