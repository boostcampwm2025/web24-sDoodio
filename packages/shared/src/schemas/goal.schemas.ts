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
