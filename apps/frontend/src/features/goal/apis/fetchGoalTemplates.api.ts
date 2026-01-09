import { GoalTemplateListResponseSchema, type GoalTemplate } from '@web24/shared';

export async function fetchGoalTemplates(): Promise<GoalTemplate[]> {
  const response = await fetch(`api/goals/templates`);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  const json = await response.json();
  return GoalTemplateListResponseSchema.parse(json);
}
