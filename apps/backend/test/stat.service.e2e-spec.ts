import { Test } from '@nestjs/testing';
import { DataSource, type Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { StatService } from '../src/features/stat/stat.service';
import { User } from '../src/features/user/user.entity';
import { Goal } from '../src/features/goal/goal.entity';
import { Behavior } from '../src/features/behavior/behavior.entity';
import { TodayBehavior } from '../src/features/behavior/today-behavior.entity';
import { StatEventLog, EVENT_TYPES } from '../src/features/stat/stat-event-log.entity';
import { DailyUserStat } from '../src/features/stat/daily-user-stat.entity';
import { addDays, getKstDayKey, toKstBoundary } from '../src/common/utils/time.utils';

const REQUIRED_ENV = [
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_PASS',
  'DB_NAME',
  'SESSION_SECRET',
  'SESSION_MAX_AGE_MS',
  'CLOVA_API_KEY',
];

const hasRequiredEnv = REQUIRED_ENV.every((key) => Boolean(process.env[key]));
const describeIf = hasRequiredEnv ? describe : describe.skip;

describeIf('StatService integration', () => {
  let dataSource: DataSource;
  let statService: StatService;

  let userRepository: Repository<User>;
  let goalRepository: Repository<Goal>;
  let behaviorRepository: Repository<Behavior>;
  let todayBehaviorRepository: Repository<TodayBehavior>;
  let statEventLogRepository: Repository<StatEventLog>;
  let dailyUserStatRepository: Repository<DailyUserStat>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    statService = module.get(StatService);
    dataSource = module.get(DataSource);
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }
    await dataSource.runMigrations();

    userRepository = dataSource.getRepository(User);
    goalRepository = dataSource.getRepository(Goal);
    behaviorRepository = dataSource.getRepository(Behavior);
    todayBehaviorRepository = dataSource.getRepository(TodayBehavior);
    statEventLogRepository = dataSource.getRepository(StatEventLog);
    dailyUserStatRepository = dataSource.getRepository(DailyUserStat);
  });

  beforeEach(async () => {
    await dataSource.query(`
      TRUNCATE daily_user_stats,
        stat_event_logs,
        today_behaviors,
        behaviors,
        goals,
        users
      RESTART IDENTITY CASCADE
    `);
  });

  afterAll(async () => {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  it('하루 롤업을 upsert로 갱신한다', async () => {
    // Given: 사용자, 목표, 행동, 로그 데이터를 준비한다.
    const user = await userRepository.save({
      nickname: 'stat-user',
      kind: 'guest',
    });

    const goal = await goalRepository.save({
      title: '건강 목표',
      color: 'mint',
      user,
    });

    const behavior = await behaviorRepository.save({
      title: '물 1컵 마시기',
      difficulty: '마음열기',
      goal,
    });
    const behaviorTwo = await behaviorRepository.save({
      title: '스트레칭 5분',
      difficulty: '몰입하기',
      goal,
    });

    const yesterDayKey = getKstDayKey(addDays(new Date(), -1));
    const todayKey = getKstDayKey(new Date());
    const midKey = getKstDayKey(addDays(new Date(), -3));
    const weekStartKey = getKstDayKey(addDays(new Date(), -7));

    await todayBehaviorRepository.save({
      date: yesterDayKey,
      status: 'completed',
      origin: 'system',
      user,
      behavior,
    });
    await todayBehaviorRepository.save({
      date: yesterDayKey,
      status: 'completed',
      origin: 'user',
      user,
      behavior: behaviorTwo,
    });
    await todayBehaviorRepository.save({
      date: yesterDayKey,
      status: 'pending',
      origin: 'system',
      user,
      behavior,
    });
    await todayBehaviorRepository.save({
      date: yesterDayKey,
      status: 'ignored',
      origin: 'user',
      user,
      behavior: behaviorTwo,
    });
    await todayBehaviorRepository.save({
      date: midKey,
      status: 'completed',
      origin: 'system',
      user,
      behavior,
    });

    await statEventLogRepository.save({
      user,
      eventType: EVENT_TYPES.CHECK_IN,
      createdAt: toKstBoundary(weekStartKey),
    });
    await statEventLogRepository.save({
      user,
      eventType: EVENT_TYPES.DUDU_CATCH,
      createdAt: toKstBoundary(yesterDayKey),
    });
    await statEventLogRepository.save({
      user,
      eventType: EVENT_TYPES.REFRESH_TODAY_BEHAVIORS,
      createdAt: toKstBoundary(yesterDayKey),
    });

    // When: 배치 집계를 실행한다.
    await statService.calculateDailyUserStats();

    // Then: 집계 결과가 기대값과 일치해야 한다.
    let stats = await dailyUserStatRepository.find({
      where: { user: { id: user.id } },
    });

    // Then-검증: statDate와 누적 완료 횟수
    expect(stats).toHaveLength(1);
    expect(stats[0].statDate).toBe(todayKey);
    expect(Number(stats[0].totalCompletedCounts)).toBe(3);
    // Then-검증: 행동/목표 상위 통계
    expect(stats[0].behaviorCompletedTopNCounts).toEqual(
      expect.arrayContaining([
        {
          behaviorId: behavior.id,
          behaviorTitle: '물 1컵 마시기',
          count: 2,
        },
        {
          behaviorId: behaviorTwo.id,
          behaviorTitle: '스트레칭 5분',
          count: 1,
        },
      ]),
    );
    expect(stats[0].goalCompletedTopNCounts).toEqual([
      {
        goalId: goal.id,
        goalTitle: '건강 목표',
        behaviorCounts: expect.arrayContaining([
          {
            behaviorId: behavior.id,
            behaviorTitle: '물 1컵 마시기',
            count: 2,
          },
          {
            behaviorId: behaviorTwo.id,
            behaviorTitle: '스트레칭 5분',
            count: 1,
          },
        ]),
      },
    ]);
    expect(stats[0].goalCompletedCounts).toEqual([
      {
        goalId: goal.id,
        goalTitle: '건강 목표',
        count: 3,
      },
    ]);
    // Then-검증: 난이도별 집계 및 비율
    expect(stats[0].dailyDifficultyCompletedCounts).toMatchObject({
      마음열기: 1,
      몰입하기: 1,
    });
    expect(stats[0].weeklyDifficultyCompletedCounts).toMatchObject({
      마음열기: 2,
      몰입하기: 1,
    });
    expect(stats[0].totalDifficultyCompletedCounts).toMatchObject({
      마음열기: 2,
      몰입하기: 1,
    });
    expect(stats[0].weeklyDailyDifficultyCompletedCounts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ totalCount: 2 }),
        expect.objectContaining({ totalCount: 1 }),
      ]),
    );
    expect(Number(stats[0].originCompletedRatio)).toBe(0.5);
    expect(stats[0].notDoneCounts).toMatchObject({ system: 1, user: 1 });
    // Then-검증: 완료 시간대 버킷 합계
    const completionBucketTotal = Object.values(stats[0].completionTimeBuckets).reduce(
      (sum, value) => sum + value,
      0,
    );
    expect(completionBucketTotal).toBe(3);
    // Then-검증: 이벤트 로그 기반 지표
    expect(Number(stats[0].checkInTotal)).toBe(1);
    expect(Number(stats[0].duduCatchTotal)).toBe(1);
    expect(Number(stats[0].avgRefreshPerDay)).toBeCloseTo(0.14, 2);
    expect(Number(stats[0].avgCompletedPerDay)).toBeCloseTo(0.43, 2);
    // Then-검증: 목표/행동 개수 등급
    expect(stats[0].goalCountDegree).toBe('MUCH_LESS');
    expect(stats[0].behaviorCountDegree).toBe('MUCH_LESS');

    // When: 원본 데이터를 추가하고 다시 집계한다.
    await todayBehaviorRepository.save({
      date: yesterDayKey,
      status: 'completed',
      origin: 'system',
      user,
      behavior,
    });

    await statService.calculateDailyUserStats();

    // Then: upsert로 동일 행이 갱신된다.
    stats = await dailyUserStatRepository.find({
      where: { user: { id: user.id } },
    });

    // Then-검증: 동일 row가 유지되고 누적 값이 증가한다.
    expect(stats).toHaveLength(1);
    expect(Number(stats[0].totalCompletedCounts)).toBe(4);
  });
});
