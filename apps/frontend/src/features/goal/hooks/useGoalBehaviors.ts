import { useEffect, useState } from 'react';
import type { Behavior } from '@web24/shared';
import { fetchGoalBehaviors } from '../apis/fetchGoalBehaviors.api';

export function useGoalBehaviors(goalId: string, enabled: boolean = true) {
  const [behaviors, setBehaviors] = useState<Behavior[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (enabled && goalId) {
      setIsLoading(true);

      const loadBehaviors = async () => {
        try {
          const data = await fetchGoalBehaviors(goalId);
          if (!cancelled) {
            setBehaviors(data);
            setError(null);
          }
        } catch (err) {
          if (!cancelled) {
            setError(err instanceof Error ? err : new Error('Failed to fetch behaviors'));
          }
        } finally {
          if (!cancelled) {
            setIsLoading(false);
          }
        }
      };

      loadBehaviors();
    }

    return () => {
      cancelled = true;
    };
  }, [goalId, enabled]);

  return { behaviors, isLoading, error };
}
