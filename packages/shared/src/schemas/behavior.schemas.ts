import {
  AI_BEHAVIOR_STATUS,
  BEHAVIOR_DIFFICULTIES,
  TODAY_BEHAVIOR_STATUS,
  type Behavior,
} from '../types/behavior.types';
import { GOAL_COLORS } from '../types/goal.types';
import { z } from '../zod';

export const TodayBehaviorSchema = z.object({
  id: z.uuid({ version: 'v7' }),
  title: z.string().min(1),
  goalTitle: z.string().min(1),
  goalColor: z.enum(GOAL_COLORS),
  difficulty: z.enum(BEHAVIOR_DIFFICULTIES),
  isChecked: z.boolean(),
  isRecommended: z.boolean(),
});

export const AIBehaviorSchema = TodayBehaviorSchema;

export type TodayBehavior = z.infer<typeof TodayBehaviorSchema>;

export const BehaviorSchema = z.object({
  id: z.uuid({ version: 'v7' }),
  goalId: z.uuid({ version: 'v7' }).optional(),
  title: z.string().min(1),
  difficulty: z.enum(BEHAVIOR_DIFFICULTIES),
});

export const GetAllBehaviorsResponseSchema = z.array(BehaviorSchema);
export type GetAllBehaviorsResponse = Behavior[];

export const GetGoalBehaviorsResponseSchema = z.array(BehaviorSchema);
export type GetGoalBehaviorsResponse = Behavior[];

export const GetTodayBehaviorsResponseSchema = z.array(TodayBehaviorSchema);
export type GetTodayBehaviorsResponse = z.infer<typeof GetTodayBehaviorsResponseSchema>;

export const PatchTodayBehaviorStatusRequestSchema = z.object({
  status: z.enum(TODAY_BEHAVIOR_STATUS),
});
export type PatchTodayBehaviorStatusRequest = z.infer<typeof PatchTodayBehaviorStatusRequestSchema>;

export const PatchTodayBehaviorStatusResponseSchema = z.object({
  id: z.uuid({ version: 'v7' }),
  status: z.enum(TODAY_BEHAVIOR_STATUS),
});
export type PatchTodayBehaviorStatusResponse = z.infer<
  typeof PatchTodayBehaviorStatusResponseSchema
>;

export const GetAIBehaviorResponseSchema = z.array(AIBehaviorSchema);
export type GetAIBehaviorResponse = z.infer<typeof GetAIBehaviorResponseSchema>;

export const PostAIBehaviorResponseSchema = z.array(AIBehaviorSchema);
export type PostAIBehaviorResponse = z.infer<typeof PostAIBehaviorResponseSchema>;

export const PatchAIBehaviorStatusRequestSchema = z.object({
  status: z.enum(AI_BEHAVIOR_STATUS),
});
export type PatchAIBehaviorStatusRequest = z.infer<typeof PatchAIBehaviorStatusRequestSchema>;

export const PatchAIBehaviorStatusResponseSchema = z.object({
  id: z.uuid({ version: 'v7' }),
  status: z.enum(AI_BEHAVIOR_STATUS),
});
export type PatchAIBehaviorStatusResponse = z.infer<typeof PatchAIBehaviorStatusResponseSchema>;
