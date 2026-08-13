/**
 * Public entrypoint for the webhooks package.
 *
 * Re-exports the full public API. Every symbol is also available from a
 * dedicated subpath (`@zap-studio/webhooks/router`,
 * `@zap-studio/webhooks/verify`, ...) for consumers who prefer granular
 * imports. All exports are side-effect free and tree-shakeable.
 *
 * @module @zap-studio/webhooks
 */

export { VerificationError } from "./errors.js";
export { createWebhookRouter, WebhookRouter } from "./router.js";
export type {
  AfterHook,
  BeforeHook,
  ErrorHook,
  HandlerContext,
  HandlerMap,
  InferSchemaOutput,
  InferWebhookMapFromRoutes,
  RegisterOptions,
  SchemaRouteOptions,
  SchemaRoutes,
  VerifyFn,
  WebhookContext,
  WebhookHandler,
  WebhookRouterOptions,
} from "./types.js";
export { createHmacVerifier } from "./verify.js";
