import "server-only";

import { isAuthenticatedService } from "@/zap/auth/services";
import { DEV } from "@/zap/env/runtime";

import { EnvironmentError, UnauthorizedError } from ".";
import {
  generateCorrelationId,
  handleError,
  type HandlerFunction,
  type HandlerOptions,
  logSuccess,
} from "./utils";

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
