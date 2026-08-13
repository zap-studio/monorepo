import { describe, expect, it, vi } from "vitest";

import {
  CustomTerminalPolicy,
  expectFailureResult,
  SequencePolicy,
} from "./_sequence-policy.js";
import { defaultSleep } from "./base-policy.js";
import { AbortError, RetryError } from "./errors.js";

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

describe("throw mode (BaseRetryPolicy.run default)", () => {
  it("returns successful execution result without retrying", async () => {
    const policy = new SequencePolicy([
      { delayMs: 0, reason: "retry", shouldRetry: true },
    ]);
    const execute = vi
      .fn<(attempt: number) => Promise<string>>()
      .mockResolvedValue("ok");

    const result = await policy.run(execute);

    expect(result).toBe("ok");
    expect(execute).toHaveBeenCalledWith(1);
    expect(policy.seen).toStrictEqual([]);
  });

  it("retries with provided sleep implementation until success", async () => {
    const policy = new SequencePolicy([
      { delayMs: 10, reason: "retry", shouldRetry: true },
      { delayMs: 20, reason: "retry", shouldRetry: true },
    ]);
    const sleep = vi
      .fn<(delayMs: number) => Promise<void>>()
      .mockResolvedValue();
    const execute = vi.fn<(attempt: number) => Promise<string>>();
    execute.mockRejectedValueOnce(new Error("fail-1"));
    execute.mockRejectedValueOnce(new Error("fail-2"));
    execute.mockResolvedValueOnce("ok");

    const result = await policy.run(execute, { sleep });

    expect(result).toBe("ok");
    expect(execute.mock.calls).toStrictEqual([[1], [2], [3]]);
    expect(sleep.mock.calls).toStrictEqual([[10], [20]]);
    expect(policy.seen).toHaveLength(2);
  });

  it("throws RetryError from default onExhausted when retries stop", async () => {
    const policy = new SequencePolicy([
      { delayMs: 0, reason: "retry", shouldRetry: true },
      { delayMs: 0, reason: "max-attempts-reached", shouldRetry: false },
    ]);
    const execute = vi.fn<(attempt: number) => Promise<string>>();
    execute.mockRejectedValueOnce(new Error("fail-1"));
    execute.mockRejectedValueOnce(new Error("fail-2"));

    await expect(policy.run(execute)).rejects.toMatchObject({
      attempts: 2,
      name: "RetryError",
    });
  });

  it("uses custom terminal error from overridden onExhausted", async () => {
    const policy = new CustomTerminalPolicy();
    const execute = vi
      .fn<(attempt: number) => Promise<string>>()
      .mockRejectedValue(new Error("nope"));

    await expect(policy.run(execute)).rejects.toThrow("custom:1");
  });

  it("uses default sleep when delay is positive and no custom sleep is provided", async () => {
    vi.useFakeTimers();
    const policy = new SequencePolicy([
      { delayMs: 25, reason: "retry", shouldRetry: true },
    ]);
    const execute = vi.fn<(attempt: number) => Promise<string>>();
    execute.mockRejectedValueOnce(new Error("fail"));
    execute.mockResolvedValueOnce("ok");

    const runPromise = policy.run(execute);
    await vi.advanceTimersByTimeAsync(25);
    await expect(runPromise).resolves.toBe("ok");
    vi.useRealTimers();
  });

  it("throws immediately when signal is already aborted", async () => {
    const policy = new SequencePolicy([
      { delayMs: 0, reason: "retry", shouldRetry: true },
    ]);
    const execute = vi
      .fn<(attempt: number) => Promise<string>>()
      .mockResolvedValue("ok");
    const controller = new AbortController();
    controller.abort(new Error("aborted-before-start"));

    await expect(
      policy.run(execute, { signal: controller.signal })
    ).rejects.toThrow("aborted-before-start");
    expect(execute).not.toHaveBeenCalled();
  });

  it("throws when signal aborts while waiting between retries", async () => {
    const policy = new SequencePolicy([
      { delayMs: 50, reason: "retry", shouldRetry: true },
    ]);
    const controller = new AbortController();
    const execute = vi
      .fn<(attempt: number) => Promise<string>>()
      .mockRejectedValueOnce(new Error("fail-once"));

    const runPromise = policy.run(execute, { signal: controller.signal });
    await Promise.resolve();
    controller.abort(new Error("aborted-during-sleep"));

    await expect(runPromise).rejects.toThrow("aborted-during-sleep");
  });

  it("covers immediate abort check during abort-aware sleep", async () => {
    const policy = new SequencePolicy([
      { delayMs: 10, reason: "retry", shouldRetry: true },
    ]);
    const execute = vi
      .fn<(attempt: number) => Promise<string>>()
      .mockRejectedValue(new Error("fail"));

    let readCount = 0;
    const fakeSignal = {
      get aborted() {
        readCount += 1;
        return readCount >= 3;
      },
      addEventListener:
        vi.fn<
          (type: string, listener: EventListenerOrEventListenerObject) => void
        >(),
      reason: "abort-immediate-sleep-check",
      removeEventListener:
        vi.fn<
          (type: string, listener: EventListenerOrEventListenerObject) => void
        >(),
    } as unknown as AbortSignal;

    await expect(policy.run(execute, { signal: fakeSignal })).rejects.toThrow(
      "abort-immediate-sleep-check"
    );
  });

  it("propagates sync sleep failure before abort listener registration", async () => {
    const policy = new SequencePolicy([
      { delayMs: 10, reason: "retry", shouldRetry: true },
    ]);
    const controller = new AbortController();
    const execute = vi
      .fn<(attempt: number) => Promise<string>>()
      .mockRejectedValue(new Error("fail"));
    const sleep = vi
      .fn<(delayMs: number) => Promise<void>>()
      .mockImplementation(() => {
        throw new Error("sleep-sync-fail");
      });

    await expect(
      policy.run(execute, { signal: controller.signal, sleep })
    ).rejects.toThrow("sleep-sync-fail");
  });

  it("rethrows a rejection immediately when it fails policy.isKnownError, bypassing retry", async () => {
    const policy = new SequencePolicy([
      { delayMs: 0, reason: "retry", shouldRetry: true },
    ]);
    const execute = vi
      .fn<(attempt: number) => Promise<string>>()
      .mockRejectedValue("not-an-error");

    await expect(policy.run(execute)).rejects.toBe("not-an-error");
    expect(execute).toHaveBeenCalledTimes(1);
    expect(policy.seen).toStrictEqual([]);
  });
});

describe("result mode (throwOnExhausted: false)", () => {
  it("returns terminal result instead of throwing when retries stop", async () => {
    const policy = new SequencePolicy([
      { delayMs: 0, reason: "max-attempts-reached", shouldRetry: false },
    ]);
    const execute = vi
      .fn<(attempt: number) => Promise<string>>()
      .mockRejectedValue(new Error("fail"));

    const result = await policy.run(execute, { throwOnExhausted: false });

    const failure = expectFailureResult(result);
    expect(failure).toMatchObject({
      attempts: 1,
      ok: false,
    });
    expect(failure.error).toBeInstanceOf(RetryError);
  });

  it("returns success result object on first success", async () => {
    const policy = new SequencePolicy([
      { delayMs: 0, reason: "retry", shouldRetry: true },
    ]);
    const execute = vi
      .fn<(attempt: number) => Promise<string>>()
      .mockResolvedValue("ok");

    const result = await policy.run(execute, { throwOnExhausted: false });

    expect(result).toStrictEqual({ ok: true, value: "ok" });
  });

  it("retries with positive delay and custom sleep until success", async () => {
    const policy = new SequencePolicy([
      { delayMs: 15, reason: "retry", shouldRetry: true },
    ]);
    const sleep = vi
      .fn<(delayMs: number) => Promise<void>>()
      .mockResolvedValue();
    const execute = vi.fn<(attempt: number) => Promise<string>>();
    execute.mockRejectedValueOnce(new Error("fail"));
    execute.mockResolvedValueOnce("ok");

    const result = await policy.run(execute, {
      sleep,
      throwOnExhausted: false,
    });

    expect(result).toStrictEqual({ ok: true, value: "ok" });
    expect(sleep).toHaveBeenCalledWith(15);
    expect(execute).toHaveBeenNthCalledWith(1, 1);
    expect(execute).toHaveBeenNthCalledWith(2, 2);
  });

  it("returns terminal result when signal is already aborted", async () => {
    const policy = new SequencePolicy([
      { delayMs: 0, reason: "retry", shouldRetry: true },
    ]);
    const execute = vi
      .fn<(attempt: number) => Promise<string>>()
      .mockResolvedValue("ok");
    const controller = new AbortController();
    controller.abort("aborted-before-start");

    const result = await policy.run(execute, {
      signal: controller.signal,
      throwOnExhausted: false,
    });

    const failure = expectFailureResult(result);
    expect(failure.attempts).toBe(0);
    expect(failure.error.message).toBe("aborted-before-start");
    expect(failure.error).toBeInstanceOf(AbortError);
    expect(execute).not.toHaveBeenCalled();
  });

  it("preserves AbortError reason instance in abort result", async () => {
    const policy = new SequencePolicy([
      { delayMs: 0, reason: "retry", shouldRetry: true },
    ]);
    const execute = vi
      .fn<(attempt: number) => Promise<string>>()
      .mockResolvedValue("ok");
    const abortError = new AbortError("already-aborted");

    const fakeSignal = {
      aborted: true,
      addEventListener:
        vi.fn<
          (type: string, listener: EventListenerOrEventListenerObject) => void
        >(),
      reason: abortError,
      removeEventListener:
        vi.fn<
          (type: string, listener: EventListenerOrEventListenerObject) => void
        >(),
    } as unknown as AbortSignal;

    const result = await policy.run(execute, {
      signal: fakeSignal,
      throwOnExhausted: false,
    });

    const failure = expectFailureResult(result);
    expect(failure.error).toBe(abortError);
  });

  it("returns terminal result when signal is aborted during execute", async () => {
    const policy = new SequencePolicy([
      { delayMs: 10, reason: "retry", shouldRetry: true },
    ]);
    const controller = new AbortController();

    const execute = vi
      .fn<(attempt: number) => Promise<string>>()
      .mockImplementation(() => {
        controller.abort("aborted-during-execute");
        return Promise.reject(new Error("failed"));
      });

    const result = await policy.run(execute, {
      signal: controller.signal,
      throwOnExhausted: false,
    });

    const failure = expectFailureResult(result);
    expect(failure.attempts).toBe(1);
    expect(failure.error.message).toBe("aborted-during-execute");
    expect(failure.error).toBeInstanceOf(AbortError);
  });

  it("normalizes non-serializable abort reasons to fallback message", async () => {
    const policy = new SequencePolicy([
      { delayMs: 0, reason: "retry", shouldRetry: true },
    ]);
    const execute = vi
      .fn<(attempt: number) => Promise<string>>()
      .mockResolvedValue("ok");
    const circular: { self?: unknown } = {};
    circular.self = circular;
    const controller = new AbortController();
    controller.abort(circular);

    const result = await policy.run(execute, {
      signal: controller.signal,
      throwOnExhausted: false,
    });

    const failure = expectFailureResult(result);
    expect(failure.attempts).toBe(0);
    expect(failure.error.message).toBe("Retry aborted.");
    expect(failure.error).toBeInstanceOf(AbortError);
  });

  it("handles undefined abort reason fallback message", async () => {
    const policy = new SequencePolicy([
      { delayMs: 0, reason: "retry", shouldRetry: true },
    ]);
    const execute = vi
      .fn<(attempt: number) => Promise<string>>()
      .mockResolvedValue("ok");

    const fakeSignal = {
      aborted: true,
      addEventListener:
        vi.fn<
          (type: string, listener: EventListenerOrEventListenerObject) => void
        >(),
      reason: undefined,
      removeEventListener:
        vi.fn<
          (type: string, listener: EventListenerOrEventListenerObject) => void
        >(),
    } as unknown as AbortSignal;

    const result = await policy.run(execute, {
      signal: fakeSignal,
      throwOnExhausted: false,
    });

    const failure = expectFailureResult(result);
    expect(failure.attempts).toBe(0);
    expect(failure.error.message).toBe("Retry aborted.");
    expect(failure.error).toBeInstanceOf(AbortError);
  });

  it("retries with signal and positive delay until success", async () => {
    const policy = new SequencePolicy([
      { delayMs: 10, reason: "retry", shouldRetry: true },
    ]);
    const controller = new AbortController();
    const sleep = vi
      .fn<(delayMs: number) => Promise<void>>()
      .mockResolvedValue();
    const execute = vi.fn<(attempt: number) => Promise<string>>();
    execute.mockRejectedValueOnce(new Error("fail"));
    execute.mockResolvedValueOnce("ok");

    const result = await policy.run(execute, {
      signal: controller.signal,
      sleep,
      throwOnExhausted: false,
    });

    expect(result).toStrictEqual({ ok: true, value: "ok" });
    expect(sleep).toHaveBeenCalledWith(10);
  });

  it("retries with signal and zero delay until success", async () => {
    const policy = new SequencePolicy([
      { delayMs: 0, reason: "retry", shouldRetry: true },
    ]);
    const controller = new AbortController();
    const execute = vi.fn<(attempt: number) => Promise<string>>();
    execute.mockRejectedValueOnce(new Error("fail"));
    execute.mockResolvedValueOnce("ok");

    const result = await policy.run(execute, {
      signal: controller.signal,
      throwOnExhausted: false,
    });

    expect(result).toStrictEqual({ ok: true, value: "ok" });
    expect(execute).toHaveBeenNthCalledWith(1, 1);
    expect(execute).toHaveBeenNthCalledWith(2, 2);
  });

  it("returns failure result when signal aborts during backoff sleep", async () => {
    const policy = new SequencePolicy([
      { delayMs: 50, reason: "retry", shouldRetry: true },
    ]);
    const controller = new AbortController();
    const execute = vi
      .fn<(attempt: number) => Promise<string>>()
      .mockRejectedValue(new Error("fail"));

    const runPromise = policy.run(execute, {
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
    const policy = new SequencePolicy([
      { delayMs: 10, reason: "retry", shouldRetry: true },
    ]);
    const controller = new AbortController();
    const execute = vi
      .fn<(attempt: number) => Promise<string>>()
      .mockRejectedValue(new Error("fail"));
    const sleep = vi
      .fn<(delayMs: number) => Promise<void>>()
      .mockRejectedValue(new Error("sleep-fail"));

    await expect(
      policy.run(execute, {
        signal: controller.signal,
        sleep,
        throwOnExhausted: false,
      })
    ).rejects.toThrow("sleep-fail");
  });

  it("returns abort result from waitForDelay catch path", async () => {
    const policy = new SequencePolicy([
      { delayMs: 10, reason: "retry", shouldRetry: true },
    ]);
    const execute = vi
      .fn<(attempt: number) => Promise<string>>()
      .mockRejectedValue(new Error("fail"));
    const sleep = vi
      .fn<(delayMs: number) => Promise<void>>()
      .mockResolvedValue();

    let readCount = 0;
    const fakeSignal = {
      get aborted() {
        readCount += 1;
        return readCount >= 3;
      },
      addEventListener:
        vi.fn<
          (type: string, listener: EventListenerOrEventListenerObject) => void
        >(),
      reason: "aborted-from-wait-catch",
      removeEventListener:
        vi.fn<
          (type: string, listener: EventListenerOrEventListenerObject) => void
        >(),
    } as unknown as AbortSignal;

    const result = await policy.run(execute, {
      signal: fakeSignal,
      sleep,
      throwOnExhausted: false,
    });

    const failure = expectFailureResult(result);
    expect(failure.attempts).toBe(1);
    expect(failure.error.message).toBe("aborted-from-wait-catch");
    expect(failure.error).toBeInstanceOf(AbortError);
  });

  it("returns a wrapped failure result immediately when it fails policy.isKnownError, bypassing retry", async () => {
    const policy = new SequencePolicy([
      { delayMs: 0, reason: "retry", shouldRetry: true },
    ]);
    const notAnError = { message: "plain-object-rejection" };
    const execute = vi
      .fn<(attempt: number) => Promise<string>>()
      .mockRejectedValue(notAnError);

    const result = await policy.run(execute, { throwOnExhausted: false });

    const failure = expectFailureResult(result);
    expect(failure.attempts).toBe(1);
    expect(failure.error).toBeInstanceOf(RetryError);
    if (failure.error instanceof RetryError) {
      expect(failure.error.lastError).toBe(notAnError);
    }
    expect(execute).toHaveBeenCalledTimes(1);
    expect(policy.seen).toStrictEqual([]);
  });
});

describe("BaseRetryPolicy", () => {
  it("creates RetryError with data from default onExhausted", () => {
    const policy = new SequencePolicy([
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
    const policy = new SequencePolicy([]);

    expect(policy.isKnownError(new Error("boom"))).toBeTruthy();
    expect(policy.isKnownError(new TypeError("boom"))).toBeTruthy();
    expect(policy.isKnownError("boom")).toBeFalsy();
    expect(policy.isKnownError({ message: "boom" })).toBeFalsy();
    expect(policy.isKnownError(undefined)).toBeFalsy();
  });
});

describe("test helpers", () => {
  describe(SequencePolicy, () => {
    it("falls back to a terminal decision when constructed without decisions", () => {
      const policy = new SequencePolicy([]);

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
      const policy = new SequencePolicy([
        { delayMs: 5, reason: "retryable", shouldRetry: true },
      ]);
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

  describe(expectFailureResult, () => {
    it("returns the failure result unchanged", () => {
      const policy = new SequencePolicy([]);
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
      expect(() =>
        expectFailureResult({ ok: true, value: "done" })
      ).toThrowError("Expected failure result");
    });
  });
});
