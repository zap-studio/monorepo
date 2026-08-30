import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useIsClient } from "./use-is-client.ts";

describe("useIsClient", () => {
  it("is true once mounted on the client", () => {
    const { result, unmount } = renderHook(() => useIsClient());

    expect(result.current).toBe(true);

    unmount();
  });
});
