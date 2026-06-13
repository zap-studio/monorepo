import { bench, describe } from "vitest";

import { ExponentialBackoff } from "../src/exponential-backoff.js";
import { FixedDelay } from "../src/fixed-delay.js";
import {
  createAlwaysFailTask,
  createSuccessAfterTwoRetriesTask,
  createSuccessFirstTask,
  maxAttempts,
} from "./ecosystem/fixtures.js";

const noSleep = async (): Promise<void> => {
  await Promise.resolve();
};

describe("@zap-studio/retry | core | run", () => {
  bench("zap | fixed-delay | success-first-attempt", async () => {
    const policy = new FixedDelay({ delayMs: 0, maxAttempts });
    const task = createSuccessFirstTask();
    await policy.run(async () => await task(), { sleep: noSleep });
  });

  bench("zap | exponential-backoff | success-first-attempt", async () => {
    const policy = new ExponentialBackoff({
      baseDelayMs: 0,
      maxAttempts,
      maxDelayMs: 0,
    });
    const task = createSuccessFirstTask();
    await policy.run(async () => await task(), { sleep: noSleep });
  });

  bench("zap | fixed-delay | success-after-2-retries", async () => {
    const policy = new FixedDelay({ delayMs: 0, maxAttempts });
    const task = createSuccessAfterTwoRetriesTask();
    await policy.run(async () => await task(), { sleep: noSleep });
  });

  bench("zap | exponential-backoff | success-after-2-retries", async () => {
    const policy = new ExponentialBackoff({
      baseDelayMs: 0,
      maxAttempts,
      maxDelayMs: 0,
    });
    const task = createSuccessAfterTwoRetriesTask();
    await policy.run(async () => await task(), { sleep: noSleep });
  });

  bench("zap | fixed-delay | exhausted | throw", async () => {
    const policy = new FixedDelay({ delayMs: 0, maxAttempts });
    const task = createAlwaysFailTask();
    try {
      await policy.run(async () => await task(), { sleep: noSleep });
    } catch {
      // Expected exhausted benchmark path.
    }
  });

  bench("zap | exponential-backoff | exhausted | throw", async () => {
    const policy = new ExponentialBackoff({
      baseDelayMs: 0,
      maxAttempts,
      maxDelayMs: 0,
    });
    const task = createAlwaysFailTask();
    try {
      await policy.run(async () => await task(), { sleep: noSleep });
    } catch {
      // Expected exhausted benchmark path.
    }
  });

  bench("zap | fixed-delay | exhausted | result", async () => {
    const policy = new FixedDelay({ delayMs: 0, maxAttempts });
    const task = createAlwaysFailTask();
    await policy.run(async () => await task(), {
      sleep: noSleep,
      throwOnExhausted: false,
    });
  });

  bench("zap | exponential-backoff | exhausted | result", async () => {
    const policy = new ExponentialBackoff({
      baseDelayMs: 0,
      maxAttempts,
      maxDelayMs: 0,
    });
    const task = createAlwaysFailTask();
    await policy.run(async () => await task(), {
      sleep: noSleep,
      throwOnExhausted: false,
    });
  });
});
