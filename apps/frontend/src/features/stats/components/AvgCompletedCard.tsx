import { StatInsightCardShell } from './StatInsightCardShell';

type AvgCompletedCardProps = {
  value: number;
};

const formatCount = (value: number) => (Number.isInteger(value) ? String(value) : value.toFixed(1));

export function AvgCompletedCard({ value }: AvgCompletedCardProps) {
  const main = `일 평균 ${formatCount(value)}회 수행했어요.`;
  const sub = '최근 7일 기준이에요.';

  return <StatInsightCardShell main={main} sub={sub} />;
}
