import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { deleteTodayBehavior } from './deleteTodayBehavior.api';

describe('deleteTodayBehavior', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns id on success', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '01890fba-7e6a-7b6b-9e5d-0f3c9b8b4c6d' }),
    });

    const result = await deleteTodayBehavior('01890fba-7e6a-7b6b-9e5d-0f3c9b8b4c6d');

    expect(result).toEqual({ id: '01890fba-7e6a-7b6b-9e5d-0f3c9b8b4c6d' });
    expect(fetch).toHaveBeenCalledWith(
      '/api/today-behaviors/01890fba-7e6a-7b6b-9e5d-0f3c9b8b4c6d',
      expect.any(Object),
    );
  });

  it('throws error on fetch failure', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
    });

    await expect(deleteTodayBehavior('bad-id')).rejects.toThrow('Failed to fetch');
  });
});
