import type { CountDegree } from '@web24/shared';
import { StatInsightCardShell } from './StatInsightCardShell';

type GoalBehaviorCountCardProps = {
  goalDegree: CountDegree;
  behaviorDegree: CountDegree;
};

const DEGREE_LABELS: Record<CountDegree, string> = {
  MUCH_LESS: '아주 적은 편',
  LESS: '적은 편',
  NEUTRAL: '보통',
  MORE: '많은 편',
  MUCH_MORE: '아주 많은 편',
};

export function GoalBehaviorCountCard({ goalDegree, behaviorDegree }: GoalBehaviorCountCardProps) {
  const main = `목표 규모가 ${DEGREE_LABELS[goalDegree]}이에요.`;
  const sub = `행동은 ${DEGREE_LABELS[behaviorDegree]}이에요.`;

  return <StatInsightCardShell main={main} sub={sub} />;
}
