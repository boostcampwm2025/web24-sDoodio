import { StatInsightCardShell } from './StatInsightCardShell';

type NotDoneCountsCardProps = {
  counts: Record<'system' | 'user', number>;
};

export function NotDoneCountsCard({ counts }: NotDoneCountsCardProps) {
  const total = counts.system + counts.user;
  let main = '미완료 행동이 없어요.';
  let sub = '잘 해내고 있어요.';

  if (total > 0) {
    main = `완료하지 못한 행동이 ${total}개 있어요.`;
    sub = `추출 ${counts.system}개 · 직접 ${counts.user}개`;
  }

  return <StatInsightCardShell main={main} sub={sub} />;
}
