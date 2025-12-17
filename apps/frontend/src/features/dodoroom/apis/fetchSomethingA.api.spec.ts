import { describe, expect, it, vi } from 'vitest';

import { fetchSomethingA } from './fetchSomethingA.api';

describe('fetchSomethingA', () => {
  it('calls fetch and returns parsed json', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'demo', name: 'Demo' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchSomethingA('demo')).resolves.toEqual({
      id: 'demo',
      name: 'Demo',
    });
    expect(fetchMock).toHaveBeenCalledWith('/dodo-rooms/demo');
  });
});
