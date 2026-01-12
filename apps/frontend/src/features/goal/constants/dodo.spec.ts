import { describe, it, expect } from 'vitest';
import { DODO_LINES } from './dodo';

describe('DODO_LINES', () => {
  it('필수 키를 가진다', () => {
    expect(Object.keys(DODO_LINES).sort()).toEqual(
      ['select', 'goal', 'open', 'start', 'continue', 'deep', 'summary'].sort(),
    );
  });

  it('각 섹션은 비어있지 않은 문자열 배열이다', () => {
    Object.values(DODO_LINES).forEach((lines) => {
      expect(Array.isArray(lines)).toBe(true);
      expect(lines.length).toBeGreaterThan(0);
      lines.forEach((line) => {
        expect(typeof line).toBe('string');
        expect(line.length).toBeGreaterThan(0);
      });
    });
  });

  it('단계별 섹션은 여러 줄을 포함한다', () => {
    expect(DODO_LINES.open.length).toBeGreaterThan(1);
    expect(DODO_LINES.start.length).toBeGreaterThan(1);
    expect(DODO_LINES.continue.length).toBeGreaterThan(1);
    expect(DODO_LINES.deep.length).toBeGreaterThan(1);
  });
});
