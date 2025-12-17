import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useHook } from "./useHook";

vi.mock("../apis/fetchSomethingA.api", () => ({
  fetchSomethingA: vi.fn().mockResolvedValue({ id: "demo", name: "Demo" }),
}));

describe("useHook", () => {
  it("loads room data", async () => {
    const { result } = renderHook(() => useHook("demo"));
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.room).toEqual({ id: "demo", name: "Demo" });
    });
    expect(result.current.error).toBeNull();
  });
});
