import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { StatService } from './stat.service';
import { User } from '../user/user.entity';
import { TodayBehavior } from '../behavior/today-behavior.entity';
import { DailyUserStat } from './daily-user-stat.entity';
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
    const dailyUserStatRepository = { upsert: jest.fn(), ...dailyUserStatRepositoryOverride };
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
      expect(goalOne.behaviorCounts).toHaveLength(5);
      expect(goalTwo.behaviorCounts).toHaveLength(1);
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
});
