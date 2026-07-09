import { bench, describe } from "vitest";

import {
  runPRetryWithSignal,
  runZapExponentialWithSignal,
  runZapFixedWithSignal,
} from "./adapters.js";
import { createAlwaysFailTask } from "./fixtures.js";

describe("@zap-studio/retry | ecosystem | abort | immediate", () => {
  bench("zap | fixed-delay | already-aborted", async () => {
    const controller = new AbortController();
    controller.abort(new Error("bench-abort"));
    try {
      await runZapFixedWithSignal(createAlwaysFailTask(), controller.signal);
    } catch {
      // Expected abort benchmark failure.
    }
  });

  bench("zap | exponential-backoff | already-aborted", async () => {
    const controller = new AbortController();
    controller.abort(new Error("bench-abort"));
    try {
      await runZapExponentialWithSignal(
        createAlwaysFailTask(),
        controller.signal
      );
    } catch {
      // Expected abort benchmark failure.
    }
  });

  bench("ecosystem | p-retry | already-aborted", async () => {
    const controller = new AbortController();
    controller.abort(new Error("bench-abort"));
    try {
      await runPRetryWithSignal(createAlwaysFailTask(), controller.signal);
    } catch {
      // Expected abort benchmark failure.
    }
  });
});
