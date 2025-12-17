import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DodoRoom } from "./DodoRoom";

vi.mock("../hooks/useHook", () => ({
  useHook: () => ({
    room: { id: "demo", name: "Demo" },
    error: null,
    loading: false,
  }),
}));

describe("DodoRoom", () => {
  it("renders loaded data", () => {
    render(<DodoRoom />);
    expect(screen.getByText("DodoRoom")).toBeInTheDocument();
    expect(screen.getByText(/Loaded:/)).toBeInTheDocument();
  });
});
