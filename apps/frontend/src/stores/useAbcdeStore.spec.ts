import { describe, expect, it } from "vitest";

import { useAbcdeStore } from "./useAbcdeStore";

describe("useAbcdeStore", () => {
  it("increments count", () => {
    useAbcdeStore.setState({ count: 0 });
    expect(useAbcdeStore.getState().count).toBe(0);
    useAbcdeStore.getState().increment();
    expect(useAbcdeStore.getState().count).toBe(1);
  });
});
