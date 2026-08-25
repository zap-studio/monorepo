import { describe, expect, it } from "vitest";

import * as hooks from "./index.ts";

describe("index", () => {
  it("re-exports every public hook from the package entrypoint", () => {
    expect(typeof hooks.useAnimationFrame).toBe("function");
    expect(typeof hooks.useCredential).toBe("function");
    expect(typeof hooks.useExperimentalIdleDetector).toBe("function");
    expect(typeof hooks.useWorker).toBe("function");
  });
});
