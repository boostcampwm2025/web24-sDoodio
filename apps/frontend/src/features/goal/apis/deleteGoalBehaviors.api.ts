export const deleteGoalBehaviors = async (goalId: string, behaviorIds: string[]): Promise<void> => {
  const response = await fetch(`/api/goals/${goalId}/behaviors`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ behaviorIds }),
  });

  if (!response.ok) throw new Error(`Delete failed: ${response.status}`);
};
