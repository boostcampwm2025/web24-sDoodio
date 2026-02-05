import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BehaviorDifficulty, TodayBehaviorOrigin } from '@web24/shared';
import { BaseIdCreatedEntity } from '../../common/entities/base.entity';
import { User } from '../user/user.entity';

export const COUNT_DEGREE = {
  MUCH_LESS: 'MUCH_LESS',
  LESS: 'LESS',
  NEUTRAL: 'NEUTRAL',
  MORE: 'MORE',
  MUCH_MORE: 'MUCH_MORE',
} as const;
export type CountDegreeType = (typeof COUNT_DEGREE)[keyof typeof COUNT_DEGREE];

// MUCH_LESS: 1~2, LESS: 3~5, NEUTRAL: 6~7, MORE: 8~10, MUCH_MORE: 11~
export const GOAL_COUNT_THRESHOLD = {
  LESS_BASELINE: 2,
  BASELINE: 5,
  MORE_BASELINE: 7,
  MUCH_MORE_BASELINE: 10,
} as const;

// MUCH_LESS: 1~20, LESS: 21~50, NEUTRAL: 51~70, MORE: 71~100, MUCH_MORE: 101~
const BEHAVIOR_PER_GOAL = 10;
export const BEHAVIOR_COUNT_THRESHOLD = {
  LESS_BASELINE: GOAL_COUNT_THRESHOLD.LESS_BASELINE * BEHAVIOR_PER_GOAL,
  BASELINE: GOAL_COUNT_THRESHOLD.BASELINE * BEHAVIOR_PER_GOAL,
  MORE_BASELINE: GOAL_COUNT_THRESHOLD.MORE_BASELINE * BEHAVIOR_PER_GOAL,
  MUCH_MORE_BASELINE: GOAL_COUNT_THRESHOLD.MUCH_MORE_BASELINE * BEHAVIOR_PER_GOAL,
} as const;

export const COMPLETION_TIME_BUCKET = {
  EARLY_MORNING: '1~7',
  MORNING: '7~10',
  DAYTIME: '10~17',
  EVENING: '17~20',
  NIGHT: '20~1',
} as const;
export type CompletionTimeBucket =
  (typeof COMPLETION_TIME_BUCKET)[keyof typeof COMPLETION_TIME_BUCKET];

export interface BehaviorCompletedCount {
  behaviorId: string;
  behaviorTitle: string;
  count: number;
}

export interface GoalCompletedTopNCount {
  goalId: string;
  goalTitle: string;
  behaviors: BehaviorCompletedCount[];
}

export interface GoalCompletedCount {
  goalId: string;
  goalTitle: string;
  count: number;
}

@Index(['user', 'statDate'], { unique: true })
@Entity({ name: 'daily_user_stats' })
export class DailyUserStat extends BaseIdCreatedEntity {
  @ManyToOne(() => User, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'date' })
  statDate!: string; // YYYY-MM-DD

  // A: today_behaviors 기반
  @Column({ type: 'bigint', default: 0 })
  totalCompletedCounts!: number; // 누적: 총 수행 행동 횟수

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  behaviorCompletedTopNCounts!: BehaviorCompletedCount[]; // 누적: TOP N 행동 수행 횟수 통계

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  goalCompletedTopNCounts!: GoalCompletedTopNCount[]; // 누적: 목표 별 수행 Top N 행동 통계

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  goalCompletedCounts!: GoalCompletedCount[]; // 누적 목표 별 수행 행동 통계

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  weeklyDailyDifficultyCompletedCounts!: Record<BehaviorDifficulty, number>[]; // 주간을 일간으로 나눠서 난이도 별 수행 횟수

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  dailyDifficultyCompletedCounts!: Record<BehaviorDifficulty, number>; // 일간 난이도 별 수행 횟수

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  weeklyDifficultyCompletedCounts!: Record<BehaviorDifficulty, number>; // 주간 난이도 별 수행 횟수

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  totalDifficultyCompletedCounts!: Record<BehaviorDifficulty, number>; // 누적 난이도별 수행 횟수

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  originCompletedCounts!: Record<TodayBehaviorOrigin, number>; // 주간: 추출/직접 추가 완료 횟수

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  notDoneCounts!: Record<TodayBehaviorOrigin, number>; // 주간: 안 한 오늘 행동 수행

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  completionTimeBuckets!: Record<CompletionTimeBucket, number>; // 수행 완료 체크 시간 변화 추이

  // B: stat_event_logs 기반
  @Column({ type: 'bigint', default: 0 })
  checkInTotal!: number; // 누적: 서비스 접속 횟수

  @Column({ type: 'bigint', default: 0 })
  duduCatchTotal!: number; // 누적: 두두 잡은 횟수

  // C: goals/behaviors 기반
  @Column({ type: 'enum', enum: Object.values(COUNT_DEGREE) })
  goalCountDegree!: CountDegreeType; // 절대값 대비 목표 개수

  @Column({ type: 'enum', enum: Object.values(COUNT_DEGREE) })
  behaviorCountDegree!: CountDegreeType; // 절대값 대비 행동 개수

  // 평균/비율
  @Column({ type: 'numeric', precision: 6, scale: 2, default: 0 })
  avgRefreshPerDay!: number; // 주간: 일 평균 새로고침 횟수

  @Column({ type: 'numeric', precision: 6, scale: 2, default: 0 })
  avgCompletedPerDay!: number; // 주간: 일 평균 수행 행동 횟수
}
