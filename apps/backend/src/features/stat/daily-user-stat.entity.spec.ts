import { getMetadataArgsStorage } from 'typeorm';
import { DailyUserStat, COUNT_DEGREE } from './daily-user-stat.entity';

const storage = getMetadataArgsStorage();

const getTableName = (target: Function): string | undefined =>
  storage.tables.find((table) => table.target === target)?.name;

const getColumnNames = (target: Function): string[] =>
  storage.columns.filter((column) => column.target === target).map((column) => column.propertyName);

const getColumn = (target: Function, propertyName: string) =>
  storage.columns.find(
    (column) => column.target === target && column.propertyName === propertyName,
  );

const getRelation = (target: Function, propertyName: string) =>
  storage.relations.find(
    (relation) => relation.target === target && relation.propertyName === propertyName,
  );

const getJoinColumn = (target: Function, propertyName: string) =>
  storage.joinColumns.find(
    (joinColumn) => joinColumn.target === target && joinColumn.propertyName === propertyName,
  );

const getIndices = (target: Function) => storage.indices.filter((index) => index.target === target);

describe('DailyUserStat', () => {
  it('테이블과 컬럼 매핑을 가진다', () => {
    expect(getTableName(DailyUserStat)).toBe('daily_user_stats');

    expect(getColumnNames(DailyUserStat)).toEqual(
      expect.arrayContaining([
        'statDate',
        'totalCompletedCounts',
        'behaviorCompletedTopNCounts',
        'goalCompletedTopNCounts',
        'goalCompletedCounts',
        'weeklyDailyDifficultyCompletedCounts',
        'dailyDifficultyCompletedCounts',
        'weeklyDifficultyCompletedCounts',
        'totalDifficultyCompletedCounts',
        'originCompletedRatio',
        'notDoneCounts',
        'completionTimeBuckets',
        'checkInTotal',
        'duduCatchTotal',
        'goalCountDegree',
        'behaviorCountDegree',
        'avgRefreshPerDay',
        'avgCompletedPerDay',
      ]),
    );
  });

  it('User 관계 매핑을 가진다', () => {
    const userRelation = getRelation(DailyUserStat, 'user');
    expect(userRelation?.relationType).toBe('many-to-one');
    expect(getJoinColumn(DailyUserStat, 'user')?.name).toBe('userId');
  });

  it('user + statDate 유니크 인덱스를 가진다', () => {
    const indices = getIndices(DailyUserStat);

    const userStatDateUniqueIndex = indices.find(
      (idx) =>
        idx.unique === true &&
        Array.isArray(idx.columns) &&
        idx.columns.length === 2 &&
        idx.columns.includes('user') &&
        idx.columns.includes('statDate'),
    );

    expect(userStatDateUniqueIndex).toBeDefined();
  });

  it('goalCountDegree / behaviorCountDegree enum 매핑을 가진다', () => {
    const goalCountDegreeCol = getColumn(DailyUserStat, 'goalCountDegree');
    expect(goalCountDegreeCol?.options?.type).toBe('enum');
    expect(goalCountDegreeCol?.options?.enum).toEqual(Object.values(COUNT_DEGREE));

    const behaviorCountDegreeCol = getColumn(DailyUserStat, 'behaviorCountDegree');
    expect(behaviorCountDegreeCol?.options?.type).toBe('enum');
    expect(behaviorCountDegreeCol?.options?.enum).toEqual(Object.values(COUNT_DEGREE));
  });

  it('주요 default 값 매핑을 가진다', () => {
    // 숫자 기본값
    expect(getColumn(DailyUserStat, 'totalCompletedCounts')?.options?.default).toBe(0);
    expect(getColumn(DailyUserStat, 'checkInTotal')?.options?.default).toBe(0);
    expect(getColumn(DailyUserStat, 'duduCatchTotal')?.options?.default).toBe(0);

    // jsonb 기본값: 함수로 들어가는 케이스라 "정확히 문자열 비교" 대신 존재 여부를 확인
    expect(getColumn(DailyUserStat, 'behaviorCompletedTopNCounts')?.options?.default).toBeDefined();
    expect(getColumn(DailyUserStat, 'goalCompletedTopNCounts')?.options?.default).toBeDefined();
    expect(getColumn(DailyUserStat, 'goalCompletedCounts')?.options?.default).toBeDefined();

    expect(
      getColumn(DailyUserStat, 'dailyDifficultyCompletedCounts')?.options?.default,
    ).toBeDefined();
    expect(
      getColumn(DailyUserStat, 'weeklyDifficultyCompletedCounts')?.options?.default,
    ).toBeDefined();
    expect(
      getColumn(DailyUserStat, 'totalDifficultyCompletedCounts')?.options?.default,
    ).toBeDefined();

    expect(getColumn(DailyUserStat, 'notDoneCounts')?.options?.default).toBeDefined();
    expect(getColumn(DailyUserStat, 'completionTimeBuckets')?.options?.default).toBeDefined();

    // numeric default
    expect(getColumn(DailyUserStat, 'originCompletedRatio')?.options?.default).toBe(0);
    expect(getColumn(DailyUserStat, 'avgRefreshPerDay')?.options?.default).toBe(0);
    expect(getColumn(DailyUserStat, 'avgCompletedPerDay')?.options?.default).toBe(0);
  });

  it('statDate 컬럼 타입이 date 이다', () => {
    const statDateCol = getColumn(DailyUserStat, 'statDate');
    expect(statDateCol?.options?.type).toBe('date');
  });

  it('numeric 컬럼 precision/scale 설정이 있다', () => {
    const originCompletedRatio = getColumn(DailyUserStat, 'originCompletedRatio');
    expect(originCompletedRatio?.options?.type).toBe('numeric');
    expect(originCompletedRatio?.options?.precision).toBe(4);
    expect(originCompletedRatio?.options?.scale).toBe(2);

    const avgRefreshPerDay = getColumn(DailyUserStat, 'avgRefreshPerDay');
    expect(avgRefreshPerDay?.options?.type).toBe('numeric');
    expect(avgRefreshPerDay?.options?.precision).toBe(6);
    expect(avgRefreshPerDay?.options?.scale).toBe(2);

    const avgCompletedPerDay = getColumn(DailyUserStat, 'avgCompletedPerDay');
    expect(avgCompletedPerDay?.options?.type).toBe('numeric');
    expect(avgCompletedPerDay?.options?.precision).toBe(6);
    expect(avgCompletedPerDay?.options?.scale).toBe(2);
  });
});
