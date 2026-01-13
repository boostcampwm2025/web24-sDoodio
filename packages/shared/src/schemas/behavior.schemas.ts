import { BEHAVIOR_DIFFICULTIES, TODAY_BEHAVIOR_STATUS } from '../types/behavior.types';
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

export type TodayBehavior = z.infer<typeof TodayBehaviorSchema>;

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
  typeof PatchTodayBehaviorStatusRequestSchema
>;
