import { bench, describe } from "vitest";

import {
  runAsyncRetry,
  runExponentialBackoff,
  runPRetry,
  runPromiseRetry,
  runZapExponential,
  runZapFixed,
} from "./adapters.js";
import { createAlwaysFailTask } from "./fixtures.js";

describe("@zap-studio/retry | ecosystem | exhausted-after-max-attempts", () => {
  bench("zap | fixed-delay", async () => {
    try {
      await runZapFixed(createAlwaysFailTask());
    } catch {
      // Expected exhausted benchmark failure.
    }
  });

  bench("zap | exponential-backoff", async () => {
    try {
      await runZapExponential(createAlwaysFailTask());
    } catch {
      // Expected exhausted benchmark failure.
    }
  });

  bench("ecosystem | p-retry", async () => {
    try {
      await runPRetry(createAlwaysFailTask());
    } catch {
      // Expected exhausted benchmark failure.
    }
  });

  bench("ecosystem | async-retry", async () => {
    try {
      await runAsyncRetry(createAlwaysFailTask());
    } catch {
      // Expected exhausted benchmark failure.
    }
  });

  bench("ecosystem | promise-retry", async () => {
    try {
      await runPromiseRetry(createAlwaysFailTask());
    } catch {
      // Expected exhausted benchmark failure.
    }
  });

  bench("ecosystem | exponential-backoff", async () => {
    try {
      await runExponentialBackoff(createAlwaysFailTask());
    } catch {
      // Expected exhausted benchmark failure.
    }
  });
});
