import { bench, describe } from "vitest";

import {
  runPRetry,
  runPRetryWithSignal,
  runZapExponential,
  runZapExponentialWithSignal,
  runZapFixed,
  runZapFixedWithSignal,
} from "./adapters.js";
import { createSuccessFirstTask } from "./fixtures.js";

describe("@zap-studio/retry | ecosystem | abort | signal-overhead", () => {
  bench("zap | fixed-delay | no-signal", async () => {
    await runZapFixed(createSuccessFirstTask());
  });

  bench("zap | fixed-delay | with-signal", async () => {
    const controller = new AbortController();
    await runZapFixedWithSignal(createSuccessFirstTask(), controller.signal);
  });

  bench("zap | exponential-backoff | no-signal", async () => {
    await runZapExponential(createSuccessFirstTask());
  });

  bench("zap | exponential-backoff | with-signal", async () => {
    const controller = new AbortController();
    await runZapExponentialWithSignal(
      createSuccessFirstTask(),
      controller.signal
    );
  });

  bench("ecosystem | p-retry | no-signal", async () => {
    await runPRetry(createSuccessFirstTask());
  });

  bench("ecosystem | p-retry | with-signal", async () => {
    const controller = new AbortController();
    await runPRetryWithSignal(createSuccessFirstTask(), controller.signal);
  });
});
