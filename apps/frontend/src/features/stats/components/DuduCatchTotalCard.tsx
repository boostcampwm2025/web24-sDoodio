import { StatInsightCardShell } from './StatInsightCardShell';

type DuduCatchTotalCardProps = {
  count: number;
};

export function DuduCatchTotalCard({ count }: DuduCatchTotalCardProps) {
  let main = '아직 두두를 만나지 못했어요.';
  let sub = '조금 더 쌓이면 알려드릴게요.';

  if (count > 0) {
    main = `두두를 ${count}번 잡았어요.`;
    sub = '최근 집계 기준이에요.';
  }

  return <StatInsightCardShell main={main} sub={sub} />;
}
