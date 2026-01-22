import { BEHAVIOR_DIFFICULTIES, BehaviorDifficulty, GOAL_COLORS } from '../types';
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
