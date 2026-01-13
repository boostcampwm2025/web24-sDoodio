import { useEffect, useState } from 'react';
import type { GetGoalsResponse } from '@web24/shared';
import { fetchGoals } from '../apis/fetchGoals.api';

export function useGoals() {
  const [goals, setGoals] = useState<GetGoalsResponse | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadGoals = async () => {
      try {
        const data = await fetchGoals();
        if (!cancelled) {
          setGoals(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to fetch goals'));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadGoals();

    return () => {
      cancelled = true;
    };
  }, []);

  return { goals, isLoading, error };
}
