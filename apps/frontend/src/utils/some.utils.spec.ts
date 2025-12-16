import { describe, expect, it } from 'vitest';

import { sum } from './some.utils';

describe('sum', () => {
  it('adds two numbers', () => {
    expect(sum(1, 2)).toBe(3);
  });
});
