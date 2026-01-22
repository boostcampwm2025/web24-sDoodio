import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, LessThanOrEqual, Repository } from 'typeorm';
import { BehaviorDifficulty, TodayBehaviorOrigin } from '@web24/shared';
import { Cron } from '@nestjs/schedule';
import pLimit from 'p-limit';
import { addDays, getKstDayKey, toKstBoundary } from '../../common/utils/time.utils';
import {
  BEHAVIOR_COUNT_THRESHOLD,
  BehaviorCompletedCount,
  COMPLETION_TIME_BUCKET,
  CompletionTimeBucket,
  COUNT_DEGREE,
  CountDegreeType,
  DailyUserStat,
  GOAL_COUNT_THRESHOLD,
  GoalCompletedTopNCount,
} from './daily-user-stat.entity';
import { EVENT_TYPES, StatEventLog, StatEventType } from './stat-event-log.entity';
import { User } from '../user/user.entity';
import { TodayBehavior } from '../behavior/today-behavior.entity';
import { Goal } from '../goal/goal.entity';
import { Behavior } from '../behavior/behavior.entity';

@Injectable()
export class StatService {
  private readonly TOP_N = 5;

  private readonly WEEK_DAYS = 7;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(TodayBehavior)
    private readonly todayBehaviorRepository: Repository<TodayBehavior>,
    @InjectRepository(DailyUserStat)
    private readonly dailyUserStatRepository: Repository<DailyUserStat>,
    @InjectRepository(StatEventLog)
    private readonly statEventLogRepository: Repository<StatEventLog>,
    @InjectRepository(Goal)
    private readonly goalRepository: Repository<Goal>,
    @InjectRepository(Behavior)
    private readonly behaviorRepository: Repository<Behavior>,
  ) {}

  @Cron('0 0 4 * * *', { name: 'daily_user_stat_batch', timeZone: 'Asia/Seoul' })
  async calculateDailyUserStats() {
    const users = await this.userRepository.find();

    const yesterDayKey = getKstDayKey(addDays(new Date(), -1));
    const todayKey = getKstDayKey(new Date());
    const weekStartKey = getKstDayKey(addDays(new Date(), -this.WEEK_DAYS));

    const limit = pLimit(5);

    await Promise.all(
      users.map((user) =>
        limit(async () => {
          const [
            totalCompletedCounts,
            behaviorCompletedTopNCounts,
            goalCompletedTopNCounts,
            dailyDifficultyCompletedCounts,
            weeklyDifficultyCompletedCounts,
            totalDifficultyCompletedCounts,
            weeklyDailyDifficultyCompletedCounts,
            goalCompletedCounts,
            originCompletedRatio,
            notDoneCounts,
            completionTimeBuckets,
            checkInTotal,
            duduCatchTotal,
            refreshTotal,
            completedInWeek,
            goalCount,
            behaviorCount,
          ] = await Promise.all([
            this.calcTotalCompledCounts(user, yesterDayKey),
            this.calcBehaviorCompletedTopNCounts(user, yesterDayKey),
            this.calcGoalCompltedTopNCounts(user, yesterDayKey),

            this.countByDifficulty(user.id, yesterDayKey, yesterDayKey),
            this.countByDifficulty(user.id, weekStartKey, yesterDayKey),
            this.countByDifficulty(user.id, undefined, yesterDayKey),

            this.calcweeklyDailyDifficultyCompletedCounts(user.id, weekStartKey, yesterDayKey),
            this.calcGoalCompletedCounts(user.id, yesterDayKey),

            this.calcOriginCompletedRatio(user.id, weekStartKey, yesterDayKey),
            this.calcNotDoneCounts(user.id, weekStartKey, yesterDayKey),
            this.calcCompletionTimeBuckets(user.id, weekStartKey, yesterDayKey),

            this.countEvent(user.id, EVENT_TYPES.CHECK_IN, weekStartKey, yesterDayKey),
            this.countEvent(user.id, EVENT_TYPES.DUDU_CATCH, weekStartKey, yesterDayKey),
            this.countEvent(
              user.id,
              EVENT_TYPES.REFRESH_TODAY_BEHAVIORS,
              weekStartKey,
              yesterDayKey,
            ),

            this.countCompletedInRange(user.id, weekStartKey, yesterDayKey),

            this.goalRepository.count({ where: { user: { id: user.id } } }),
            this.behaviorRepository.count({ where: { goal: { user: { id: user.id } } } }),
          ]);

          const avgRefreshPerDay = Number((refreshTotal / this.WEEK_DAYS).toFixed(2));
          const avgCompletedPerDay = Number((completedInWeek / this.WEEK_DAYS).toFixed(2));

          const goalCountDegree = this.calcGoalDegree(goalCount);
          const behaviorCountDegree = this.calcBehaviorDegree(behaviorCount);

          await this.dailyUserStatRepository.upsert(
            {
              user: { id: user.id },
              statDate: todayKey,
              totalCompletedCounts,
              behaviorCompletedTopNCounts,
              goalCompletedTopNCounts,
              goalCompletedCounts,
              weeklyDailyDifficultyCompletedCounts,
              dailyDifficultyCompletedCounts,
              weeklyDifficultyCompletedCounts,
              totalDifficultyCompletedCounts,
              originCompletedRatio,
              notDoneCounts,
              completionTimeBuckets,
              checkInTotal,
              duduCatchTotal,
              goalCountDegree,
              behaviorCountDegree,
              avgRefreshPerDay,
              avgCompletedPerDay,
            },
            ['user', 'statDate'],
          );
        }),
      ),
    );
  }

  private async calcTotalCompledCounts(user: User, end?: string) {
    const where = { user: { id: user.id }, status: 'completed' } as FindOptionsWhere<TodayBehavior>;
    if (end) {
      where.date = LessThanOrEqual(end);
    }
    const totalCompletedCounts = await this.todayBehaviorRepository.count({ where });
    return totalCompletedCounts;
  }

  private async calcBehaviorCompletedTopNCounts(user: User, end?: string) {
    const topRowsQuery = this.todayBehaviorRepository
      .createQueryBuilder('tb')
      .innerJoin('tb.behavior', 'behavior')
      .select('behavior.id', 'behaviorId')
      .addSelect('behavior.title', 'behaviorTitle')
      .addSelect('COUNT(*)', 'count')
      .where('tb.userId = :userId', { userId: user.id })
      .andWhere('tb.status = :status', { status: 'completed' })
      .groupBy('behavior.id')
      .addGroupBy('behavior.title')
      .orderBy('COUNT(*)', 'DESC')
      .limit(this.TOP_N);
    if (end) {
      topRowsQuery.andWhere('tb.date <= :end', { end });
    }
    const topRows = await topRowsQuery.getRawMany();

    const behaviorCompletedTopNCounts: BehaviorCompletedCount[] = topRows.map((row) => ({
      behaviorId: row.behaviorId,
      behaviorTitle: row.behaviorTitle,
      count: Number(row.count),
    }));

    return behaviorCompletedTopNCounts;
  }

  private async calcGoalCompltedTopNCounts(user: User, end?: string) {
    const rowsQuery = this.todayBehaviorRepository
      .createQueryBuilder('tb')
      .innerJoin('tb.behavior', 'behavior')
      .innerJoin('behavior.goal', 'goal')
      .select('goal.id', 'goalId')
      .addSelect('goal.title', 'goalTitle')
      .addSelect('behavior.id', 'behaviorId')
      .addSelect('behavior.title', 'behaviorTitle')
      .addSelect('COUNT(*)', 'count')
      .where('tb.userId = :userId', { userId: user.id })
      .andWhere('tb.status = :status', { status: 'completed' })
      .groupBy('goal.id')
      .addGroupBy('goal.title')
      .addGroupBy('behavior.id')
      .addGroupBy('behavior.title')
      .orderBy('goal.id', 'ASC')
      .addOrderBy('COUNT(*)', 'DESC');
    if (end) {
      rowsQuery.andWhere('tb.date <= :end', { end });
    }
    const rows = await rowsQuery.getRawMany();

    // goal별로 Top N 행동만 추리기
    const goalMap = new Map<string, GoalCompletedTopNCount>();

    rows.forEach((row) => {
      const goalId = String(row.goalId);
      const entry = goalMap.get(goalId) ?? {
        goalId,
        goalTitle: row.goalTitle,
        behaviorCounts: [] as BehaviorCompletedCount[],
      };

      if (entry.behaviorCounts.length < this.TOP_N) {
        entry.behaviorCounts.push({
          behaviorId: row.behaviorId,
          behaviorTitle: row.behaviorTitle,
          count: Number(row.count),
        });
      }

      goalMap.set(goalId, entry);
    });
    const goalCompletedTopNCounts = Array.from(goalMap.values());
    return goalCompletedTopNCounts;
  }

  private async countCompletedInRange(userId: string, start?: string, end?: string) {
    const where = { user: { id: userId }, status: 'completed' } as FindOptionsWhere<TodayBehavior>;
    if (start && end) where.date = Between(start, end);
    else if (end) where.date = LessThanOrEqual(end);
    return this.todayBehaviorRepository.count({ where });
  }

  private async countByDifficulty(userId: string, start?: string, end?: string) {
    const qb = this.todayBehaviorRepository
      .createQueryBuilder('tb')
      .innerJoin('tb.behavior', 'behavior')
      .select('behavior.difficulty', 'difficulty')
      .addSelect('COUNT(*)', 'count')
      .where('tb.userId = :userId', { userId })
      .andWhere('tb.status = :status', { status: 'completed' })
      .groupBy('behavior.difficulty');
    if (start && end) qb.andWhere('tb.date BETWEEN :start AND :end', { start, end });
    else if (end) qb.andWhere('tb.date <= :end', { end });
    /**
       *
        SELECT b.difficulty, COUNT(*) AS count
        FROM today_behaviors tb
        JOIN behaviors b ON b.id = tb."behaviorId"
        WHERE tb."userId" = $1
        AND tb.status = 'completed'
        AND tb.date BETWEEN $2 AND $3
        GROUP BY b.difficulty;
       */

    const rows = await qb.getRawMany();
    return rows.reduce(
      (acc, row) => {
        acc[row.difficulty] = Number(row.count);
        return acc;
      },
      {} as Record<BehaviorDifficulty, number>,
    );
  }

  private async calcweeklyDailyDifficultyCompletedCounts(
    userId: string,
    start: string,
    end: string,
  ) {
    const rows = await this.todayBehaviorRepository
      .createQueryBuilder('tb')
      .innerJoin('tb.behavior', 'behavior')
      .select('tb.date', 'date')
      .addSelect('behavior.difficulty', 'difficulty')
      .addSelect('COUNT(*)', 'count')
      .where('tb.userId = :userId', { userId })
      .andWhere('tb.status = :status', { status: 'completed' })
      .andWhere('tb.date BETWEEN :start AND :end', { start, end })
      .groupBy('tb.date')
      .addGroupBy('behavior.difficulty')
      .getRawMany();

    const byDate = new Map<string, Record<string, number>>();

    rows.forEach((row) => {
      const day = String(row.date);
      const map = byDate.get(day) ?? { totalCount: 0 };
      const count = Number(row.count);

      map[row.difficulty] = count;
      map.totalCount += count;

      byDate.set(day, map);
    });

    return Array.from(byDate.values());
  }

  private async calcGoalCompletedCounts(userId: string, end?: string) {
    const rowsQuery = this.todayBehaviorRepository
      .createQueryBuilder('tb')
      .innerJoin('tb.behavior', 'behavior')
      .innerJoin('behavior.goal', 'goal')
      .select('goal.id', 'goalId')
      .addSelect('goal.title', 'goalTitle')
      .addSelect('COUNT(*)', 'count')
      .where('tb.userId = :userId', { userId })
      .andWhere('tb.status = :status', { status: 'completed' })
      .groupBy('goal.id')
      .addGroupBy('goal.title')
      .orderBy('COUNT(*)', 'DESC');
    if (end) {
      rowsQuery.andWhere('tb.date <= :end', { end });
    }
    const rows = await rowsQuery.getRawMany();

    return rows.map((row) => ({
      goalId: row.goalId,
      goalTitle: row.goalTitle,
      count: Number(row.count),
    }));
  }

  // MEMO: systemCount가 0인 경우와 userCount가 0인 경우를 구분 불가
  private async calcOriginCompletedRatio(userId: string, start: string, end: string) {
    const rows = await this.todayBehaviorRepository
      .createQueryBuilder('tb')
      .select('tb.origin', 'origin')
      .addSelect('COUNT(*)', 'count')
      .where('tb.userId = :userId', { userId })
      .andWhere('tb.status = :status', { status: 'completed' })
      .andWhere('tb.date BETWEEN :start AND :end', { start, end })
      .groupBy('tb.origin')
      .getRawMany();

    const map = rows.reduce(
      (acc, row) => {
        acc[row.origin] = Number(row.count);
        return acc;
      },
      {} as Record<TodayBehaviorOrigin, number>,
    );

    const userCount = map.user ?? 0;
    const systemCount = map.system ?? 0;
    return systemCount === 0 ? 0 : Number((userCount / systemCount).toFixed(2));
  }

  private async calcNotDoneCounts(userId: string, start: string, end: string) {
    const rows = await this.todayBehaviorRepository
      .createQueryBuilder('tb')
      .select('tb.origin', 'origin')
      .addSelect('COUNT(*)', 'count')
      .where('tb.userId = :userId', { userId })
      .andWhere('tb.status IN (:...statuses)', { statuses: ['pending', 'ignored'] })
      .andWhere('tb.date BETWEEN :start AND :end', { start, end })
      .groupBy('tb.origin')
      .getRawMany();

    return rows.reduce(
      (acc, row) => {
        acc[row.origin] = Number(row.count);
        return acc;
      },
      {} as Record<TodayBehaviorOrigin, number>,
    );
  }

  private async calcCompletionTimeBuckets(userId: string, start: string, end: string) {
    const rows = await this.todayBehaviorRepository
      .createQueryBuilder('tb')
      .select('tb.updatedAt', 'time')
      .where('tb.userId = :userId', { userId })
      .andWhere('tb.status = :status', { status: 'completed' })
      .andWhere('tb.date BETWEEN :start AND :end', { start, end })
      .getRawMany();

    const buckets: Record<CompletionTimeBucket, number> = {
      [COMPLETION_TIME_BUCKET.EARLY_MORNING]: 0,
      [COMPLETION_TIME_BUCKET.MORNING]: 0,
      [COMPLETION_TIME_BUCKET.DAYTIME]: 0,
      [COMPLETION_TIME_BUCKET.EVENING]: 0,
      [COMPLETION_TIME_BUCKET.NIGHT]: 0,
    };

    rows.forEach((row) => {
      const hour = new Date(String(row.time)).getHours();
      if (hour >= 1 && hour < 7) buckets[COMPLETION_TIME_BUCKET.EARLY_MORNING] += 1;
      else if (hour >= 7 && hour < 10) buckets[COMPLETION_TIME_BUCKET.MORNING] += 1;
      else if (hour >= 10 && hour < 17) buckets[COMPLETION_TIME_BUCKET.DAYTIME] += 1;
      else if (hour >= 17 && hour < 20) buckets[COMPLETION_TIME_BUCKET.EVENING] += 1;
      else buckets[COMPLETION_TIME_BUCKET.NIGHT] += 1;
    });

    return buckets;
  }

  private async countEvent(userId: string, type: StatEventType, start: string, end: string) {
    return this.statEventLogRepository
      .createQueryBuilder('log')
      .where('log.userId = :userId', { userId })
      .andWhere('log.eventType = :type', { type })
      .andWhere('log.createdAt BETWEEN :start AND :end', {
        start: toKstBoundary(start),
        end: toKstBoundary(end),
      })
      .getCount();
  }

  private calcGoalDegree(count: number): CountDegreeType {
    if (count <= GOAL_COUNT_THRESHOLD.LESS_BASELINE) return COUNT_DEGREE.MUCH_LESS;
    if (count <= GOAL_COUNT_THRESHOLD.BASELINE) return COUNT_DEGREE.LESS;
    if (count <= GOAL_COUNT_THRESHOLD.MORE_BASELINE) return COUNT_DEGREE.NEUTRAL;
    if (count <= GOAL_COUNT_THRESHOLD.MUCH_MORE_BASELINE) return COUNT_DEGREE.MORE;
    return COUNT_DEGREE.MUCH_MORE;
  }

  private calcBehaviorDegree(count: number): CountDegreeType {
    if (count <= BEHAVIOR_COUNT_THRESHOLD.LESS_BASELINE) return COUNT_DEGREE.MUCH_LESS;
    if (count <= BEHAVIOR_COUNT_THRESHOLD.BASELINE) return COUNT_DEGREE.LESS;
    if (count <= BEHAVIOR_COUNT_THRESHOLD.MORE_BASELINE) return COUNT_DEGREE.NEUTRAL;
    if (count <= BEHAVIOR_COUNT_THRESHOLD.MUCH_MORE_BASELINE) return COUNT_DEGREE.MORE;
    return COUNT_DEGREE.MUCH_MORE;
  }
}
