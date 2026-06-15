import { describe, expect, it, vi } from "vitest";

import { CustomTerminalPolicy, SequencePolicy } from "./sequence-policy.js";

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
});
