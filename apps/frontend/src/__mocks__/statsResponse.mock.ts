import { CATEGORY_COLORS, type StatsResponse } from '@web24/shared';

export const statsResponseMock: StatsResponse = {
  period: { year: 2025, month: 12 },
  totals: {
    allTimeCount: 412,
    monthCount: 86,
    prevMonthCount: 71,
  },
  categories: [
    { categoryId: 'exercise', categoryName: '운동', color: CATEGORY_COLORS.EXERCISE, count: 32 },
    { categoryId: 'health', categoryName: '건강', color: CATEGORY_COLORS.HEALTH, count: 22 },
    { categoryId: 'study', categoryName: '학습', color: CATEGORY_COLORS.STUDY, count: 18 },
    { categoryId: 'mind', categoryName: '마음', color: CATEGORY_COLORS.MIND, count: 14 },
  ],
  insights: {
    bestWeekday: {
      weekday: '수',
      actions: [
        { behaviorId: 'b-walk-1h', title: '걷기 1시간' },
        { behaviorId: 'b-water-1_5l', title: '물 1.5L 마시기' },
        { behaviorId: 'b-stretch-5m', title: '스트레칭 5분' },
      ],
    },
    bestTime: {
      timeBucket: '저녁 (18~21)',
      actions: [
        { behaviorId: 'b-walk-1h', title: '걷기 1시간' },
        { behaviorId: 'b-photo-sunset', title: '일몰 사진 찍기' },
        { behaviorId: 'b-vitamin', title: '비타민 먹기' },
      ],
    },
    weatherHint: {
      weather: '비/흐림',
      message: '밖에 나가기 싫은 날일수록, 집에서 더 잘 되는 편이에요.',
      actions: [
        { behaviorId: 'b-water-1_5l', title: '물 1.5L 마시기' },
        { behaviorId: 'b-read-10m', title: '10분 독서' },
        { behaviorId: 'b-journal-1line', title: '감정 한 줄 기록' },
      ],
    },
    focusVsOthers: {
      label: '남들보다 내가 더 집중한',
      basis: 'category',
      itemId: 'exercise',
      itemName: '운동',
      actions: [
        { behaviorId: 'b-run-20m', title: '러닝 20분' },
        { behaviorId: 'b-walk-1h', title: '걷기 1시간' },
        { behaviorId: 'b-stretch-5m', title: '스트레칭 5분' },
      ],
    },
  },
  generatedAt: '2025-12-18T03:00:00.000Z',
};
