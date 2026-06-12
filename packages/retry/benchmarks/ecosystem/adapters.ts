import asyncRetry from "async-retry";
import { backOff } from "exponential-backoff";
import pRetry from "p-retry";
import promiseRetry from "promise-retry";

import { ExponentialBackoff } from "../../src/exponential-backoff.js";
import { FixedDelay } from "../../src/fixed-delay.js";
import type { BenchmarkTask } from "./fixtures.js";
import { maxAttempts } from "./fixtures.js";

const noSleep = async (): Promise<void> => {};

export async function runZapFixed(task: BenchmarkTask): Promise<void> {
  const policy = new FixedDelay({ delayMs: 0, maxAttempts });
  await policy.run(async () => await task(), { sleep: noSleep });
}

export async function runZapExponential(task: BenchmarkTask): Promise<void> {
  const policy = new ExponentialBackoff({
    baseDelayMs: 0,
    maxAttempts,
    maxDelayMs: 0,
  });
  await policy.run(async () => await task(), { sleep: noSleep });
}

export async function runPRetry(task: BenchmarkTask): Promise<void> {
  await pRetry(async () => await task(), {
    factor: 1,
    maxTimeout: 0,
    minTimeout: 0,
    randomize: false,
    retries: maxAttempts - 1,
  });
}

export async function runZapFixedWithSignal(
  task: BenchmarkTask,
  signal: AbortSignal
): Promise<void> {
  const policy = new FixedDelay({ delayMs: 0, maxAttempts });
  await policy.run(async () => await task(), { signal, sleep: noSleep });
}

export async function runZapExponentialWithSignal(
  task: BenchmarkTask,
  signal: AbortSignal
): Promise<void> {
  const policy = new ExponentialBackoff({
    baseDelayMs: 0,
    maxAttempts,
    maxDelayMs: 0,
  });
  await policy.run(async () => await task(), { signal, sleep: noSleep });
}

export async function runPRetryWithSignal(
  task: BenchmarkTask,
  signal: AbortSignal
): Promise<void> {
  await pRetry(async () => await task(), {
    factor: 1,
    maxTimeout: 0,
    minTimeout: 0,
    randomize: false,
    retries: maxAttempts - 1,
    signal,
  });
}

export async function runAsyncRetry(task: BenchmarkTask): Promise<void> {
  await asyncRetry(async () => await task(), {
    factor: 1,
    maxTimeout: 0,
    minTimeout: 0,
    randomize: false,
    retries: maxAttempts - 1,
  });
}

export async function runPromiseRetry(task: BenchmarkTask): Promise<void> {
  await promiseRetry(
    async (retry) => {
      try {
        return await task();
      } catch (error) {
        retry(error);
      }

      throw new Error("unreachable");
    },
    {
      factor: 1,
      maxTimeout: 0,
      minTimeout: 0,
      randomize: false,
      retries: maxAttempts - 1,
    }
  );
}

export async function runExponentialBackoff(
  task: BenchmarkTask
): Promise<void> {
  await backOff(async () => await task(), {
    jitter: "none",
    maxDelay: 0,
    numOfAttempts: maxAttempts,
    retry: async () => true,
    startingDelay: 0,
    timeMultiple: 1,
  });
}

export async function runZapFixedRealWorld(task: BenchmarkTask): Promise<void> {
  const policy = new FixedDelay({ delayMs: 0, maxAttempts });
  await policy.run(async () => await task());
}

export async function runZapExponentialRealWorld(
  task: BenchmarkTask
): Promise<void> {
  const policy = new ExponentialBackoff({
    baseDelayMs: 0,
    maxAttempts,
    maxDelayMs: 0,
  });
  await policy.run(async () => await task());
}

export async function runPRetryRealWorld(task: BenchmarkTask): Promise<void> {
  await pRetry(async () => await task(), {
    maxTimeout: 0,
    minTimeout: 0,
    retries: maxAttempts - 1,
  });
}

export async function runAsyncRetryRealWorld(
  task: BenchmarkTask
): Promise<void> {
  await asyncRetry(async () => await task(), {
    maxTimeout: 0,
    minTimeout: 0,
    retries: maxAttempts - 1,
  });
}

export async function runPromiseRetryRealWorld(
  task: BenchmarkTask
): Promise<void> {
  await promiseRetry(
    async (retry) => {
      try {
        return await task();
      } catch (error) {
        retry(error);
      }

      throw new Error("unreachable");
    },
    {
      maxTimeout: 0,
      minTimeout: 0,
      retries: maxAttempts - 1,
    }
  );
}

export async function runExponentialBackoffRealWorld(
  task: BenchmarkTask
): Promise<void> {
  await backOff(async () => await task(), {
    maxDelay: 0,
    numOfAttempts: maxAttempts,
    startingDelay: 0,
  });
}
