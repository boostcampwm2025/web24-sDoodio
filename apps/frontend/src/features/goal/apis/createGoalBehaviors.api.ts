import type { Behavior } from '@web24/shared';

export const createGoalBehaviors = async (
  goalId: string,
  behaviors: Omit<Behavior, 'id'>[],
): Promise<void> => {
  const response = await fetch(`/api/goals/${goalId}/behaviors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ behaviors }),
  });

  if (!response.ok) throw new Error(`Create failed: ${response.status}`);
};
