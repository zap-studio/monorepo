import { describe, expect, it } from "vitest";

import { renderHook } from "../../tests/_react.ts";
import { useIsClient } from "./use-is-client.ts";

describe("useIsClient", () => {
  it("is true once mounted on the client", async () => {
    const { result, unmount } = await renderHook(() => useIsClient());

    expect(result.current).toBe(true);

    await unmount();
  });
});
