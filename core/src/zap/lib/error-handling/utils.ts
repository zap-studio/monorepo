import { ZodError } from "zod";

import { DEV } from "@/lib/env.public";
import {
  BaseError,
  InternalServerError,
} from "@/zap/lib/error-handling/errors";
import { logError } from "@/zap/lib/error-handling/logger";

export type HandlerFunction<T extends unknown[], R> = (
  ...args: T
) => Promise<R> | R;

interface ErrorResponse {
  error: string;
  message: string;
  code: string;
  statusCode: number;
  timestamp: string;
  correlationId: string;
  details?: unknown;
}

export interface HandlerOptions {
  includeStack?: boolean;
  correlationId?: string;
  context?: Record<string, unknown>;
}

export function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

export function createErrorResponse(
  error: unknown,
  correlationId: string,
  includeStack = false,
): { response: ErrorResponse; statusCode: number } {
  const timestamp = new Date().toISOString();

  if (error instanceof BaseError) {
    return {
      response: {
        error: error.name,
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        timestamp,
        correlationId,
        ...(includeStack &&
          DEV && {
            details: { stack: error.stack, cause: error.cause },
          }),
      },
      statusCode: error.statusCode,
    };
  }

  if (error instanceof ZodError) {
    return {
      response: {
        error: "ValidationError",
        message: "Invalid input data",
        code: "VALIDATION_ERROR",
        statusCode: 400,
        timestamp,
        correlationId,
        details: error.issues,
      },
      statusCode: 400,
    };
  }

  if (error instanceof Error) {
    return {
      response: {
        error: "InternalServerError",
        message: DEV ? error.message : "An unexpected error occurred",
        code: "INTERNAL_SERVER_ERROR",
        statusCode: 500,
        timestamp,
        correlationId,
        ...(DEV &&
          includeStack && {
            details: { stack: error.stack },
          }),
      },
      statusCode: 500,
    };
  }

  return {
    response: {
      error: "UnknownError",
      message: "An unexpected error occurred",
      code: "UNKNOWN_ERROR",
      statusCode: 500,
      timestamp,
      correlationId,
      ...(DEV && {
        details: { error: String(error) },
      }),
    },
    statusCode: 500,
  };
}

export function logSuccess(
  correlationId: string,
  startTime: number,
  options: HandlerOptions & { handlerType: string },
) {
  const duration = Date.now() - startTime;
  console.log(
    `[${correlationId}] ${options.handlerType} completed in ${duration}ms`,
    {
      context: options.context,
      duration,
      type: options.handlerType,
    },
  );
}

export function transformError(error: unknown): BaseError {
  if (error instanceof BaseError) {
    return error;
  }

  if (error instanceof ZodError) {
    return new InternalServerError("Validation failed", error);
  }

  return new InternalServerError("Operation failed", error);
}

export function handleError<R>(
  error: unknown,
  correlationId: string,
  startTime: number,
  options: HandlerOptions & { handlerType: string },
): R {
  const duration = Date.now() - startTime;

  logError(error);
  console.error(
    `[${correlationId}] ${options.handlerType} failed after ${duration}ms`,
    {
      context: options.context,
      duration,
      type: options.handlerType,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
    },
  );

  if (options.handlerType === "server-action") {
    throw transformError(error);
  }

  const { response, statusCode } = createErrorResponse(
    error,
    correlationId,
    options.includeStack,
  );

  return Response.json(response, {
    status: statusCode,
    headers: {
      "x-correlation-id": correlationId,
      "x-error-type": response.error,
    },
  }) as R;
}
