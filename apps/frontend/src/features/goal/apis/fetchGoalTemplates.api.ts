import { GoalTemplateListResponseSchema, type GoalTemplate } from '@web24/shared';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export async function fetchGoalTemplates(): Promise<GoalTemplate[]> {
  const response = await fetch(`${API_BASE}/goals/templates`);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  const json = await response.json();
  return GoalTemplateListResponseSchema.parse(json);
}
