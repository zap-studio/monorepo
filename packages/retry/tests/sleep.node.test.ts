import { describe, expect, it, vi } from "vitest";

import { defaultSleep } from "../src/sleep.js";

describe(defaultSleep, () => {
  it("resolves immediately when delay is non-positive", async () => {
    await expect(defaultSleep(0)).resolves.toBeUndefined();
  });

  it("waits until the timer elapses for positive delay", async () => {
    vi.useFakeTimers();
    const done = defaultSleep(40);
    await vi.advanceTimersByTimeAsync(39);
    let settled = false;
    void done.then(() => {
      settled = true;
    });
    await Promise.resolve();
    expect(settled).toBeFalsy();
    await vi.advanceTimersByTimeAsync(1);
    await done;
    expect(settled).toBeTruthy();
    vi.useRealTimers();
  });
});
