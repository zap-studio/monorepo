/** This is the normalized request object so every adapter can rely on the same structure */
export type NormalizedRequest = {
  /** The HTTP method of the request */
  method: Request["method"];
  /** The path of the request you registered in the router (e.g. "payment", "subscription") */
  path: string;
  /** The headers of the request (e.g. { "Authorization": "Bearer token" }) */
  headers: Headers;
  /** The raw body of the request (for signature) */
  rawBody: Buffer;
  /** The parsed JSON body of the request if applicable */
  json?: unknown;
  /** The parsed text body of the request if applicable */
  text?: string;
  /** The query parameters of the request */
  query?: Record<string, string | string[]>;
  /** The route parameters of the request */
  params?: Record<string, string>;
};

/** This is the normalized response object so every adapter can rely on the same structure */
export type NormalizedResponse<TBody = unknown> = {
  /** The HTTP status code of the response */
  status: number;
  /** The body of the response */
  body?: TBody;
  /** The headers of the response */
  headers?: Headers;
};

/**
 * Validation result for schema validation
 */
export type ValidationResult<T> = {
  /** Whether validation succeeded */
  success: boolean;
  /** The validated data if successful */
  data?: T;
  /** Validation errors if failed */
  errors?: Array<{
    path?: string[];
    message: string;
  }>;
};

/**
 * Generic schema validator interface that can be implemented by any validation library
 */
export type SchemaValidator<T> = {
  /**
   * Validate data against the schema
   * @param data - The data to validate
   * @returns Validation result with success flag, data, and potential errors
   */
  validate<TData = unknown>(
    data: TData
  ): ValidationResult<T> | Promise<ValidationResult<T>>;
};

/** Options for registering a webhook handler */
export type RegisterOptions<T> = {
  /** The handler function to process the webhook */
  handler: WebhookHandler<T>;
  /** Optional schema validator to validate the webhook payload */
  schema?: SchemaValidator<T>;
  /** Hooks that run before request processing (after global before hooks) */
  before?: BeforeHook | BeforeHook[];
  /** Hooks that run after successful processing (before global after hooks) */
  after?: AfterHook | AfterHook[];
};

/** The webhook handler function, responsible for processing incoming webhook events. */
export type WebhookHandler<T = unknown> = (ctx: {
  req: NormalizedRequest;
  payload: T;
  ack: (res?: Partial<NormalizedResponse>) => Promise<NormalizedResponse>;
}) => Promise<NormalizedResponse | undefined> | NormalizedResponse | undefined;

/**
 * A map of webhook event types to their corresponding handler functions.
 *
 * @example
 * ```ts
 * const handlers: HandlerMap<{
 *   payment_succeeded: PaymentSucceededPayload;
 *   payment_failed: PaymentFailedPayload;
 * }> = {
 *   payment_succeeded: async ({ req, payload, ack }) => {
 *     // Handle payment succeeded event
 *     return ack({ status: 200, body: "Payment succeeded processed" });
 *   },
 *   payment_failed: async ({ req, payload, ack }) => {
 *     // Handle payment failed event
 *     return ack({ status: 200, body: "Payment failed processed" });
 *   },
 * };
 * ```
 */
export type HandlerMap<TMap extends Record<string, unknown>> = {
  [P in keyof TMap]: WebhookHandler<TMap[P]>;
};

/** Verification function for incoming requests */
export type VerifyFn = (req: NormalizedRequest) => Promise<void> | void;

/** Hook function that runs before request processing */
export type BeforeHook = (req: NormalizedRequest) => Promise<void> | void;

/** Hook function that runs after successful request processing */
export type AfterHook = (
  req: NormalizedRequest,
  res: NormalizedResponse
) => Promise<void> | void;

/** Hook function that runs when an error occurs */
export type ErrorHook = (
  error: Error,
  req: NormalizedRequest
) => Promise<NormalizedResponse | undefined> | NormalizedResponse | undefined;
