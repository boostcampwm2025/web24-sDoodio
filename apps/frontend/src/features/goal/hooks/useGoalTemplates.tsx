import { useEffect, useState } from 'react';
import type { GoalTemplate } from '@web24/shared';

import { fetchGoalTemplates } from '../apis/fetchGoalTemplates.api';

type UseGoalTemplatesResult = {
  templates: GoalTemplate[];
  error: string | null;
  loading: boolean;
};

export function useGoalTemplates(): UseGoalTemplatesResult {
  const [templates, setTemplates] = useState<GoalTemplate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const loadTemplates = async () => {
      try {
        const payload = await fetchGoalTemplates();
        if (!cancelled) {
          setTemplates(payload);
          setError(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : '템플릿을 불러오지 못했어요.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadTemplates();

    return () => {
      cancelled = true;
    };
  }, []);

  return { templates, error, loading };
}
