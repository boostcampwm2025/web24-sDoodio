interface StatsContainerProps {
  title: string;
  children: React.ReactNode;
}

function StatsContainer({ title, children }: StatsContainerProps) {
  return (
    <section className="border-primary-weak/60 bg-bg-light/80 flex flex-col gap-3 rounded-3xl border p-5">
      <h2 className="text-heading-2 font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export function StatsPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5 md:pt-2">
      {/* 총 횟수 */}
      <section>
        <h2 className="text-headline-1 font-semibold">
          지금까지 행동을 총 <span className="text-primary-strong text-3xl font-bold">184</span>번
          해냈어요!
        </h2>
      </section>
      {/* 누적 행동 통계 */}
      <StatsContainer title="지금까지 가장 많이한 행동이에요">
        <div className="flex flex-col items-start gap-4 md:flex-row">
          <div className="w-full border p-2 md:w-1/2">그래프 영역</div>
          <div className="flex w-full flex-col border p-2 md:w-1/2">
            <div>리스트 영역</div>
            <button className="ml-auto border" type="button">
              더보기
            </button>
          </div>
        </div>
      </StatsContainer>
      {/* 난이도 통계 */}
      <StatsContainer title="요즘 이런 흐름으로 행동했어요">
        <div className="flex flex-col gap-4">
          <div className="w-full border p-2">그래프 영역</div>
          <div className="flex w-full flex-col border p-2">문장 영역</div>
        </div>
      </StatsContainer>
      {/* 랜덤 통계 */}
      <StatsContainer title="이런 점이 눈에 띄었어요">
        {/* 데스크톱: 2x2 카드, 모바일: 일렬 카드배치 */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="border">카드1</div>
          <div className="border">카드2</div>
          <div className="border">카드3</div>
          <div className="border">카드4</div>
        </div>
      </StatsContainer>
    </div>
  );
}
