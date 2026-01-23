import { StatInsightCardShell } from './StatInsightCardShell';

type CheckInTotalCardProps = {
  count: number;
};

export function CheckInTotalCard({ count }: CheckInTotalCardProps) {
  let main = '아직 접속 기록이 없어요.';
  let sub = '조금 더 쌓이면 알려드릴게요.';

  if (count > 0) {
    main = `지금까지 ${count}번 접속했어요.`;
    sub = '최근 집계 기준이에요.';
  }

  return <StatInsightCardShell main={main} sub={sub} />;
}
