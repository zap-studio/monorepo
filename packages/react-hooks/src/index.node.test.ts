import { describe, expect, it } from "vitest";

import {
  useAnimationFrame,
  useCredential,
  useExperimentalIdleDetector,
  useWorker,
} from "./index.ts";

describe("index", () => {
  it("re-exports every public hook from the package entrypoint", () => {
    expect(typeof useAnimationFrame).toBe("function");
    expect(typeof useCredential).toBe("function");
    expect(typeof useExperimentalIdleDetector).toBe("function");
    expect(typeof useWorker).toBe("function");
  });
});
