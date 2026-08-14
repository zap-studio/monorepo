import { expect } from "vitest";

import type { AbortError } from "./errors.js";
import { RetryError } from "./errors.js";
import type {
  RetryDecision,
  RetryDecisionInput,
  RetryExhaustedInput,
  RetryPolicy,
  RetryRunResult,
} from "./types.js";

export const createSequencePolicy = (
  decisions: RetryDecision[]
): Required<
  Pick<RetryPolicy<Error, string>, "isKnownError" | "next" | "onExhausted">
> & {
  seen: RetryDecisionInput<Error, string>[];
} => {
  const seen: RetryDecisionInput<Error, string>[] = [];
  let index = 0;

  return {
    isKnownError(error): error is Error {
      return error instanceof Error;
    },
    next(input: RetryDecisionInput<Error, string>): RetryDecision {
      seen.push(input);
      const decision = decisions[Math.min(index, decisions.length - 1)];
      index += 1;
      return (
        decision ?? {
          delayMs: 0,
          reason: "policy-declined",
          shouldRetry: false,
        }
      );
    },
    onExhausted(input: RetryExhaustedInput<Error, string>): RetryError {
      return new RetryError("Retry policy exhausted all attempts.", {
        attempts: input.attempts,
        lastData: input.data,
        lastError: input.error,
      });
    },
    seen,
  };
};

export const createCustomTerminalPolicy = (): RetryPolicy => ({
  next(): RetryDecision {
    return { delayMs: 0, reason: "policy-declined", shouldRetry: false };
  },
  onExhausted(input: RetryExhaustedInput): RetryError {
    return new RetryError(`custom:${input.attempts}`, {
      attempts: input.attempts,
      lastError: input.error,
    });
  },
});

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
