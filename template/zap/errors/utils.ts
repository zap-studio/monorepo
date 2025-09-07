import "server-only";

import type { z } from "zod";
import { ZodError } from "zod";
import { DEV } from "@/zap/env/runtime/public";
import { BaseError, InternalServerError } from ".";
import { logError } from "./logger/server";
import { generateUuid } from "./uuid";

export type HandlerFunction<T extends unknown[], R> = (
  ...args: T
) => Promise<R> | R;

type ErrorResponse = {
  error: string;
  message: string;
  code: string;
  statusCode: number;
  timestamp: string;
  correlationId: string;
  details?: unknown;
};

export type HandlerOptions = {
  includeStack?: boolean;
  correlationId?: string;
  context?: Record<string, unknown>;
};

export function generateCorrelationId(): string {
  return generateUuid();
}

export function createErrorResponse(
  error: unknown,
  correlationId: string,
  includeStack = false
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
  options: HandlerOptions & { handlerType: string }
) {
  const duration = Date.now() - startTime;

  const meta = {
    context: options.context,
    duration,
    type: options.handlerType,
  };
  process.stdout.write(
    `[${correlationId}] ${options.handlerType} completed in ${duration}ms ${JSON.stringify(meta)}\n`
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
  options: HandlerOptions & { handlerType: string }
): R {
  const duration = Date.now() - startTime;

  logError(error);
  const meta = {
    context: options.context,
    duration,
    type: options.handlerType,
    errorType: error instanceof Error ? error.constructor.name : typeof error,
  };
  process.stderr.write(
    `[${correlationId}] ${options.handlerType} failed after ${duration}ms ${JSON.stringify(meta)}\n`
  );

  // For RPC procedures, convert BaseError to ORPC error
  if (options.handlerType === "rpc-procedure") {
    const baseError = transformError(error);
    throw baseError.toORPCError();
  }

  // For server actions, transform to BaseError
  if (options.handlerType === "server-action") {
    throw transformError(error);
  }

  // For API routes, return HTTP response
  const { response, statusCode } = createErrorResponse(
    error,
    correlationId,
    options.includeStack
  );

  return Response.json(response, {
    status: statusCode,
    headers: {
      "x-correlation-id": correlationId,
      "x-error-type": response.error,
    },
  }) as R;
}

export async function parseRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<T> {
  const body = await request.json();
  return schema.parse(body);
}
