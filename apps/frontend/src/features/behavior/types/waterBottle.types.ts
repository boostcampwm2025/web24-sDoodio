export interface WaterBottleProps {
  progress: number; // 0 ~ 100
  badgeCount: number; // 별 개수
}

export interface StarParticle {
  id: number;
  x: number; // %
  y: number; // %
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
}

export interface BubbleProps {
  left: string;
  duration: string;
  delay: string;
}

export interface WaveLayerProps {
  color: string;
  opacity: string;
  duration: string;
  delay?: string;
  zIndex: number;
}
