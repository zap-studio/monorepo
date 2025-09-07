import { UnauthorizedError } from "@/zap/errors";
import { createHandler } from "@/zap/errors/handlers";
import type { HandlerFunction, HandlerOptions } from "@/zap/errors/utils";
import { isAuthenticatedService } from "../services";

export function withAuthenticatedApiHandler<T extends unknown[], R>(
  handler: HandlerFunction<T, R>,
  options: HandlerOptions = {}
) {
  return createHandler(
    async (...args: T): Promise<R> => {
      const isAuthenticated = await isAuthenticatedService();

      if (!isAuthenticated) {
        throw new UnauthorizedError("User not authenticated");
      }

      return handler(...args);
    },
    {
      ...options,
      handlerType: "authenticated-api-route",
    }
  );
}
