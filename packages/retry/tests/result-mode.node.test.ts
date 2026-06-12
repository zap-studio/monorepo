import { strict as assert } from "node:assert";

import { describe, expect, it, vi } from "vitest";

import { AbortError, RetryError } from "../src/errors.js";
import { expectFailureResult, SequencePolicy } from "./sequence-policy.js";

describe("result mode (throwOnExhausted: false)", () => {
  it("returns terminal result instead of throwing when retries stop", async () => {
    const policy = new SequencePolicy([
      { delayMs: 0, reason: "max-attempts-reached", shouldRetry: false },
    ]);
    const execute = vi
      .fn<(attempt: number) => Promise<string>>()
      .mockRejectedValue(new Error("fail"));

    const result = await policy.run(execute, { throwOnExhausted: false });

    expect(result).toMatchObject({
      attempts: 1,
      ok: false,
    });
    assert.ok(!result.ok);
    expect(result.error).toBeInstanceOf(RetryError);
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
      .mockImplementation(async () => {
        controller.abort("aborted-during-execute");
        throw new Error("failed");
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
});
