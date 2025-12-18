export interface BehaviorCategory {
  id: string;
  label: string;
  color: string; // Tailwind Class
}

export interface BehaviorDetail {
  id: string;
  title: string;
  description: string;
  category: BehaviorCategory;
  period: string;
  isMandatory: boolean; // 필수 여부
  totalStamps: number;
  goalStamps: number; // 임시
  isAddedToToday: boolean; // 오늘 할 일 목록에 추가되었는지
  isStampedToday: boolean; // 오늘 도장을 찍었는지
}

export interface BehaviorHeaderProps {
  info: BehaviorDetail;
  onToggleAdd: () => void;
}

export interface BehaviorStampProps {
  info: BehaviorDetail;
  onStamp: () => void;
}
