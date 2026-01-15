import type { Behavior } from '@/shared/components/behavior/BehaviorCard.types';
import { useEffect, useState } from 'react';
import { fetchAIBehaviors } from '../apis/fetchAIBehaviors.api';
import { createAIBehaviors } from '../apis/createAIBehaviors.api';

export function useAIBehaviors() {
  const [behaviors, setBehaviors] = useState<Behavior[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMaking, setIsMaking] = useState(false);
  const [isError, setIsError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);

    const getAIBehaviors = async () => {
      try {
        const fetched = await fetchAIBehaviors();
        setBehaviors(fetched);

        if (fetched.length === 0) {
          setIsMaking(true);
          const created = await createAIBehaviors();
          setBehaviors(created);
          setIsMaking(false);
        }

        setIsError(null);
      } catch (err) {
        setIsError(err instanceof Error ? err : new Error('Failed to fetch ai behaviors'));
      } finally {
        setIsLoading(false);
      }
    };

    getAIBehaviors();
  }, []);

  return { behaviors, setBehaviors, isLoading, isMaking, isError };
}
