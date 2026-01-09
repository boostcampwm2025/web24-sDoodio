import { BEHAVIOR_TITLE_MAX_LENGTH } from '../constants/behavior.constants';
import { GOAL_TITLE_MAX_LENGTH } from '../constants/goal.constants';
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
  title: z.string().min(1).max(BEHAVIOR_TITLE_MAX_LENGTH),
  difficulty: z.enum(BEHAVIOR_DIFFICULTIES),
});

export const CreateGoalRequestSchema = z.object({
  goalTitle: z.string().min(1).max(GOAL_TITLE_MAX_LENGTH),
  goalColor: z.enum(GOAL_COLORS),
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
  behaviors: z.array(CreateGoalBehaviorResponseSchema),
});

export type CreateGoalResponse = z.infer<typeof CreateGoalResponseSchema>;

export const GetGoalSummarySchema = z.object({
  id: z.uuid(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  title: z.string().min(1).max(GOAL_TITLE_MAX_LENGTH),
  color: z.enum(GOAL_COLORS),
});

export const GetGoalsResponseSchema = z.array(GetGoalSummarySchema);

export type GetGoalSummary = z.infer<typeof GetGoalSummarySchema>;
export type GetGoalsResponse = z.infer<typeof GetGoalsResponseSchema>;

// Uncaught (in promise) ZodError: [
//   {
//     "origin": "string",
//     "code": "invalid_format",
//     "format": "uuid",
//     "pattern": "/^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-7[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$/",
//     "path": [
//       0,
//       "id"
//     ],
//     "message": "Invalid UUID"
//   },
//   {
//     "origin": "string",
//     "code": "invalid_format",
//     "format": "uuid",
//     "pattern": "/^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-7[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$/",
//     "path": [
//       1,
//       "id"
//     ],
//     "message": "Invalid UUID"
//   },
//   {
//     "origin": "string",
//     "code": "invalid_format",
//     "format": "uuid",
//     "pattern": "/^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-7[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$/",
//     "path": [
//       2,
//       "id"
//     ],
//     "message": "Invalid UUID"
//   }
// ]
//     at fetchGoals (fetchGoals.api.ts:16:33)
//     at async Promise.all (:5173/index 1)
