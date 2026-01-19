import type { Behavior } from '@web24/shared';

export const updateGoalBehaviors = async (goalId: string, behaviors: Behavior[]): Promise<void> => {
  const response = await fetch(`/api/goals/${goalId}/behaviors`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ behaviors }),
  });

  if (!response.ok) throw new Error(`Update failed: ${response.status}`);
};
