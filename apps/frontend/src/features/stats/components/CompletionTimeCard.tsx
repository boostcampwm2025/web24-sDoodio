import type { CompletionTimeBucket } from '@web24/shared';
import { StatInsightCardShell } from './StatInsightCardShell';

type CompletionTimeCardProps = {
  buckets: Record<CompletionTimeBucket, number>;
};

export function CompletionTimeCard({ buckets }: CompletionTimeCardProps) {
  const entries = Object.entries(buckets);
  const [topBucket, topValue] = entries.reduce(
    (max, entry) => (entry[1] > max[1] ? entry : max),
    entries[0] ?? ['1~7', 0],
  );

  const hasData = Number(topValue) > 0;
  const main = hasData
    ? `가장 많이 완료한 시간대는 ${topBucket}시예요.`
    : '완료 기록이 아직 없어요.';
  const sub = hasData ? '완료 시간을 기준으로 집계했어요.' : '조금 더 쌓이면 알려드릴게요.';

  return <StatInsightCardShell main={main} sub={sub} />;
}
