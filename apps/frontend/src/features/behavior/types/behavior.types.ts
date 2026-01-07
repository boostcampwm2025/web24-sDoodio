import type { Behavior } from '@/shared/components/behavior/BehaviorCard.types';

export interface BehaviorListProps {
  behaviors: Behavior[];
  onToggle: (id: string) => void;
}
