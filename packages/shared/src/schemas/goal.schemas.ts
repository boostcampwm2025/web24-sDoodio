import {
  BEHAVIOR_ERROR_MESSAGES,
  BEHAVIOR_TITLE_MAX_LENGTH,
} from '../constants/behavior.constants';
import { GOAL_ERROR_MESSAGES, GOAL_TITLE_MAX_LENGTH } from '../constants/goal.constants';
import { BEHAVIOR_DIFFICULTIES } from '../types/behavior.types';
import { GOAL_COLORS } from '../types/goal.types';
import { z } from '../zod';

export const GoalTemplateLevelSchema = z.object({
  마음열기: z.array(z.string().min(1)),
  시작하기: z.array(z.string().min(1)),
  이어가기: z.array(z.string().min(1)),
  몰입하기: z.array(z.string().min(1)),
});

export const GoalTemplateSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  level: GoalTemplateLevelSchema,
});

export const GoalTemplateListResponseSchema = z.array(GoalTemplateSchema);

export type GoalTemplate = z.infer<typeof GoalTemplateSchema>;
export type GoalTemplateListResponse = z.infer<typeof GoalTemplateListResponseSchema>;

export const CreateGoalBehaviorSchema = z.object({
  title: z
    .string()
    .min(1, BEHAVIOR_ERROR_MESSAGES.title_length)
    .max(BEHAVIOR_TITLE_MAX_LENGTH, BEHAVIOR_ERROR_MESSAGES.title_length),
  difficulty: z.enum(BEHAVIOR_DIFFICULTIES),
});

export const CreateGoalRequestSchema = z.object({
  goalTitle: z
    .string()
    .min(1, GOAL_ERROR_MESSAGES.title_length)
    .max(GOAL_TITLE_MAX_LENGTH, GOAL_ERROR_MESSAGES.title_length),
  goalColor: z.enum(GOAL_COLORS),
  templateId: z.string().optional(),
  behaviors: z.array(CreateGoalBehaviorSchema).min(1),
});

export type CreateGoalRequest = z.infer<typeof CreateGoalRequestSchema>;

export const CreateGoalBehaviorResponseSchema = CreateGoalBehaviorSchema.extend({
  id: z.uuid({ version: 'v7' }),
});

export const CreateGoalResponseSchema = z.object({
  id: z.uuid({ version: 'v7' }),
  title: z.string().min(1).max(GOAL_TITLE_MAX_LENGTH),
  color: z.enum(GOAL_COLORS),
  templateId: z.string().optional(),
  behaviors: z.array(CreateGoalBehaviorResponseSchema),
});

export type CreateGoalResponse = z.infer<typeof CreateGoalResponseSchema>;

export const UpdateGoalRequestSchema = z.object({
  title: z.string().min(1).max(GOAL_TITLE_MAX_LENGTH),
  color: z.enum(GOAL_COLORS),
});

export type UpdateGoalRequest = z.infer<typeof UpdateGoalRequestSchema>;

export const UpdateGoalResponseSchema = z.object({
  id: z.uuid({ version: 'v7' }),
  title: z.string().min(1).max(GOAL_TITLE_MAX_LENGTH),
  color: z.enum(GOAL_COLORS),
});

export type UpdateGoalResponse = z.infer<typeof UpdateGoalResponseSchema>;

export const GetGoalSummarySchema = z.object({
  id: z.uuid(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  title: z.string().min(1).max(GOAL_TITLE_MAX_LENGTH),
  color: z.enum(GOAL_COLORS),
  behaviorCount: z.number().int().nonnegative(),
  templateId: z.string().optional(),
});

export const GetGoalsResponseSchema = z.array(GetGoalSummarySchema);

export type GetGoalSummary = z.infer<typeof GetGoalSummarySchema>;
export type GetGoalsResponse = z.infer<typeof GetGoalsResponseSchema>;

export const GoalSchema = z.object({
  id: z.uuid({ version: 'v7' }),
  title: z.string().min(1).max(GOAL_TITLE_MAX_LENGTH),
  color: z.enum(GOAL_COLORS),
  templateId: z.string().optional(),
});

export const GetGoalResponseSchema = GoalSchema;
export type GetGoalResponse = z.infer<typeof GetGoalResponseSchema>;

export const GoalStampSchema = z.object({
  id: z.uuid({ version: 'v7' }),
  title: z.string().min(1),
  difficulty: z.enum(BEHAVIOR_DIFFICULTIES),
  updatedAt: z.iso.datetime(),
});

export const GetGoalStampsResponseSchema = z.array(GoalStampSchema);
export type GetGoalStampsResponse = z.infer<typeof GetGoalStampsResponseSchema>;

export const CreateGoalBehaviorsRequestSchema = z.object({
  behaviors: z.array(CreateGoalBehaviorSchema).min(1),
});
export type CreateGoalBehaviorsRequest = z.infer<typeof CreateGoalBehaviorsRequestSchema>;

export const UpdateGoalBehaviorsRequestSchema = z.object({
  behaviors: z.array(CreateGoalBehaviorResponseSchema),
});
export type UpdateGoalBehaviorsRequest = z.infer<typeof UpdateGoalBehaviorsRequestSchema>;

export const DeleteGoalBehaviorsRequestSchema = z.object({
  behaviorIds: z.array(z.uuid({ version: 'v7' })).min(1),
});
export type DeleteGoalBehaviorsRequest = z.infer<typeof DeleteGoalBehaviorsRequestSchema>;
