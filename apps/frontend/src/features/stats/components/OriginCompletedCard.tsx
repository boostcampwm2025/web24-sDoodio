import { StatInsightCardShell } from './StatInsightCardShell';

type OriginCompletedCardProps = {
  counts: Record<'system' | 'user', number>;
};

export function OriginCompletedCard({ counts }: OriginCompletedCardProps) {
  const total = counts.system + counts.user;
  let main = '골고루 잘 하고 있어요';

  if (total === 0) {
    main = '아직 기록이 없어요';
  } else if (counts.system > counts.user) {
    main = '두두만 믿고 따라오세요!';
  } else if (counts.user > counts.system) {
    main = '지조있으신 분이군요!';
  }

  const sub =
    total === 0
      ? '조금 더 쌓이면 알려드릴게요'
      : `추출한 행동 완료 ${counts.system}회 · 직접 추가한 행동 완료 ${counts.user}회`;

  return <StatInsightCardShell main={main} sub={sub} />;
}
