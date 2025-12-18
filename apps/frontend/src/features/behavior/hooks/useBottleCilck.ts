import type { StarParticle } from '../types/waterBottle.types';

export function applyClickForce(
  stars: StarParticle[],
  clickX: number,
  clickY: number,
  progress: number,
) {
  return stars.map((star) => {
    const dx = star.x - clickX;
    const aspectCorrection = progress < 30 ? 0.3 : 1;
    const dy = (star.y - clickY) * aspectCorrection;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const blastRadius = 35;

    // 클릭 위치에서 가까운 별일수록 더 큰 힘을 받음
    if (distance < blastRadius) {
      const force = (blastRadius - distance) * 0.4;
      return {
        ...star,
        vx: star.vx + (dx / distance) * force,
        vy: star.vy + (dy / distance) * force,
      };
    }
    return star;
  });
}
