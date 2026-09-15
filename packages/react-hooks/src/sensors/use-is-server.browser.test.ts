import { describe, expect, it } from "vitest";

import { renderHook } from "../../tests/_react.ts";
import { useIsServer } from "./use-is-server.ts";

describe("useIsServer", () => {
  it("is false once mounted on the client", async () => {
    const { result, unmount } = await renderHook(() => useIsServer());

    expect(result.current).toBe(false);

    await unmount();
  });
});
