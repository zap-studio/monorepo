import asyncRetry from "async-retry";
import { backOff } from "exponential-backoff";
import pRetry from "p-retry";
import promiseRetry from "promise-retry";

import { ExponentialBackoff } from "../../src/exponential-backoff.js";
import { FixedDelay } from "../../src/fixed-delay.js";
import type { BenchmarkTask } from "./fixtures.js";
import { maxAttempts } from "./fixtures.js";

const noSleep = async (): Promise<void> => {
  await Promise.resolve();
};

export const runZapFixed = async (task: BenchmarkTask): Promise<void> => {
  const policy = new FixedDelay({ delayMs: 0, maxAttempts });
  await policy.run(async () => await task(), { sleep: noSleep });
};

export const runZapExponential = async (task: BenchmarkTask): Promise<void> => {
  const policy = new ExponentialBackoff({
    baseDelayMs: 0,
    maxAttempts,
    maxDelayMs: 0,
  });
  await policy.run(async () => await task(), { sleep: noSleep });
};

export const runPRetry = async (task: BenchmarkTask): Promise<void> => {
  await pRetry(async () => await task(), {
    factor: 1,
    maxTimeout: 0,
    minTimeout: 0,
    randomize: false,
    retries: maxAttempts - 1,
  });
};

export const runZapFixedWithSignal = async (
  task: BenchmarkTask,
  signal: AbortSignal
): Promise<void> => {
  const policy = new FixedDelay({ delayMs: 0, maxAttempts });
  await policy.run(async () => await task(), { signal, sleep: noSleep });
};

export const runZapExponentialWithSignal = async (
  task: BenchmarkTask,
  signal: AbortSignal
): Promise<void> => {
  const policy = new ExponentialBackoff({
    baseDelayMs: 0,
    maxAttempts,
    maxDelayMs: 0,
  });
  await policy.run(async () => await task(), { signal, sleep: noSleep });
};

export const runPRetryWithSignal = async (
  task: BenchmarkTask,
  signal: AbortSignal
): Promise<void> => {
  await pRetry(async () => await task(), {
    factor: 1,
    maxTimeout: 0,
    minTimeout: 0,
    randomize: false,
    retries: maxAttempts - 1,
    signal,
  });
};

export const runAsyncRetry = async (task: BenchmarkTask): Promise<void> => {
  await asyncRetry(async () => await task(), {
    factor: 1,
    maxTimeout: 0,
    minTimeout: 0,
    randomize: false,
    retries: maxAttempts - 1,
  });
};

export const runPromiseRetry = async (task: BenchmarkTask): Promise<void> => {
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
};

export const runExponentialBackoff = async (
  task: BenchmarkTask
): Promise<void> => {
  await backOff(async () => await task(), {
    jitter: "none",
    maxDelay: 0,
    numOfAttempts: maxAttempts,
    retry: () => true,
    startingDelay: 0,
    timeMultiple: 1,
  });
};

export const runZapFixedRealWorld = async (
  task: BenchmarkTask
): Promise<void> => {
  const policy = new FixedDelay({ delayMs: 0, maxAttempts });
  await policy.run(async () => await task());
};

export const runZapExponentialRealWorld = async (
  task: BenchmarkTask
): Promise<void> => {
  const policy = new ExponentialBackoff({
    baseDelayMs: 0,
    maxAttempts,
    maxDelayMs: 0,
  });
  await policy.run(async () => await task());
};

export const runPRetryRealWorld = async (
  task: BenchmarkTask
): Promise<void> => {
  await pRetry(async () => await task(), {
    maxTimeout: 0,
    minTimeout: 0,
    retries: maxAttempts - 1,
  });
};

export const runAsyncRetryRealWorld = async (
  task: BenchmarkTask
): Promise<void> => {
  await asyncRetry(async () => await task(), {
    maxTimeout: 0,
    minTimeout: 0,
    retries: maxAttempts - 1,
  });
};

export const runPromiseRetryRealWorld = async (
  task: BenchmarkTask
): Promise<void> => {
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
};

export const runExponentialBackoffRealWorld = async (
  task: BenchmarkTask
): Promise<void> => {
  await backOff(async () => await task(), {
    maxDelay: 0,
    numOfAttempts: maxAttempts,
    startingDelay: 0,
  });
};
