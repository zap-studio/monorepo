import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useIsServer } from "./use-is-server.ts";

describe(useIsServer, () => {
  it("is false once mounted on the client", () => {
    const { result, unmount } = renderHook(() => useIsServer());

    expect(result.current).toBe(false);

    unmount();
  });
});
