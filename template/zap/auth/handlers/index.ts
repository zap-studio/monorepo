import { UnauthorizedError } from "@/zap/errors";
import { createHandler } from "@/zap/errors/handlers";
import type { HandlerFunction, HandlerOptions } from "@/zap/errors/utils";
import type { AuthServerPluginConfig } from "@/zap/plugins/types/auth.plugin";
import { isAuthenticatedService } from "../services";

export function withAuthenticatedApiHandler<T extends unknown[], R>(
  handler: HandlerFunction<T, R>,
  pluginConfigs: {
    auth: Partial<AuthServerPluginConfig>;
  },
  options: HandlerOptions = {}
) {
  return createHandler(
    async (...args: T): Promise<R> => {
      const isAuthenticated = await isAuthenticatedService(pluginConfigs);

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
