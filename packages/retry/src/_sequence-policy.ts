// oxlint-disable max-classes-per-file -- Test fixture policies are intentionally colocated.
import { expect } from "vitest";

import type { AbortError } from "./errors.js";
import { RetryError } from "./errors.js";
import { BaseRetryPolicy } from "./index.js";
import type {
  RetryDecision,
  RetryDecisionInput,
  RetryExhaustedInput,
  RetryRunResult,
} from "./types.js";

export class SequencePolicy extends BaseRetryPolicy<Error, string> {
  public readonly seen: RetryDecisionInput<Error, string>[] = [];
  private index = 0;
  private readonly decisions: RetryDecision[];

  constructor(decisions: RetryDecision[]) {
    super();
    this.decisions = decisions;
  }

  public next(input: RetryDecisionInput<Error, string>): RetryDecision {
    this.seen.push(input);
    const decision =
      this.decisions[Math.min(this.index, this.decisions.length - 1)];
    this.index += 1;
    return (
      decision ?? { delayMs: 0, reason: "policy-declined", shouldRetry: false }
    );
  }
}

export class CustomTerminalPolicy extends BaseRetryPolicy<Error> {
  // oxlint-disable-next-line class-methods-use-this -- RetryPolicy requires an instance hook that subclasses may override.
  public next(): RetryDecision {
    return { delayMs: 0, reason: "policy-declined", shouldRetry: false };
  }

  // oxlint-disable-next-line class-methods-use-this -- RetryPolicy requires an instance hook that subclasses may override.
  public override onExhausted(input: RetryExhaustedInput<Error>): RetryError {
    return new RetryError(`custom:${input.attempts}`, {
      attempts: input.attempts,
      lastError: input.error,
    });
  }
}

export const expectFailureResult = (
  result: RetryRunResult<string>
): {
  ok: false;
  attempts: number;
  error: AbortError | RetryError;
} => {
  if (result.ok) {
    expect.fail("Expected failure result");
  }

  return result;
};
