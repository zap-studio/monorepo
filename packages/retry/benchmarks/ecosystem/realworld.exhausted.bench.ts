import { bench, describe } from "vitest";

import {
  runAsyncRetryRealWorld,
  runExponentialBackoffRealWorld,
  runPRetryRealWorld,
  runPromiseRetryRealWorld,
  runZapExponentialRealWorld,
  runZapFixedRealWorld,
} from "./adapters.js";
import { createAlwaysFailTask } from "./fixtures.js";

describe("@zap-studio/retry | ecosystem | real-world | exhausted-after-max-attempts", () => {
  bench("zap | fixed-delay", async () => {
    try {
      await runZapFixedRealWorld(createAlwaysFailTask());
    } catch {
      // Expected exhausted benchmark failure.
    }
  });

  bench("zap | exponential-backoff", async () => {
    try {
      await runZapExponentialRealWorld(createAlwaysFailTask());
    } catch {
      // Expected exhausted benchmark failure.
    }
  });

  bench("ecosystem | p-retry", async () => {
    try {
      await runPRetryRealWorld(createAlwaysFailTask());
    } catch {
      // Expected exhausted benchmark failure.
    }
  });

  bench("ecosystem | async-retry", async () => {
    try {
      await runAsyncRetryRealWorld(createAlwaysFailTask());
    } catch {
      // Expected exhausted benchmark failure.
    }
  });

  bench("ecosystem | promise-retry", async () => {
    try {
      await runPromiseRetryRealWorld(createAlwaysFailTask());
    } catch {
      // Expected exhausted benchmark failure.
    }
  });

  bench("ecosystem | exponential-backoff", async () => {
    try {
      await runExponentialBackoffRealWorld(createAlwaysFailTask());
    } catch {
      // Expected exhausted benchmark failure.
    }
  });
});
