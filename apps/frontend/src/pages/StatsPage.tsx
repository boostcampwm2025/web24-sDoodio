import { BarChart3, CalendarDays, CloudRain, Clock3, Users } from 'lucide-react';
import {
  FavoriteCategoryPieCard,
  type CategoryStat,
} from '@/features/stat/components/FavoriteCategoryPieCard';

type BarStat = {
  label: string;
  value: number;
};

type HabitAction = {
  id: string;
  title: string;
  categoryName: string;
  weekdayLabel: string;
  timeBucketLabel: string;
  weatherLabel: string;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat('ko-KR').format(value);
}

export function StatsPage() {
  const allTimeTotal = 412;
  const currentMonthTotal = 86;
  const previousMonthTotal = 71;
  const change = currentMonthTotal - previousMonthTotal;

  const favoriteCategories: CategoryStat[] = [
    { name: '운동', count: 32, color: '#60A5FA' }, // blue-400
    { name: '건강', count: 22, color: '#34D399' }, // emerald-400
    { name: '학습', count: 18, color: '#FBBF24' }, // amber-400
    { name: '마음', count: 14, color: '#A78BFA' }, // violet-400
  ];
  const topCategory = [...favoriteCategories].sort((a, b) => b.count - a.count)[0];

  const weekdayStats: BarStat[] = [
    { label: '월', value: 10 },
    { label: '화', value: 12 },
    { label: '수', value: 16 },
    { label: '목', value: 11 },
    { label: '금', value: 13 },
    { label: '토', value: 14 },
    { label: '일', value: 10 },
  ];

  const timeStats: BarStat[] = [
    { label: '아침 (06~10)', value: 18 },
    { label: '점심 (11~14)', value: 12 },
    { label: '오후 (15~17)', value: 9 },
    { label: '저녁 (18~21)', value: 28 },
    { label: '밤 (22~01)', value: 19 },
  ];

  const topWeekday = weekdayStats.reduce((best, cur) => (cur.value > best.value ? cur : best));
  const topTime = timeStats.reduce((best, cur) => (cur.value > best.value ? cur : best));

  const habitActions: HabitAction[] = [
    {
      id: 'h1',
      title: '물 1.5L 마시기',
      categoryName: '건강',
      weekdayLabel: '수',
      timeBucketLabel: '아침 (06~10)',
      weatherLabel: '비/흐림',
    },
    {
      id: 'h2',
      title: '걷기 1시간',
      categoryName: '운동',
      weekdayLabel: '수',
      timeBucketLabel: '저녁 (18~21)',
      weatherLabel: '비/흐림',
    },
    {
      id: 'h3',
      title: '러닝 20분',
      categoryName: '운동',
      weekdayLabel: '금',
      timeBucketLabel: '아침 (06~10)',
      weatherLabel: '맑음',
    },
    {
      id: 'h4',
      title: '비타민 먹기',
      categoryName: '건강',
      weekdayLabel: '수',
      timeBucketLabel: '점심 (11~14)',
      weatherLabel: '비/흐림',
    },
    {
      id: 'h5',
      title: '10분 독서',
      categoryName: '학습',
      weekdayLabel: '화',
      timeBucketLabel: '밤 (22~01)',
      weatherLabel: '비/흐림',
    },
    {
      id: 'h6',
      title: '감정 한 줄 기록',
      categoryName: '마음',
      weekdayLabel: '일',
      timeBucketLabel: '밤 (22~01)',
      weatherLabel: '비/흐림',
    },
    {
      id: 'h7',
      title: '스트레칭 5분',
      categoryName: '운동',
      weekdayLabel: '수',
      timeBucketLabel: '저녁 (18~21)',
      weatherLabel: '맑음',
    },
  ];

  const bestWeekdayActions = habitActions
    .filter((a) => a.weekdayLabel === topWeekday.label)
    .slice(0, 4);
  const bestTimeActions = habitActions
    .filter((a) => a.timeBucketLabel === topTime.label)
    .slice(0, 4);

  const weatherHintLabel = '비/흐림';
  const weatherHintActions = habitActions
    .filter((a) => a.weatherLabel === weatherHintLabel)
    .slice(0, 4);

  const focusCategoryName = topCategory?.name ?? favoriteCategories[0]?.name ?? '';
  const focusActions = habitActions.filter((a) => a.categoryName === focusCategoryName).slice(0, 4);

  const trendLabel = (() => {
    if (change === 0) return '지난달과 비슷한 속도로 몽글몽글 쌓이고 있어요.';
    if (change > 0) return '지난달보다 조금 더 자주 시작했어요. 빈칸이 없어도 충분해요.';
    return '지난달보다 느슨해졌지만 괜찮아요. 쌓인 기록은 사라지지 않아요.';
  })();

  return (
    <div className="space-y-6">
      {/* <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm">
            <CalendarDays aria-hidden size={14} />
            2025년 12월
          </span>
        </div>
      </header> */}

      <section className="rounded-3xl bg-gray-700 px-5 py-6 text-white shadow-sm md:px-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-200 text-gray-900">
              <span className="text-xs font-extrabold tracking-tight">
                뚜웰의
                <br />한 마디
              </span>
            </div>
            <div className="space-y-2">
              <p>{trendLabel}</p>
              이번 달은 <span className="font-semibold text-white">{topCategory?.name}</span>에서
              특히 자연스럽게 시작했어요. “되는 순간”에 살짝 얹어두면 더 편해져요.
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <header className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-800">이때까지 행동한 총 횟수</h3>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
            <BarChart3 aria-hidden size={18} />
          </div>
        </header>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <p className="text-3xl font-extrabold tracking-tight text-gray-900">
            {formatNumber(allTimeTotal)}회
          </p>
          <p className="text-sm text-gray-600">
            오늘의 한 번이 내일의 ‘시작’을 더 가볍게 만들어요.
          </p>
        </div>
      </section>

      <section className="grid gap-4">
        <FavoriteCategoryPieCard categories={favoriteCategories} />

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <header className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-gray-800">뚜웰 인사이트</h3>
              <p className="text-xs text-gray-500">“언제/어떤 순간에 더 잘 되는지”를 찾아요.</p>
            </div>
          </header>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <CalendarDays aria-hidden size={16} />잘 되는 요일
              </div>
              <p className="mt-2 text-xl font-extrabold tracking-tight text-gray-900">
                {topWeekday.label}요일이 특히 편해요
              </p>
              <p className="mt-1 text-sm text-gray-600">
                바쁜 요일 대신 “되는 날”을 잡아두면 쉬워져요.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {bestWeekdayActions.map((action) => (
                  <span
                    className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm"
                    key={action.id}
                  >
                    {action.title}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Clock3 aria-hidden size={16} />잘 되는 시간대
              </div>
              <p className="mt-2 text-xl font-extrabold tracking-tight text-gray-900">
                {topTime.label}에 더 잘 돼요
              </p>
              <p className="mt-1 text-sm text-gray-600">완벽한 계획보다, 되는 시간에 얹어두기.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {bestTimeActions.map((action) => (
                  <span
                    className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm"
                    key={action.id}
                  >
                    {action.title}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <CloudRain aria-hidden size={16} />
                날씨 힌트
              </div>
              <p className="mt-2 text-xl font-extrabold tracking-tight text-gray-900">
                {weatherHintLabel}인 날에 더 잘 돼요
              </p>
              <p className="mt-1 text-sm text-gray-600">
                날씨는 바꿀 수 없지만, “되는 조건”은 가져올 수 있어요.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {weatherHintActions.map((action) => (
                  <span
                    className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm"
                    key={action.id}
                  >
                    {action.title}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Users aria-hidden size={16} />
                남들보다 내가 더 집중한
              </div>
              <p className="mt-2 text-xl font-extrabold tracking-tight text-gray-900">
                이번 달은 {focusCategoryName}에 더 마음이 갔어요
              </p>
              <p className="mt-1 text-sm text-gray-600">
                나에게 맞는 방향이 보이면, 나머지는 자연스럽게 따라와요.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {focusActions.map((action) => (
                  <span
                    className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm"
                    key={action.id}
                  >
                    {action.title}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}
