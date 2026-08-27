import type { Logger } from "@zap-studio/logger";

import { describe, expect, it, vi } from "vitest";

import type { RetryPolicy } from "./types.ts";

import {
  createCustomTerminalPolicy,
  createSequencePolicy,
  expectFailureResult,
} from "./_sequence-policy.ts";
import { defaultSleep, runRetryPolicy } from "./base-policy.ts";
import { AbortError, RetryError } from "./errors.ts";

const MAX_ATTEMPTS_REASON = "max-attempts-reached";
const ABORTED_BEFORE_START_MESSAGE = "aborted-before-start";

const createRecordingLogger = (): Logger & {
  calls: {
    level: string;
    message: string;
    context: Record<string, unknown> | undefined;
  }[];
} => {
  const calls: {
    level: string;
    message: string;
    context: Record<string, unknown> | undefined;
  }[] = [];
  const record =
    (level: string) =>
    (message: string, context?: Record<string, unknown>): void => {
      calls.push({ context, level, message });
    };

  return {
    calls,
    debug: record("debug"),
    error: record("error"),
    fatal: record("fatal"),
    info: record("info"),
    trace: record("trace"),
    warn: record("warn"),
  };
};

describe("defaultSleep", () => {
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

describe("throw mode (runRetryPolicy default)", () => {
  it("returns successful execution result without retrying", async () => {
    const policy = createSequencePolicy([{ delayMs: 0, reason: "retry", shouldRetry: true }]);
    const execute = vi.fn<(attempt: number) => Promise<string>>().mockResolvedValue("ok");

    const result = await runRetryPolicy(policy, execute);

    expect(result).toBe("ok");
    expect(execute).toHaveBeenCalledWith(1);
    expect(policy.seen).toStrictEqual([]);
  });

  it("retries with provided sleep implementation until success", async () => {
    const policy = createSequencePolicy([
      { delayMs: 10, reason: "retry", shouldRetry: true },
      { delayMs: 20, reason: "retry", shouldRetry: true },
    ]);
    const sleep = vi.fn<(delayMs: number) => Promise<void>>().mockResolvedValue();
    const execute = vi.fn<(attempt: number) => Promise<string>>();
    execute.mockRejectedValueOnce(new Error("fail-1"));
    execute.mockRejectedValueOnce(new Error("fail-2"));
    execute.mockResolvedValueOnce("ok");

    const result = await runRetryPolicy(policy, execute, { sleep });

    expect(result).toBe("ok");
    expect(execute.mock.calls).toStrictEqual([[1], [2], [3]]);
    expect(sleep.mock.calls).toStrictEqual([[10], [20]]);
    expect(policy.seen).toHaveLength(2);
  });

  it("throws RetryError from default onExhausted when retries stop", async () => {
    const policy = createSequencePolicy([
      { delayMs: 0, reason: "retry", shouldRetry: true },
      { delayMs: 0, reason: MAX_ATTEMPTS_REASON, shouldRetry: false },
    ]);
    const execute = vi.fn<(attempt: number) => Promise<string>>();
    execute.mockRejectedValueOnce(new Error("fail-1"));
    execute.mockRejectedValueOnce(new Error("fail-2"));

    await expect(runRetryPolicy(policy, execute)).rejects.toMatchObject({
      attempts: 2,
      name: "RetryError",
    });
  });

  it("uses custom terminal error from overridden onExhausted", async () => {
    const policy = createCustomTerminalPolicy();
    const execute = vi
      .fn<(attempt: number) => Promise<string>>()
      .mockRejectedValue(new Error("nope"));

    await expect(runRetryPolicy(policy, execute)).rejects.toThrow("custom:1");
  });

  it("uses default sleep when delay is positive and no custom sleep is provided", async () => {
    vi.useFakeTimers();
    const policy = createSequencePolicy([{ delayMs: 25, reason: "retry", shouldRetry: true }]);
    const execute = vi.fn<(attempt: number) => Promise<string>>();
    execute.mockRejectedValueOnce(new Error("fail"));
    execute.mockResolvedValueOnce("ok");

    const runPromise = runRetryPolicy(policy, execute);
    await vi.advanceTimersByTimeAsync(25);
    await expect(runPromise).resolves.toBe("ok");
    vi.useRealTimers();
  });

  it("throws immediately when signal is already aborted", async () => {
    const policy = createSequencePolicy([{ delayMs: 0, reason: "retry", shouldRetry: true }]);
    const execute = vi.fn<(attempt: number) => Promise<string>>().mockResolvedValue("ok");
    const controller = new AbortController();
    controller.abort(new Error(ABORTED_BEFORE_START_MESSAGE));

    await expect(runRetryPolicy(policy, execute, { signal: controller.signal })).rejects.toThrow(
      ABORTED_BEFORE_START_MESSAGE,
    );
    expect(execute).not.toHaveBeenCalled();
  });

  it("throws when signal aborts while waiting between retries", async () => {
    const policy = createSequencePolicy([{ delayMs: 50, reason: "retry", shouldRetry: true }]);
    const controller = new AbortController();
    const execute = vi
      .fn<(attempt: number) => Promise<string>>()
      .mockRejectedValueOnce(new Error("fail-once"));

    const runPromise = runRetryPolicy(policy, execute, {
      signal: controller.signal,
    });
    await Promise.resolve();
    controller.abort(new Error("aborted-during-sleep"));

    await expect(runPromise).rejects.toThrow("aborted-during-sleep");
  });

  it("covers immediate abort check during abort-aware sleep", async () => {
    const policy = createSequencePolicy([{ delayMs: 10, reason: "retry", shouldRetry: true }]);
    const execute = vi
      .fn<(attempt: number) => Promise<string>>()
      .mockRejectedValue(new Error("fail"));

    let readCount = 0;
    // SAFETY: runRetryPolicy's abort handling only reads `signal.aborted`/`signal.reason` and calls
    // `signal.addEventListener`/`removeEventListener`; this stub implements exactly those members
    // (the no-op listener mocks are never invoked because `aborted` flips true on the 3rd read,
    // tripping the synchronous check inside sleepWithAbortSignal before a listener is registered).
    const fakeSignal = {
      get aborted() {
        readCount += 1;
        return readCount >= 3;
      },
      addEventListener:
        vi.fn<(type: string, listener: EventListenerOrEventListenerObject) => void>(),
      reason: "abort-immediate-sleep-check",
      removeEventListener:
        vi.fn<(type: string, listener: EventListenerOrEventListenerObject) => void>(),
    } as unknown as AbortSignal;

    await expect(runRetryPolicy(policy, execute, { signal: fakeSignal })).rejects.toThrow(
      "abort-immediate-sleep-check",
    );
  });

  it("propagates sync sleep failure before abort listener registration", async () => {
    const policy = createSequencePolicy([{ delayMs: 10, reason: "retry", shouldRetry: true }]);
    const controller = new AbortController();
    const execute = vi
      .fn<(attempt: number) => Promise<string>>()
      .mockRejectedValue(new Error("fail"));
    const sleep = vi.fn<(delayMs: number) => Promise<void>>().mockImplementation(() => {
      throw new Error("sleep-sync-fail");
    });

    await expect(
      runRetryPolicy(policy, execute, { signal: controller.signal, sleep }),
    ).rejects.toThrow("sleep-sync-fail");
  });

  it("rethrows a rejection immediately when it fails policy.isKnownError, bypassing retry", async () => {
    const policy = createSequencePolicy([{ delayMs: 0, reason: "retry", shouldRetry: true }]);
    const execute = vi.fn<(attempt: number) => Promise<string>>().mockRejectedValue("not-an-error");

    await expect(runRetryPolicy(policy, execute)).rejects.toBe("not-an-error");
    expect(execute).toHaveBeenCalledTimes(1);
    expect(policy.seen).toStrictEqual([]);
  });
});

describe("result mode (throwOnExhausted: false)", () => {
  it("returns terminal result instead of throwing when retries stop", async () => {
    const policy = createSequencePolicy([
      { delayMs: 0, reason: MAX_ATTEMPTS_REASON, shouldRetry: false },
    ]);
    const execute = vi
      .fn<(attempt: number) => Promise<string>>()
      .mockRejectedValue(new Error("fail"));

    const result = await runRetryPolicy(policy, execute, {
      throwOnExhausted: false,
    });

    const failure = expectFailureResult(result);
    expect(failure).toMatchObject({
      attempts: 1,
      ok: false,
    });
    expect(failure.error).toBeInstanceOf(RetryError);
  });

  it("returns success result object on first success", async () => {
    const policy = createSequencePolicy([{ delayMs: 0, reason: "retry", shouldRetry: true }]);
    const execute = vi.fn<(attempt: number) => Promise<string>>().mockResolvedValue("ok");

    const result = await runRetryPolicy(policy, execute, {
      throwOnExhausted: false,
    });

    expect(result).toStrictEqual({ ok: true, value: "ok" });
  });

  it("retries with positive delay and custom sleep until success", async () => {
    const policy = createSequencePolicy([{ delayMs: 15, reason: "retry", shouldRetry: true }]);
    const sleep = vi.fn<(delayMs: number) => Promise<void>>().mockResolvedValue();
    const execute = vi.fn<(attempt: number) => Promise<string>>();
    execute.mockRejectedValueOnce(new Error("fail"));
    execute.mockResolvedValueOnce("ok");

    const result = await runRetryPolicy(policy, execute, {
      sleep,
      throwOnExhausted: false,
    });

    expect(result).toStrictEqual({ ok: true, value: "ok" });
    expect(sleep).toHaveBeenCalledWith(15);
    expect(execute).toHaveBeenNthCalledWith(1, 1);
    expect(execute).toHaveBeenNthCalledWith(2, 2);
  });

  it("returns terminal result when signal is already aborted", async () => {
    const policy = createSequencePolicy([{ delayMs: 0, reason: "retry", shouldRetry: true }]);
    const execute = vi.fn<(attempt: number) => Promise<string>>().mockResolvedValue("ok");
    const controller = new AbortController();
    controller.abort(ABORTED_BEFORE_START_MESSAGE);

    const result = await runRetryPolicy(policy, execute, {
      signal: controller.signal,
      throwOnExhausted: false,
    });

    const failure = expectFailureResult(result);
    expect(failure.attempts).toBe(0);
    expect(failure.error.message).toBe(ABORTED_BEFORE_START_MESSAGE);
    expect(failure.error).toBeInstanceOf(AbortError);
    expect(execute).not.toHaveBeenCalled();
  });

  it("preserves AbortError reason instance in abort result", async () => {
    const policy = createSequencePolicy([{ delayMs: 0, reason: "retry", shouldRetry: true }]);
    const execute = vi.fn<(attempt: number) => Promise<string>>().mockResolvedValue("ok");
    const abortError = new AbortError("already-aborted");

    // SAFETY: `aborted` is already true, so buildAbortResult short-circuits on the `signal.aborted`/
    // `signal.reason` reads before any wait is scheduled; addEventListener/removeEventListener are
    // never called, so this stub only needs to satisfy the members runRetryPolicy actually reads here.
    const fakeSignal = {
      aborted: true,
      addEventListener:
        vi.fn<(type: string, listener: EventListenerOrEventListenerObject) => void>(),
      reason: abortError,
      removeEventListener:
        vi.fn<(type: string, listener: EventListenerOrEventListenerObject) => void>(),
    } as unknown as AbortSignal;

    const result = await runRetryPolicy(policy, execute, {
      signal: fakeSignal,
      throwOnExhausted: false,
    });

    const failure = expectFailureResult(result);
    expect(failure.error).toBe(abortError);
  });

  it("returns terminal result when signal is aborted during execute", async () => {
    const policy = createSequencePolicy([{ delayMs: 10, reason: "retry", shouldRetry: true }]);
    const controller = new AbortController();

    const execute = vi.fn<(attempt: number) => Promise<string>>().mockImplementation(() => {
      controller.abort("aborted-during-execute");
      return Promise.reject(new Error("failed"));
    });

    const result = await runRetryPolicy(policy, execute, {
      signal: controller.signal,
      throwOnExhausted: false,
    });

    const failure = expectFailureResult(result);
    expect(failure.attempts).toBe(1);
    expect(failure.error.message).toBe("aborted-during-execute");
    expect(failure.error).toBeInstanceOf(AbortError);
  });

  it("normalizes non-serializable abort reasons to fallback message", async () => {
    const policy = createSequencePolicy([{ delayMs: 0, reason: "retry", shouldRetry: true }]);
    const execute = vi.fn<(attempt: number) => Promise<string>>().mockResolvedValue("ok");
    const circular: { self?: unknown } = {};
    circular.self = circular;
    const controller = new AbortController();
    controller.abort(circular);

    const result = await runRetryPolicy(policy, execute, {
      signal: controller.signal,
      throwOnExhausted: false,
    });

    const failure = expectFailureResult(result);
    expect(failure.attempts).toBe(0);
    expect(failure.error.message).toBe("Retry aborted.");
    expect(failure.error).toBeInstanceOf(AbortError);
  });

  it("handles undefined abort reason fallback message", async () => {
    const policy = createSequencePolicy([{ delayMs: 0, reason: "retry", shouldRetry: true }]);
    const execute = vi.fn<(attempt: number) => Promise<string>>().mockResolvedValue("ok");

    // SAFETY: `aborted` is already true and `reason` is `undefined`, which is exactly what
    // buildAbortResult/toAbortError read to exercise the "undefined reason" fallback branch;
    // addEventListener/removeEventListener are unused here since no wait is ever scheduled.
    const fakeSignal = {
      aborted: true,
      addEventListener:
        vi.fn<(type: string, listener: EventListenerOrEventListenerObject) => void>(),
      reason: undefined,
      removeEventListener:
        vi.fn<(type: string, listener: EventListenerOrEventListenerObject) => void>(),
    } as unknown as AbortSignal;

    const result = await runRetryPolicy(policy, execute, {
      signal: fakeSignal,
      throwOnExhausted: false,
    });

    const failure = expectFailureResult(result);
    expect(failure.attempts).toBe(0);
    expect(failure.error.message).toBe("Retry aborted.");
    expect(failure.error).toBeInstanceOf(AbortError);
  });

  it("retries with signal and positive delay until success", async () => {
    const policy = createSequencePolicy([{ delayMs: 10, reason: "retry", shouldRetry: true }]);
    const controller = new AbortController();
    const sleep = vi.fn<(delayMs: number) => Promise<void>>().mockResolvedValue();
    const execute = vi.fn<(attempt: number) => Promise<string>>();
    execute.mockRejectedValueOnce(new Error("fail"));
    execute.mockResolvedValueOnce("ok");

    const result = await runRetryPolicy(policy, execute, {
      signal: controller.signal,
      sleep,
      throwOnExhausted: false,
    });

    expect(result).toStrictEqual({ ok: true, value: "ok" });
    expect(sleep).toHaveBeenCalledWith(10);
  });

  it("retries with signal and zero delay until success", async () => {
    const policy = createSequencePolicy([{ delayMs: 0, reason: "retry", shouldRetry: true }]);
    const controller = new AbortController();
    const execute = vi.fn<(attempt: number) => Promise<string>>();
    execute.mockRejectedValueOnce(new Error("fail"));
    execute.mockResolvedValueOnce("ok");

    const result = await runRetryPolicy(policy, execute, {
      signal: controller.signal,
      throwOnExhausted: false,
    });

    expect(result).toStrictEqual({ ok: true, value: "ok" });
    expect(execute).toHaveBeenNthCalledWith(1, 1);
    expect(execute).toHaveBeenNthCalledWith(2, 2);
  });

  it("returns failure result when signal aborts during backoff sleep", async () => {
    const policy = createSequencePolicy([{ delayMs: 50, reason: "retry", shouldRetry: true }]);
    const controller = new AbortController();
    const execute = vi
      .fn<(attempt: number) => Promise<string>>()
      .mockRejectedValue(new Error("fail"));

    const runPromise = runRetryPolicy(policy, execute, {
      signal: controller.signal,
      throwOnExhausted: false,
    });

    await Promise.resolve();
    controller.abort("aborted-in-backoff");

    const result = await runPromise;
    const failure = expectFailureResult(result);
    expect(failure.attempts).toBe(1);
    expect(failure.error.message).toBe("aborted-in-backoff");
    expect(failure.error).toBeInstanceOf(AbortError);
  });

  it("rethrows non-abort sleep errors", async () => {
    const policy = createSequencePolicy([{ delayMs: 10, reason: "retry", shouldRetry: true }]);
    const controller = new AbortController();
    const execute = vi
      .fn<(attempt: number) => Promise<string>>()
      .mockRejectedValue(new Error("fail"));
    const sleep = vi
      .fn<(delayMs: number) => Promise<void>>()
      .mockRejectedValue(new Error("sleep-fail"));

    await expect(
      runRetryPolicy(policy, execute, {
        signal: controller.signal,
        sleep,
        throwOnExhausted: false,
      }),
    ).rejects.toThrow("sleep-fail");
  });

  it("returns abort result from waitForDelay catch path", async () => {
    const policy = createSequencePolicy([{ delayMs: 10, reason: "retry", shouldRetry: true }]);
    const execute = vi
      .fn<(attempt: number) => Promise<string>>()
      .mockRejectedValue(new Error("fail"));
    const sleep = vi.fn<(delayMs: number) => Promise<void>>().mockResolvedValue();

    let readCount = 0;
    // SAFETY: only `aborted` (a read-count-gated getter that flips true on the 3rd read, so the
    // earlier `signal.aborted` checks in the result-mode loop pass through) and `reason` are read
    // by runRetryPolicy's abort handling here; addEventListener/removeEventListener are unused
    // no-op stubs since the abort is observed via a synchronous `aborted` read, not a fired event.
    const fakeSignal = {
      get aborted() {
        readCount += 1;
        return readCount >= 3;
      },
      addEventListener:
        vi.fn<(type: string, listener: EventListenerOrEventListenerObject) => void>(),
      reason: "aborted-from-wait-catch",
      removeEventListener:
        vi.fn<(type: string, listener: EventListenerOrEventListenerObject) => void>(),
    } as unknown as AbortSignal;

    const result = await runRetryPolicy(policy, execute, {
      signal: fakeSignal,
      sleep,
      throwOnExhausted: false,
    });

    const failure = expectFailureResult(result);
    expect(failure.attempts).toBe(1);
    expect(failure.error.message).toBe("aborted-from-wait-catch");
    expect(failure.error).toBeInstanceOf(AbortError);
  });

  it("returns abort result when the signal aborts during the delay race itself", async () => {
    const policy = createSequencePolicy([{ delayMs: 10, reason: "retry", shouldRetry: true }]);
    const execute = vi
      .fn<(attempt: number) => Promise<string>>()
      .mockRejectedValue(new Error("fail"));
    const sleep = vi.fn<() => Promise<void>>(() => new Promise<void>(() => {}));

    // SAFETY: `sleep` never resolves, so the only way this race settles is through the abort path;
    // this stub's addEventListener actually fires the registered listener (flipping `aborted` first),
    // exercising the real `signal.addEventListener`/`aborted`/`reason` surface sleepWithAbortSignal
    // uses, so the cast to `AbortSignal & { aborted: boolean }` covers everything read here.
    const fakeSignal = {
      aborted: false,
      addEventListener: vi.fn<
        (_type: string, listener: EventListenerOrEventListenerObject) => void
      >((_type: string, listener: EventListenerOrEventListenerObject) => {
        fakeSignal.aborted = true;
        // SAFETY: sleepWithAbortSignal always registers `onAbort`, a plain zero-arg callback
        // (`() => { reject(...) }`), never an EventListenerObject with a `handleEvent` method,
        // so `listener` here is always callable as `() => void`.
        (listener as () => void)();
      }),
      reason: "aborted-during-wait-race",
      removeEventListener:
        vi.fn<(type: string, listener: EventListenerOrEventListenerObject) => void>(),
    } as unknown as AbortSignal & { aborted: boolean };

    const result = await runRetryPolicy(policy, execute, {
      signal: fakeSignal,
      sleep,
      throwOnExhausted: false,
    });

    const failure = expectFailureResult(result);
    expect(failure.attempts).toBe(1);
    expect(failure.error.message).toBe("aborted-during-wait-race");
    expect(failure.error).toBeInstanceOf(AbortError);
  });

  it("returns a wrapped failure result immediately when it fails policy.isKnownError, bypassing retry", async () => {
    const policy = createSequencePolicy([{ delayMs: 0, reason: "retry", shouldRetry: true }]);
    const notAnError = { message: "plain-object-rejection" };
    const execute = vi.fn<(attempt: number) => Promise<string>>().mockRejectedValue(notAnError);

    const result = await runRetryPolicy(policy, execute, {
      throwOnExhausted: false,
    });

    const failure = expectFailureResult(result);
    expect(failure.attempts).toBe(1);
    expect(failure.error).toBeInstanceOf(RetryError);
    // SAFETY: the toBeInstanceOf assertion above guarantees failure.error is a RetryError.
    expect((failure.error as RetryError).lastError).toBe(notAnError);
    expect(execute).toHaveBeenCalledTimes(1);
    expect(policy.seen).toStrictEqual([]);
  });
});

describe("logging", () => {
  it("logs each retry decision at debug and exhaustion at warn in throw mode", async () => {
    const logger = createRecordingLogger();
    const policy = createSequencePolicy([
      { delayMs: 0, reason: "retry", shouldRetry: true },
      { delayMs: 0, reason: MAX_ATTEMPTS_REASON, shouldRetry: false },
    ]);
    const execute = vi.fn<(attempt: number) => Promise<string>>();
    execute.mockRejectedValueOnce(new Error("fail-1"));
    execute.mockRejectedValueOnce(new Error("fail-2"));

    await expect(runRetryPolicy(policy, execute, { logger })).rejects.toBeInstanceOf(RetryError);

    expect(logger.calls).toStrictEqual([
      {
        context: { attempt: 1, delayMs: 0, reason: "retry" },
        level: "debug",
        message: "retry scheduled",
      },
      {
        context: {
          attempts: 2,
          error: expect.any(Error),
          reason: MAX_ATTEMPTS_REASON,
        },
        level: "warn",
        message: "retry policy exhausted",
      },
    ]);
  });

  it("logs each retry decision at debug and exhaustion at warn in result mode", async () => {
    const logger = createRecordingLogger();
    const policy = createSequencePolicy([
      { delayMs: 0, reason: "retry", shouldRetry: true },
      { delayMs: 0, reason: MAX_ATTEMPTS_REASON, shouldRetry: false },
    ]);
    const execute = vi.fn<(attempt: number) => Promise<string>>();
    execute.mockRejectedValueOnce(new Error("fail-1"));
    execute.mockRejectedValueOnce(new Error("fail-2"));

    const result = await runRetryPolicy(policy, execute, {
      logger,
      throwOnExhausted: false,
    });

    expectFailureResult(result);
    expect(logger.calls).toStrictEqual([
      {
        context: { attempt: 1, delayMs: 0, reason: "retry" },
        level: "debug",
        message: "retry scheduled",
      },
      {
        context: {
          attempts: 2,
          error: expect.any(Error),
          reason: MAX_ATTEMPTS_REASON,
        },
        level: "warn",
        message: "retry policy exhausted",
      },
    ]);
  });

  it("logs an abort at debug when the signal is already aborted", async () => {
    const logger = createRecordingLogger();
    const policy = createSequencePolicy([{ delayMs: 0, reason: "retry", shouldRetry: true }]);
    const execute = vi.fn<(attempt: number) => Promise<string>>().mockResolvedValue("ok");
    const controller = new AbortController();
    controller.abort(new Error("stop"));

    await expect(
      runRetryPolicy(policy, execute, { logger, signal: controller.signal }),
    ).rejects.toBeInstanceOf(AbortError);

    expect(logger.calls).toStrictEqual([
      {
        context: { reason: expect.any(Error) },
        level: "debug",
        message: "retry aborted",
      },
    ]);
  });

  it("does not log anything when no logger is provided", async () => {
    const policy = createSequencePolicy([{ delayMs: 0, reason: "retry", shouldRetry: true }]);
    const execute = vi.fn<(attempt: number) => Promise<string>>();
    execute.mockRejectedValueOnce(new Error("fail"));
    execute.mockResolvedValueOnce("ok");

    await expect(runRetryPolicy(policy, execute)).resolves.toBe("ok");
  });
});

describe("runRetryPolicy defaults", () => {
  it("creates RetryError with data from default onExhausted", () => {
    const policy = createSequencePolicy([
      { delayMs: 0, reason: "policy-declined", shouldRetry: false },
    ]);

    const error = policy.onExhausted({
      attempts: 3,
      data: "payload",
      error: new Error("boom"),
    });

    expect(error).toBeInstanceOf(RetryError);
    expect(error.lastData).toBe("payload");
    expect(error.attempts).toBe(3);
  });

  it("default isKnownError accepts Error instances and rejects everything else", () => {
    const policy = createSequencePolicy([]);

    expect(policy.isKnownError(new Error("boom"))).toBeTruthy();
    expect(policy.isKnownError(new TypeError("boom"))).toBeTruthy();
    expect(policy.isKnownError("boom")).toBeFalsy();
    expect(policy.isKnownError({ message: "boom" })).toBeFalsy();
    expect(policy.isKnownError(undefined)).toBeFalsy();
  });

  it("falls back to runRetryPolicy's default onExhausted when a policy omits it", async () => {
    const policy: RetryPolicy = {
      next: () => ({
        delayMs: 0,
        reason: MAX_ATTEMPTS_REASON,
        shouldRetry: false,
      }),
    };
    const execute = vi
      .fn<(attempt: number) => Promise<string>>()
      .mockRejectedValue(new Error("boom"));

    await expect(runRetryPolicy(policy, execute)).rejects.toMatchObject({
      attempts: 1,
      message: "Retry policy exhausted all attempts.",
      name: "RetryError",
    });
  });
});

describe("test helpers", () => {
  describe("createSequencePolicy", () => {
    it("falls back to a terminal decision when constructed without decisions", () => {
      const policy = createSequencePolicy([]);

      const decision = policy.next({
        attempt: 1,
        error: new Error("boom"),
      });

      expect(decision).toStrictEqual({
        delayMs: 0,
        reason: "policy-declined",
        shouldRetry: false,
      });
    });

    it("repeats the last decision once the sequence is exhausted", () => {
      const policy = createSequencePolicy([{ delayMs: 5, reason: "retry", shouldRetry: true }]);
      const input = {
        attempt: 1,
        error: new Error("boom"),
      };

      const first = policy.next(input);
      const second = policy.next({ ...input, attempt: 2 });

      expect(first).toStrictEqual(second);
      expect(policy.seen).toHaveLength(2);
    });
  });

  describe("expectFailureResult", () => {
    it("returns the failure result unchanged", () => {
      const policy = createSequencePolicy([]);
      const failure = {
        attempts: 1,
        error: policy.onExhausted({
          attempts: 1,
          error: new Error("boom"),
        }),
        ok: false,
      } as const;

      expect(expectFailureResult(failure)).toBe(failure);
    });

    it("fails the test when given a success result", () => {
      expect(() => expectFailureResult({ ok: true, value: "done" })).toThrowError(
        "Expected failure result",
      );
    });
  });
});
