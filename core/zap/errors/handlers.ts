import "server-only";

import { DEV } from "@/zap/env/runtime/public";

import {
  generateCorrelationId,
  type HandlerFunction,
  type HandlerOptions,
  handleError,
  logSuccess,
} from "./utils";

export function createHandler<T extends unknown[], R>(
  handler: HandlerFunction<T, R>,
  options: HandlerOptions & { handlerType: string }
) {
  return async (...args: T): Promise<R> => {
    const correlationId = options.correlationId || generateCorrelationId();
    const startTime = Date.now();

    try {
      const result = await handler(...args);

      if (DEV) {
        logSuccess(correlationId, startTime, options);
      }

      return result;
    } catch (error) {
      return handleError(error, correlationId, startTime, options);
    }
  };
}

export function withApiHandler<T extends unknown[], R>(
  handler: HandlerFunction<T, R>,
  options: HandlerOptions = {}
) {
  return createHandler(handler, {
    ...options,
    handlerType: "api-route",
  });
}

export function withRpcHandler<T extends unknown[], R>(
  handler: HandlerFunction<T, R>,
  options: HandlerOptions = {}
) {
  return createHandler(handler, {
    ...options,
    handlerType: "rpc-procedure",
    context: { type: "rpc", ...options.context },
  });
}

export function withServerActionHandler<T extends unknown[], R>(
  handler: HandlerFunction<T, R>,
  options: HandlerOptions = {}
) {
  return createHandler(handler, {
    ...options,
    handlerType: "server-action",
    context: { type: "server-action", ...options.context },
  });
}
