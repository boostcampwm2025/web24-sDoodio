import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import {
  BEHAVIOR_DIFFICULTIES,
  TODAY_BEHAVIOR_ORIGIN,
  type BehaviorDifficulty,
  type TodayBehaviorOrigin,
} from '@web24/shared';
import { StatService } from './stat.service';
import { User } from '../user/user.entity';
import { TodayBehavior } from '../behavior/today-behavior.entity';
import { COMPLETION_TIME_BUCKET, COUNT_DEGREE, DailyUserStat } from './daily-user-stat.entity';
import { StatEventLog } from './stat-event-log.entity';
import { Goal } from '../goal/goal.entity';
import { Behavior } from '../behavior/behavior.entity';
import { addDays, getKstDayKey, toKstBoundary } from '../../common/utils/time.utils';

describe('StatService', () => {
  process.env.TZ = 'UTC';
  const createQueryBuilder = <T>(rows: T[], count?: number) => ({
    innerJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    addGroupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue(rows),
    getCount: jest.fn().mockResolvedValue(count ?? rows.length),
  });
  const createService = async ({
    userRepository: userRepositoryOverride,
    todayBehaviorRepository: todayBehaviorRepositoryOverride,
    dailyUserStatRepository: dailyUserStatRepositoryOverride,
    statEventLogRepository: statEventLogRepositoryOverride,
    goalRepository: goalRepositoryOverride,
    behaviorRepository: behaviorRepositoryOverride,
  }: {
    userRepository?: Partial<Repository<User>>;
    todayBehaviorRepository?: Partial<Repository<TodayBehavior>>;
    dailyUserStatRepository?: Partial<Repository<DailyUserStat>>;
    statEventLogRepository?: Partial<Repository<StatEventLog>>;
    goalRepository?: Partial<Repository<Goal>>;
    behaviorRepository?: Partial<Repository<Behavior>>;
  } = {}) => {
    const userRepository = { find: jest.fn(), ...userRepositoryOverride };
    const todayBehaviorRepository = { count: jest.fn(), ...todayBehaviorRepositoryOverride };
    const dailyUserStatRepository = {
      upsert: jest.fn(),
      findOne: jest.fn(),
      ...dailyUserStatRepositoryOverride,
    };
    const statEventLogRepository = {
      createQueryBuilder: jest.fn(),
      ...statEventLogRepositoryOverride,
    };
    const goalRepository = { count: jest.fn(), ...goalRepositoryOverride };
    const behaviorRepository = { count: jest.fn(), ...behaviorRepositoryOverride };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: getRepositoryToken(TodayBehavior), useValue: todayBehaviorRepository },
        { provide: getRepositoryToken(DailyUserStat), useValue: dailyUserStatRepository },
        { provide: getRepositoryToken(StatEventLog), useValue: statEventLogRepository },
        { provide: getRepositoryToken(Goal), useValue: goalRepository },
        { provide: getRepositoryToken(Behavior), useValue: behaviorRepository },
      ],
    }).compile();

    return {
      service: module.get<StatService>(StatService),
      userRepository,
      todayBehaviorRepository,
      dailyUserStatRepository,
      statEventLogRepository,
      goalRepository,
      behaviorRepository,
    };
  };

  describe('calculateDailyUserStats', () => {
    afterEach(() => {
      jest.useRealTimers();
      jest.restoreAllMocks();
    });

    it('일/주간 기준 키로 통계 계산 함수를 호출한다', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-01-21T03:00:00.000Z'));

      const user = { id: 'user-1' } as User;
      const userRepository = { find: jest.fn().mockResolvedValue([user]) };
      const dailyUserStatRepository = { upsert: jest.fn().mockResolvedValue(undefined) };
      const goalRepository = { count: jest.fn().mockResolvedValue(0) };
      const behaviorRepository = { count: jest.fn().mockResolvedValue(0) };

      const { service } = await createService({
        userRepository,
        dailyUserStatRepository,
        goalRepository,
        behaviorRepository,
      });

      const svc = service as any;
      const calcTotalCompletedCounts = jest
        .spyOn(svc, 'calcTotalCompletedCounts')
        .mockResolvedValue(0);
      const calcBehaviorCompletedTopNCounts = jest
        .spyOn(svc, 'calcBehaviorCompletedTopNCounts')
        .mockResolvedValue([]);
      const calcGoalCompletedTopNCounts = jest
        .spyOn(svc, 'calcGoalCompletedTopNCounts')
        .mockResolvedValue([]);
      const countByDifficulty = jest.spyOn(svc, 'countByDifficulty').mockResolvedValue({});
      const calcweeklyDailyDifficultyCompletedCounts = jest
        .spyOn(svc, 'calcweeklyDailyDifficultyCompletedCounts')
        .mockResolvedValue([]);
      const calcGoalCompletedCounts = jest
        .spyOn(svc, 'calcGoalCompletedCounts')
        .mockResolvedValue([]);
      const calcOriginCompletedCounts = jest
        .spyOn(svc, 'calcOriginCompletedCounts')
        .mockResolvedValue({ system: 0, user: 0 });
      const calcNotDoneCounts = jest.spyOn(svc, 'calcNotDoneCounts').mockResolvedValue({});
      const calcCompletionTimeBuckets = jest
        .spyOn(svc, 'calcCompletionTimeBuckets')
        .mockResolvedValue({});
      const countEvent = jest.spyOn(svc, 'countEvent').mockResolvedValue(0);
      const countCompletedInRange = jest.spyOn(svc, 'countCompletedInRange').mockResolvedValue(0);

      await service.calculateDailyUserStats();

      const yesterDayKey = getKstDayKey(addDays(new Date(), -1));
      const weekStartKey = getKstDayKey(addDays(new Date(), -7));

      expect(calcTotalCompletedCounts).toHaveBeenCalledWith(user, yesterDayKey);
      expect(calcBehaviorCompletedTopNCounts).toHaveBeenCalledWith(user, yesterDayKey);
      expect(calcGoalCompletedTopNCounts).toHaveBeenCalledWith(user, yesterDayKey);
      expect(countByDifficulty).toHaveBeenNthCalledWith(1, user.id, yesterDayKey, yesterDayKey);
      expect(countByDifficulty).toHaveBeenNthCalledWith(2, user.id, weekStartKey, yesterDayKey);
      expect(countByDifficulty).toHaveBeenNthCalledWith(3, user.id, undefined, yesterDayKey);
      expect(calcweeklyDailyDifficultyCompletedCounts).toHaveBeenCalledWith(
        user.id,
        weekStartKey,
        yesterDayKey,
      );
      expect(calcGoalCompletedCounts).toHaveBeenCalledWith(user.id, yesterDayKey);
      expect(calcOriginCompletedCounts).toHaveBeenCalledWith(user.id, weekStartKey, yesterDayKey);
      expect(calcNotDoneCounts).toHaveBeenCalledWith(user.id, weekStartKey, yesterDayKey);
      expect(calcCompletionTimeBuckets).toHaveBeenCalledWith(user.id, weekStartKey, yesterDayKey);
      expect(countEvent).toHaveBeenNthCalledWith(
        1,
        user.id,
        'CHECK_IN',
        weekStartKey,
        yesterDayKey,
      );
      expect(countEvent).toHaveBeenNthCalledWith(
        2,
        user.id,
        'DUDU_CATCH',
        weekStartKey,
        yesterDayKey,
      );
      expect(countEvent).toHaveBeenNthCalledWith(
        3,
        user.id,
        'REFRESH_TODAY_BEHAVIORS',
        weekStartKey,
        yesterDayKey,
      );
      expect(countCompletedInRange).toHaveBeenCalledWith(user.id, weekStartKey, yesterDayKey);
    });
  });

  describe('getDifficultyStats', () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    it('오늘 통계가 없으면 빈 배열을 반환한다', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-01-21T03:00:00.000Z'));
      const userId = 'user-1';
      const dailyUserStatRepository = { findOne: jest.fn().mockResolvedValue(null) };
      const { service } = await createService({ dailyUserStatRepository });

      const result = await service.getDifficultyStats(userId);

      const todayKey = getKstDayKey(new Date());
      expect(dailyUserStatRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: userId }, statDate: todayKey },
      });
      expect(result).toEqual([]);
    });

    it('주간 데이터가 비어있으면 빈 배열을 반환한다', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-01-21T03:00:00.000Z'));
      const userId = 'user-1';
      const dailyUserStatRepository = {
        findOne: jest.fn().mockResolvedValue({ weeklyDailyDifficultyCompletedCounts: [] }),
      };
      const { service } = await createService({ dailyUserStatRepository });

      const result = await service.getDifficultyStats(userId);

      expect(result).toEqual([]);
    });

    it('AI는 0으로 고정하고 난이도 키를 정규화한다', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-01-21T03:00:00.000Z'));
      const userId = 'user-1';
      const dailyUserStatRepository = {
        findOne: jest.fn().mockResolvedValue({
          weeklyDailyDifficultyCompletedCounts: [
            { 마음열기: 1, 이어가기: 2, AI: 5 },
            { 시작하기: 3, 몰입하기: 1 },
          ],
        }),
      };
      const { service } = await createService({ dailyUserStatRepository });

      const result = await service.getDifficultyStats(userId);

      expect(result).toEqual([
        { 마음열기: 1, 시작하기: 0, 이어가기: 2, 몰입하기: 0, AI: 0 },
        { 마음열기: 0, 시작하기: 3, 이어가기: 0, 몰입하기: 1, AI: 0 },
      ]);
    });
  });

  describe('getInsights', () => {
    const buildEmptyDifficultyCounts = () =>
      BEHAVIOR_DIFFICULTIES.reduce(
        (acc, difficulty) => {
          acc[difficulty] = 0;
          return acc;
        },
        {} as Record<BehaviorDifficulty, number>,
      );

    const buildEmptyOriginCounts = () =>
      TODAY_BEHAVIOR_ORIGIN.reduce(
        (acc, origin) => {
          acc[origin] = 0;
          return acc;
        },
        {} as Record<TodayBehaviorOrigin, number>,
      );

    const buildEmptyCompletionBuckets = () =>
      Object.values(COMPLETION_TIME_BUCKET).reduce(
        (acc, bucket) => {
          acc[bucket] = 0;
          return acc;
        },
        {} as Record<(typeof COMPLETION_TIME_BUCKET)[keyof typeof COMPLETION_TIME_BUCKET], number>,
      );

    afterEach(() => {
      jest.useRealTimers();
    });

    it('통계가 없으면 기본값을 반환한다', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-01-21T03:00:00.000Z'));
      const userId = 'user-1';
      const dailyUserStatRepository = { findOne: jest.fn().mockResolvedValue(null) };
      const { service } = await createService({ dailyUserStatRepository });

      const result = await service.getInsights(userId);

      const todayKey = getKstDayKey(new Date());
      expect(dailyUserStatRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: userId }, statDate: todayKey },
      });
      expect(result).toEqual({
        statDate: todayKey,
        dailyDifficultyCompletedCounts: buildEmptyDifficultyCounts(),
        weeklyDifficultyCompletedCounts: buildEmptyDifficultyCounts(),
        totalDifficultyCompletedCounts: buildEmptyDifficultyCounts(),
        originCompletedCounts: buildEmptyOriginCounts(),
        notDoneCounts: buildEmptyOriginCounts(),
        completionTimeBuckets: buildEmptyCompletionBuckets(),
        checkInTotal: 0,
        duduCatchTotal: 0,
        goalCountDegree: COUNT_DEGREE.MUCH_LESS,
        behaviorCountDegree: COUNT_DEGREE.MUCH_LESS,
        avgRefreshPerDay: 0,
        avgCompletedPerDay: 0,
      });
    });

    it('통계가 있으면 값을 정규화해 반환한다', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-01-21T03:00:00.000Z'));
      const userId = 'user-1';
      const dailyUserStatRepository = {
        findOne: jest.fn().mockResolvedValue({
          statDate: '2026-01-20',
          dailyDifficultyCompletedCounts: { 마음열기: 1 },
          weeklyDifficultyCompletedCounts: { 몰입하기: 2 },
          totalDifficultyCompletedCounts: { 시작하기: 3, AI: 5 },
          originCompletedCounts: { system: 2 },
          notDoneCounts: { user: 1 },
          completionTimeBuckets: { '7~10': 2 },
          checkInTotal: 3,
          duduCatchTotal: 1,
          goalCountDegree: COUNT_DEGREE.MORE,
          behaviorCountDegree: COUNT_DEGREE.LESS,
          avgRefreshPerDay: 1.5,
          avgCompletedPerDay: 2.2,
        }),
      };
      const { service } = await createService({ dailyUserStatRepository });

      const result = await service.getInsights(userId);

      expect(result).toEqual({
        statDate: '2026-01-20',
        dailyDifficultyCompletedCounts: {
          ...buildEmptyDifficultyCounts(),
          마음열기: 1,
        },
        weeklyDifficultyCompletedCounts: {
          ...buildEmptyDifficultyCounts(),
          몰입하기: 2,
        },
        totalDifficultyCompletedCounts: {
          ...buildEmptyDifficultyCounts(),
          시작하기: 3,
          AI: 5,
        },
        originCompletedCounts: {
          ...buildEmptyOriginCounts(),
          system: 2,
        },
        notDoneCounts: {
          ...buildEmptyOriginCounts(),
          user: 1,
        },
        completionTimeBuckets: {
          ...buildEmptyCompletionBuckets(),
          '7~10': 2,
        },
        checkInTotal: 3,
        duduCatchTotal: 1,
        goalCountDegree: COUNT_DEGREE.MORE,
        behaviorCountDegree: COUNT_DEGREE.LESS,
        avgRefreshPerDay: 1.5,
        avgCompletedPerDay: 2.2,
      });
    });
  });

  describe('private methods', () => {
    it('calcTotalCompletedCounts는 기준 날짜까지 누적을 조회한다', async () => {
      const todayBehaviorRepository = { count: jest.fn().mockResolvedValue(5) };
      const { service } = await createService({ todayBehaviorRepository });

      const result = await (service as any).calcTotalCompletedCounts(
        { id: 'user-1' } as User,
        '2026-01-20',
      );

      expect(todayBehaviorRepository.count).toHaveBeenCalledWith({
        where: expect.objectContaining({
          user: { id: 'user-1' },
          status: 'completed',
          date: expect.any(Object),
        }),
      });
      expect(result).toBe(5);
    });

    it('calcBehaviorCompletedTopNCounts는 TOP N을 매핑한다', async () => {
      const rows = [
        { behaviorId: 'b1', behaviorTitle: '행동1', count: '3' },
        { behaviorId: 'b2', behaviorTitle: '행동2', count: '2' },
      ];
      const qb = createQueryBuilder(rows);
      const todayBehaviorRepository = {
        createQueryBuilder: jest.fn().mockReturnValue(qb),
      };

      const { service } = await createService({ todayBehaviorRepository });

      const result = await (service as any).calcBehaviorCompletedTopNCounts(
        { id: 'user-1' } as User,
        '2026-01-20',
      );

      expect(qb.andWhere).toHaveBeenCalledWith('tb.date <= :end', { end: '2026-01-20' });
      expect(result).toEqual([
        { behaviorId: 'b1', behaviorTitle: '행동1', count: 3 },
        { behaviorId: 'b2', behaviorTitle: '행동2', count: 2 },
      ]);
    });

    it('calcGoalCompletedTopNCounts는 goal별 TOP N 행동을 제한한다', async () => {
      const rows = [
        { goalId: 'g1', goalTitle: '목표1', behaviorId: 'b1', behaviorTitle: '행동1', count: '5' },
        { goalId: 'g1', goalTitle: '목표1', behaviorId: 'b2', behaviorTitle: '행동2', count: '4' },
        { goalId: 'g1', goalTitle: '목표1', behaviorId: 'b3', behaviorTitle: '행동3', count: '3' },
        { goalId: 'g1', goalTitle: '목표1', behaviorId: 'b4', behaviorTitle: '행동4', count: '2' },
        { goalId: 'g1', goalTitle: '목표1', behaviorId: 'b5', behaviorTitle: '행동5', count: '1' },
        { goalId: 'g1', goalTitle: '목표1', behaviorId: 'b6', behaviorTitle: '행동6', count: '1' },
        { goalId: 'g2', goalTitle: '목표2', behaviorId: 'b7', behaviorTitle: '행동7', count: '2' },
      ];
      const qb = createQueryBuilder(rows);
      const todayBehaviorRepository = {
        createQueryBuilder: jest.fn().mockReturnValue(qb),
      };

      const { service } = await createService({ todayBehaviorRepository });

      const result = await (service as any).calcGoalCompletedTopNCounts(
        { id: 'user-1' } as User,
        '2026-01-20',
      );

      expect(qb.andWhere).toHaveBeenCalledWith('tb.date <= :end', { end: '2026-01-20' });
      const goalOne = result.find((entry: any) => entry.goalId === 'g1');
      const goalTwo = result.find((entry: any) => entry.goalId === 'g2');
      expect(goalOne.behaviors).toHaveLength(5);
      expect(goalTwo.behaviors).toHaveLength(1);
    });
    it('countByDifficulty는 난이도별 카운트를 매핑한다', async () => {
      const rows = [
        { difficulty: '마음열기', count: '2' },
        { difficulty: '몰입하기', count: '1' },
      ];
      const qb = createQueryBuilder(rows);
      const todayBehaviorRepository = {
        createQueryBuilder: jest.fn().mockReturnValue(qb),
      };

      const { service } = await createService({ todayBehaviorRepository });

      const result = await (service as any).countByDifficulty('user-1', undefined, '2026-01-20');

      expect(qb.andWhere).toHaveBeenCalledWith('tb.date <= :end', { end: '2026-01-20' });
      expect(result).toEqual({ 마음열기: 2, 몰입하기: 1 });
    });

    it('calcweeklyDailyDifficultyCompletedCounts는 날짜별 합계를 포함한다', async () => {
      const rows = [
        { date: '2026-01-18', difficulty: '마음열기', count: '1' },
        { date: '2026-01-18', difficulty: '몰입하기', count: '2' },
        { date: '2026-01-19', difficulty: '몰입하기', count: '1' },
      ];
      const qb = createQueryBuilder(rows);
      const todayBehaviorRepository = {
        createQueryBuilder: jest.fn().mockReturnValue(qb),
      };

      const { service } = await createService({ todayBehaviorRepository });

      const result = await (service as any).calcweeklyDailyDifficultyCompletedCounts(
        'user-1',
        '2026-01-18',
        '2026-01-19',
      );

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ totalCount: 3 }),
          expect.objectContaining({ totalCount: 1 }),
        ]),
      );
    });

    it('calcGoalCompletedCounts는 목표별 수행 횟수를 매핑한다', async () => {
      const rows = [
        { goalId: 'g1', goalTitle: '목표1', count: '2' },
        { goalId: 'g2', goalTitle: '목표2', count: '1' },
      ];
      const qb = createQueryBuilder(rows);
      const todayBehaviorRepository = {
        createQueryBuilder: jest.fn().mockReturnValue(qb),
      };

      const { service } = await createService({ todayBehaviorRepository });

      const result = await (service as any).calcGoalCompletedCounts('user-1', '2026-01-20');

      expect(qb.andWhere).toHaveBeenCalledWith('tb.date <= :end', { end: '2026-01-20' });
      expect(result).toEqual([
        { goalId: 'g1', goalTitle: '목표1', count: 2 },
        { goalId: 'g2', goalTitle: '목표2', count: 1 },
      ]);
    });

    it('calcOriginCompletedCounts는 origin별 완료 횟수를 반환한다', async () => {
      const rows = [
        { origin: 'system', count: '4' },
        { origin: 'user', count: '2' },
      ];
      const qb = createQueryBuilder(rows);
      const todayBehaviorRepository = {
        createQueryBuilder: jest.fn().mockReturnValue(qb),
      };

      const { service } = await createService({ todayBehaviorRepository });

      const result = await (service as any).calcOriginCompletedCounts(
        'user-1',
        '2026-01-13',
        '2026-01-20',
      );

      expect(result).toEqual({ system: 4, user: 2 });
    });

    it('calcNotDoneCounts는 origin별 미완료 카운트를 반환한다', async () => {
      const rows = [
        { origin: 'system', count: '1' },
        { origin: 'user', count: '3' },
      ];
      const qb = createQueryBuilder(rows);
      const todayBehaviorRepository = {
        createQueryBuilder: jest.fn().mockReturnValue(qb),
      };

      const { service } = await createService({ todayBehaviorRepository });

      const result = await (service as any).calcNotDoneCounts('user-1', '2026-01-13', '2026-01-20');

      expect(result).toEqual({ system: 1, user: 3 });
    });

    it('calcCompletionTimeBuckets는 시간대별 완료 횟수를 집계한다', async () => {
      const rows = [
        { time: '2026-01-20T01:00:00' },
        { time: '2026-01-20T08:00:00' },
        { time: '2026-01-20T12:00:00' },
        { time: '2026-01-20T18:00:00' },
        { time: '2026-01-20T21:00:00' },
      ];
      const qb = createQueryBuilder(rows);
      const todayBehaviorRepository = {
        createQueryBuilder: jest.fn().mockReturnValue(qb),
      };

      const { service } = await createService({ todayBehaviorRepository });

      const result = await (service as any).calcCompletionTimeBuckets(
        'user-1',
        '2026-01-18',
        '2026-01-20',
      );

      expect(result).toMatchObject({
        '1~7': 1,
        '7~10': 1,
        '10~17': 1,
        '17~20': 1,
        '20~1': 1,
      });
    });

    it('countEvent는 기간 내 이벤트 카운트를 조회한다', async () => {
      const qb = createQueryBuilder([], 3);
      const statEventLogRepository = {
        createQueryBuilder: jest.fn().mockReturnValue(qb),
      };

      const { service } = await createService({ statEventLogRepository });

      const result = await (service as any).countEvent(
        'user-1',
        'CHECK_IN',
        '2026-01-18',
        '2026-01-20',
      );

      expect(qb.andWhere).toHaveBeenCalledWith('log.createdAt BETWEEN :start AND :end', {
        start: toKstBoundary('2026-01-18'),
        end: toKstBoundary('2026-01-20'),
      });
      expect(result).toBe(3);
    });

    it('countCompletedInRange는 end만 있을 때 <= end 조건으로 조회한다', async () => {
      const todayBehaviorRepository = { count: jest.fn().mockResolvedValue(7) };
      const { service } = await createService({ todayBehaviorRepository });

      const result = await (service as any).countCompletedInRange(
        'user-1',
        undefined,
        '2026-01-20',
      );

      expect(todayBehaviorRepository.count).toHaveBeenCalledWith({
        where: expect.objectContaining({
          date: expect.any(Object),
        }),
      });
      expect(result).toBe(7);
    });

    it('calcGoalDegree/calcBehaviorDegree는 기준값에 따라 등급을 반환한다', async () => {
      const { service } = await createService();

      expect((service as any).calcGoalDegree(1)).toBe('MUCH_LESS');
      expect((service as any).calcGoalDegree(6)).toBe('NEUTRAL');
      expect((service as any).calcBehaviorDegree(1)).toBe('MUCH_LESS');
      expect((service as any).calcBehaviorDegree(80)).toBe('MORE');
    });
  });

  describe('getTopBehaviors', () => {
    afterEach(() => {
      jest.useRealTimers();
      jest.restoreAllMocks();
    });

    it('오늘 stat이 없으면 빈 응답을 반환한다', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-01-21T03:00:00.000Z'));
      const todayKey = getKstDayKey(new Date());

      const dailyUserStatRepository = {
        findOne: jest.fn().mockResolvedValue(null),
      };

      const { service } = await createService({ dailyUserStatRepository });

      const result = await service.getTopBehaviors('user-1');

      expect(dailyUserStatRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: 'user-1' }, statDate: todayKey },
      });

      expect(result).toEqual({
        all: { totalCount: 0, items: [] },
        goals: [],
      });
    });

    it('오늘 stat이 있으면 all/goals를 매핑해서 반환한다 (goal 없는 behavior는 제외)', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-01-21T03:00:00.000Z'));
      const todayKey = getKstDayKey(new Date());

      const dailyUserStat = {
        behaviorCompletedTopNCounts: [
          { behaviorId: 'b1', count: 3 },
          { behaviorId: 'b2', count: 2 },
          { behaviorId: 'b-no-goal', count: 1 }, // goal 없어서 필터링 대상
        ],
        goalCompletedTopNCounts: [
          {
            goalId: 'g1',
            behaviors: [
              { behaviorId: 'b1', behaviorTitle: '행동1(스냅샷)', count: 2 },
              { behaviorId: 'b3', behaviorTitle: '행동3(스냅샷)', count: 1 },
            ],
          },
        ],
      } as any;

      const dailyUserStatRepository = {
        findOne: jest.fn().mockResolvedValue(dailyUserStat),
      };

      const behaviorRepository = {
        findOne: jest.fn().mockImplementation(async ({ where, relations }: any) => {
          expect(relations).toEqual({ goal: true });

          if (where.id === 'b1') {
            return {
              id: 'b1',
              title: '행동1',
              difficulty: '몰입하기',
              goal: { id: 'g1', title: '목표1', color: '#111111' },
            } as any;
          }
          if (where.id === 'b2') {
            return {
              id: 'b2',
              title: '행동2',
              difficulty: '마음열기',
              goal: { id: 'g2', title: '목표2', color: '#222222' },
            } as any;
          }
          if (where.id === 'b-no-goal') {
            return {
              id: 'b-no-goal',
              title: 'goal없는행동',
              difficulty: '몰입하기',
              goal: null,
            } as any;
          }
          return null;
        }),
      };

      const goalRepository = {
        findOne: jest.fn().mockImplementation(async ({ where, relations }: any) => {
          expect(relations).toEqual({ behaviors: true });

          if (where.id === 'g1') {
            return {
              id: 'g1',
              title: '목표1',
              color: '#111111',
              behaviors: [
                { id: 'b1', difficulty: '몰입하기' },
                { id: 'b3', difficulty: '마음열기' },
              ],
            } as any;
          }
          return null;
        }),
      };

      const { service } = await createService({
        dailyUserStatRepository,
        behaviorRepository,
        goalRepository,
      });

      const result = await service.getTopBehaviors('user-1');

      // stat 조회
      expect(dailyUserStatRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: 'user-1' }, statDate: todayKey },
      });

      // behavior 조회: 3개 시도 (b-no-goal은 결과에서 제외되지만 조회는 함)
      expect(behaviorRepository.findOne).toHaveBeenCalledTimes(3);
      expect(behaviorRepository.findOne).toHaveBeenNthCalledWith(1, {
        where: { id: 'b1' },
        relations: { goal: true },
      });
      expect(behaviorRepository.findOne).toHaveBeenNthCalledWith(2, {
        where: { id: 'b2' },
        relations: { goal: true },
      });
      expect(behaviorRepository.findOne).toHaveBeenNthCalledWith(3, {
        where: { id: 'b-no-goal' },
        relations: { goal: true },
      });

      // goal 조회
      expect(goalRepository.findOne).toHaveBeenCalledTimes(1);
      expect(goalRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'g1' },
        relations: { behaviors: true },
      });

      // 결과 검증
      expect(result).toEqual({
        all: {
          totalCount: 5, // b1(3) + b2(2) ; b-no-goal은 제외
          items: [
            {
              id: 'b1',
              behaviorTitle: '행동1',
              behaviorDifficulty: '몰입하기',
              goalTitle: '목표1',
              goalColor: '#111111',
              count: 3,
            },
            {
              id: 'b2',
              behaviorTitle: '행동2',
              behaviorDifficulty: '마음열기',
              goalTitle: '목표2',
              goalColor: '#222222',
              count: 2,
            },
          ],
        },
        goals: [
          {
            id: 'g1',
            goalTitle: '목표1',
            goalColor: '#111111',
            totalCount: 3, // b1(2) + b3(1)
            items: [
              {
                id: 'b1',
                behaviorTitle: '행동1(스냅샷)',
                behaviorDifficulty: '몰입하기', // goal.behaviors에서 difficulty를 가져옴
                count: 2,
              },
              {
                id: 'b3',
                behaviorTitle: '행동3(스냅샷)',
                behaviorDifficulty: '마음열기',
                count: 1,
              },
            ],
          },
        ],
      });
    });

    it('goalCompletedTopNCounts에 있는 behaviorId가 goal.behaviors에 없으면 에러를 던진다', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-01-21T03:00:00.000Z'));

      const dailyUserStat = {
        behaviorCompletedTopNCounts: [],
        goalCompletedTopNCounts: [
          {
            goalId: 'g1',
            behaviors: [{ behaviorId: 'b-not-in-goal', behaviorTitle: '없는행동', count: 1 }],
          },
        ],
      } as any;

      const dailyUserStatRepository = {
        findOne: jest.fn().mockResolvedValue(dailyUserStat),
      };

      const goalRepository = {
        findOne: jest.fn().mockResolvedValue({
          id: 'g1',
          title: '목표1',
          color: '#111111',
          behaviors: [
            // b-not-in-goal 없음!
            { id: 'b1', difficulty: '몰입하기' },
          ],
        } as any),
      };

      const { service } = await createService({
        dailyUserStatRepository,
        goalRepository,
      });

      await expect(service.getTopBehaviors('user-1')).rejects.toThrow('Behavior Not found');
    });
  });
});
