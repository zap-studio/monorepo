import { expect } from "vitest";
// oxlint-disable class-methods-use-this, max-classes-per-file -- Test fixtures define small policy classes to exercise base-class behavior.

import type { AbortError } from "../src/errors.js";
import { RetryError } from "../src/errors.js";
import { BaseRetryPolicy } from "../src/index.js";
import type {
  RetryDecision,
  RetryDecisionInput,
  RetryExhaustedInput,
  RetryRunResult,
} from "../src/types.js";

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
  public next(): RetryDecision {
    return { delayMs: 0, reason: "policy-declined", shouldRetry: false };
  }

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
  expect(result).toMatchObject({ ok: false });
  if (result.ok) {
    throw new Error("Expected failure result");
  }

  return result;
};
