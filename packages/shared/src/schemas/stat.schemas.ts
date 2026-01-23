import {
  BEHAVIOR_DIFFICULTIES,
  BehaviorDifficulty,
  TODAY_BEHAVIOR_ORIGIN,
  GOAL_COLORS,
} from '../types';
import { z } from '../zod';

export const DifficultyStatsSchema = z.record(z.enum(BEHAVIOR_DIFFICULTIES), z.number());
export type DifficultyStats = Record<BehaviorDifficulty, number>;

export const GetDifficultyStatsResponseSchema = z.array(DifficultyStatsSchema);
export type GetDifficultyStatsResponse = DifficultyStats[];

export const BehaviorStatItemSchema = z.object({
  id: z.uuid({ version: 'v7' }),
  behaviorTitle: z.string().min(1),
  behaviorDifficulty: z.enum(BEHAVIOR_DIFFICULTIES),
  goalTitle: z.string().min(1),
  goalColor: z.enum(GOAL_COLORS),
  count: z.number(),
});
export type BehaviorStatItem = z.infer<typeof BehaviorStatItemSchema>;

export const GoalSpecificBehaviorItemSchema = BehaviorStatItemSchema.omit({
  goalTitle: true,
  goalColor: true,
});

export type GoalSpecificBehaviorItem = z.infer<typeof GoalSpecificBehaviorItemSchema>;

export const AllBehaviorStatItemSchema = z.object({
  totalCount: z.number(),
  items: z.array(BehaviorStatItemSchema),
});
export type AllBehaviorStatItem = z.infer<typeof AllBehaviorStatItemSchema>;

export const GoalBehaviorStatSchema = z.object({
  id: z.uuid({ version: 'v7' }),
  goalTitle: z.string().min(1),
  goalColor: z.enum(GOAL_COLORS),
  totalCount: z.number(),
  items: z.array(GoalSpecificBehaviorItemSchema),
});
export type GoalBehaviorStat = z.infer<typeof GoalBehaviorStatSchema>;

export const GetTopBehaviorsStatResponseSchema = z.object({
  all: AllBehaviorStatItemSchema,
  goals: z.array(GoalBehaviorStatSchema),
});
export type GetTopBehaviorsStatResponse = z.infer<typeof GetTopBehaviorsStatResponseSchema>;

export const GetTotalCompletedCountResponseSchema = z.object({
  count: z.number(),
});
export type GetTotalCompletedCountResponse = z.infer<typeof GetTotalCompletedCountResponseSchema>;
export const COMPLETION_TIME_BUCKETS = ['1~7', '7~10', '10~17', '17~20', '20~1'] as const;
export type CompletionTimeBucket = (typeof COMPLETION_TIME_BUCKETS)[number];

export const COUNT_DEGREES = ['MUCH_LESS', 'LESS', 'NEUTRAL', 'MORE', 'MUCH_MORE'] as const;
export type CountDegree = (typeof COUNT_DEGREES)[number];

const DifficultyCountsSchema = z.record(z.enum(BEHAVIOR_DIFFICULTIES), z.number());
const OriginCountsSchema = z.record(z.enum(TODAY_BEHAVIOR_ORIGIN), z.number());
const CompletionTimeBucketsSchema = z.record(z.enum(COMPLETION_TIME_BUCKETS), z.number());

export const GetStatInsightsResponseSchema = z.object({
  statDate: z.string(),
  dailyDifficultyCompletedCounts: DifficultyCountsSchema,
  weeklyDifficultyCompletedCounts: DifficultyCountsSchema,
  totalDifficultyCompletedCounts: DifficultyCountsSchema,
  originCompletedCounts: OriginCountsSchema,
  notDoneCounts: OriginCountsSchema,
  completionTimeBuckets: CompletionTimeBucketsSchema,
  checkInTotal: z.number(),
  duduCatchTotal: z.number(),
  goalCountDegree: z.enum(COUNT_DEGREES),
  behaviorCountDegree: z.enum(COUNT_DEGREES),
  avgRefreshPerDay: z.number(),
  avgCompletedPerDay: z.number(),
});

export type GetStatInsightsResponse = z.infer<typeof GetStatInsightsResponseSchema>;
