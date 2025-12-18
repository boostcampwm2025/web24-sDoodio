import type { StarParticle } from '../types/waterBottle.types';

export function updateStar(star: StarParticle): StarParticle {
  let { x, y, vx, vy, rotation } = star;
  const { rotationSpeed } = star;

  // 물속 유영
  vx += (Math.random() - 0.5) * 0.03;
  vy += (Math.random() - 0.5) * 0.03;

  // 저항
  vx *= 0.99;
  vy *= 0.99;

  // 속도 제한
  const maxSpeed = 0.4;
  vx = Math.max(-maxSpeed, Math.min(maxSpeed, vx));
  vy = Math.max(-maxSpeed, Math.min(maxSpeed, vy));

  // 위치 업데이트
  x += vx;
  y += vy;
  rotation += rotationSpeed;

  // 경계 반사
  if (x <= 5 || x >= 90) vx *= -0.8;
  if (y <= 5) vy *= -0.8;

  // 중력 효과
  if (y > 75) vy -= 0.015;
  if (y > 80) {
    y = 80;
    vy = -Math.abs(vy) * 0.6;
  }

  return { ...star, x, y, vx, vy, rotation };
}
