import "server-only";

import { DEV } from "@/zap/env/runtime";

import { EnvironmentError, UnauthorizedError } from ".";
import {
  generateCorrelationId,
  type HandlerFunction,
  type HandlerOptions,
  handleError,
  logSuccess,
} from "./utils";

let isAuthenticatedService: (() => Promise<boolean>) | undefined;
try {
  isAuthenticatedService = (await import("@/zap/auth/services"))
    .isAuthenticatedService;
} catch {
  // Fail silently if auth plugin doesn't exist
}

function createHandler<T extends unknown[], R>(
  handler: HandlerFunction<T, R>,
  options: HandlerOptions & { handlerType: string },
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
      return await handleError(error, correlationId, startTime, options);
    }
  };
}

export function withApiHandler<T extends unknown[], R>(
  handler: HandlerFunction<T, R>,
  options: HandlerOptions = {},
) {
  return createHandler(handler, {
    ...options,
    handlerType: "api-route",
  });
}

export function withAuthenticatedApiHandler<T extends unknown[], R>(
  handler: HandlerFunction<T, R>,
  options: HandlerOptions = {},
) {
  return createHandler(
    async (...args: T): Promise<R> => {
      if (!isAuthenticatedService) {
        throw new EnvironmentError("Authentication service not available");
      }

      const isAuthenticated = await isAuthenticatedService();

      if (!isAuthenticated) {
        throw new UnauthorizedError("User not authenticated");
      }

      return handler(...args);
    },
    {
      ...options,
      handlerType: "authenticated-api-route",
    },
  );
}

export function withRpcHandler<T extends unknown[], R>(
  handler: HandlerFunction<T, R>,
  options: HandlerOptions = {},
) {
  return createHandler(handler, {
    ...options,
    handlerType: "rpc-procedure",
    context: { type: "rpc", ...options.context },
  });
}

export function withServerActionHandler<T extends unknown[], R>(
  handler: HandlerFunction<T, R>,
  options: HandlerOptions = {},
) {
  return createHandler(handler, {
    ...options,
    handlerType: "server-action",
    context: { type: "server-action", ...options.context },
  });
}
