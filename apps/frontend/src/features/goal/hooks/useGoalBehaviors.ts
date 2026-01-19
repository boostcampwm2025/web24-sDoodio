import { useCallback, useEffect, useState } from 'react';
import type { Behavior } from '@web24/shared';
import { fetchGoalBehaviors } from '../apis/fetchGoalBehaviors.api';

export function useGoalBehaviors(goalId: string, enabled: boolean = true) {
  const [behaviors, setBehaviors] = useState<Behavior[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadBehaviors = useCallback(async () => {
    if (!goalId) return;
    setIsLoading(true);
    try {
      const data = await fetchGoalBehaviors(goalId);
      setBehaviors(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch'));
    } finally {
      setIsLoading(false);
    }
  }, [goalId]);

  useEffect(() => {
    if (enabled) loadBehaviors();
  }, [enabled, loadBehaviors]);

  return { behaviors, isLoading, error, refetch: loadBehaviors };
}
