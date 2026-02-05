import { describe, it, expect } from 'vitest';
import { getRandomElement, getRandomIndex } from './random';

describe('getRandomIndex', () => {
  it('should return a number within the range [0, length - 1]', () => {
    const length = 10;
    const index = getRandomIndex(length);
    expect(index).toBeGreaterThanOrEqual(0);
    expect(index).toBeLessThan(length);
  });

  it('should return -1 for length <= 0', () => {
    expect(getRandomIndex(0)).toBe(-1);
    expect(getRandomIndex(-5)).toBe(-1);
  });
});

describe('getRandomElement', () => {
  it('should return an element from the array', () => {
    const array = ['a', 'b', 'c'];
    const element = getRandomElement(array);
    expect(array).toContain(element);
  });

  it('should return undefined for empty array', () => {
    const array: string[] = [];
    const element = getRandomElement(array);
    expect(element).toBeUndefined();
  });
});
