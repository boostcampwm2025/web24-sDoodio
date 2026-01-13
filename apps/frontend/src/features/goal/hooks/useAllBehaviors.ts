import { useEffect, useState, useCallback } from 'react';
import type { Behavior } from '@web24/shared';
import { fetchAllBehaviors } from '../apis/fetchAllBehaviors.api';

export function useAllBehaviors(enabled: boolean = false) {
  const [allBehaviors, setAllBehaviors] = useState<Behavior[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllBehaviors();
      setAllBehaviors(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch all behaviors'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, fetchData]);

  return { allBehaviors, isLoading, error, refetch: fetchData };
}
