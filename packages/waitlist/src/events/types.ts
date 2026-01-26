import type { Email } from "@zap-studio/validation/email/types";

/** A function that handles events within the waitlist and takes a payload */
export type Handler<T> = (payload: T) => void | Promise<void>;

/** Logger surface for EventBus error reporting */
export interface ILogger {
  error: (
    message: string,
    err: unknown,
    context?: {
      event: WaitlistEventType;
      errorEmitFailed?: unknown;
    }
  ) => void;
}

/** Error callback surface for EventBus error reporting */
export type ErrorReporter = (
  err: unknown,
  context: {
    event: WaitlistEventType;
    errorEmitFailed?: unknown;
  }
) => void;

/** Represents the payload of an event in the waitlist system */
export interface EventPayloadMap {
  /** Represents the payload of a join event */
  join: { email: Email };

  /** Represents the payload of a referral event */
  referral: { referrer: Email; referee: Email };

  /** Represents the payload of a leave event */
  leave: { email: Email; reason?: string };

  /** Represents the payload of an error event */
  error: { err: unknown; source: keyof EventPayloadMap };
}

/** Represents the type of an event in the waitlist system */
export type WaitlistEventType = keyof EventPayloadMap;

/** Represents an event in the waitlist system */
export interface WaitlistEvent<T = unknown> {
  /** The type of event */
  type: WaitlistEventType;

  /** The payload associated with the event */
  payload: T;

  /** The timestamp when the event occurred */
  timestamp: Date;
}
