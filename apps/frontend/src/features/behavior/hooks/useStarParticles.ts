import { useEffect, useRef, useState, useCallback } from 'react';
import type { StarParticle } from '../types/waterBottle.types';
import { updateStar } from '../utils/starPhysics';

export function useStarParticles(badgeCount: number) {
  const [stars, setStars] = useState<StarParticle[]>([]);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    setStars((prev) => {
      const diff = badgeCount - prev.length;
      if (diff <= 0) return prev;

      // 새로운 별 추가
      return [
        ...prev,
        ...Array.from({ length: diff }).map((_, i) => ({
          id: prev.length + i,
          x: Math.random() * 90,
          y: Math.random() * 70,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          size: 1.2 + Math.random() * 1.5,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 1,
        })),
      ];
    });
  }, [badgeCount]);

  const animate = useCallback(() => {
    setStars((prev) => prev.map(updateStar));
    requestRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animate]);

  return { stars, setStars };
}
