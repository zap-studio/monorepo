import "server-only";

import { type } from "@orpc/server";
import type { UIMessage } from "ai";
import { base } from "@/zap/api/rpc/middlewares";
import { $authMiddleware } from "@/zap/auth/rpc/middlewares";
import { withRpcHandler } from "@/zap/errors/handlers";
import type { AIServerPluginConfig } from "@/zap/plugins/types/ai.plugin";
import type { AuthServerPluginConfig } from "@/zap/plugins/types/auth.plugin";
import {
  InputDeleteAPIKeySchema,
  InputGetAPIKeySchema,
  InputSaveAPIKeySchema,
  InputTestAPIKeySchema,
  InputUpdateAPIKeySchema,
} from "../../schemas";
import {
  deleteAPIKeyService,
  getAISettingsService,
  saveAISettingsService,
  saveOrUpdateAISettingsService,
  streamChatService,
  streamCompletionService,
  testAPIKeyService,
  updateAISettingsService,
} from "../../services";
import type { AIProviderId } from "../../types";

const $getAISettings = (pluginConfigs: {
  auth: Partial<AuthServerPluginConfig>;
}) =>
  base
    .use($authMiddleware(pluginConfigs))
    .input(InputGetAPIKeySchema)
    .handler(
      withRpcHandler(
        async ({ input, context }) =>
          await getAISettingsService({
            userId: context.session.session.userId,
            provider: input.provider,
          })
      )
    );

const $saveAISettings = (pluginConfigs: {
  auth: Partial<AuthServerPluginConfig>;
}) =>
  base
    .use($authMiddleware(pluginConfigs))
    .input(InputSaveAPIKeySchema)
    .handler(
      withRpcHandler(({ input, context }) =>
        saveAISettingsService({
          userId: context.session.session.userId,
          ...input,
        })
      )
    );

const $updateAISettings = (pluginConfigs: {
  auth: Partial<AuthServerPluginConfig>;
}) =>
  base
    .use($authMiddleware(pluginConfigs))
    .input(InputUpdateAPIKeySchema)
    .handler(
      withRpcHandler(({ input, context }) =>
        updateAISettingsService({
          userId: context.session.session.userId,
          ...input,
        })
      )
    );

const $deleteAPIKey = (pluginConfigs: {
  auth: Partial<AuthServerPluginConfig>;
}) =>
  base
    .use($authMiddleware(pluginConfigs))
    .input(InputDeleteAPIKeySchema)
    .handler(
      withRpcHandler(({ input, context }) =>
        deleteAPIKeyService({
          userId: context.session.session.userId,
          ...input,
        })
      )
    );

const $saveOrUpdateAISettings = (pluginConfigs: {
  auth: Partial<AuthServerPluginConfig>;
}) =>
  base
    .use($authMiddleware(pluginConfigs))
    .input(InputSaveAPIKeySchema)
    .handler(
      withRpcHandler(({ input, context }) =>
        saveOrUpdateAISettingsService({
          userId: context.session.session.userId,
          ...input,
        })
      )
    );

const $testAPIKey = (pluginConfigs: {
  auth: Partial<AuthServerPluginConfig>;
}) =>
  base
    .use($authMiddleware(pluginConfigs))
    .input(InputTestAPIKeySchema)
    .handler(
      withRpcHandler(({ input }) =>
        testAPIKeyService({
          ...input,
        })
      )
    );

const $streamChat = (pluginConfigs: {
  auth: Partial<AuthServerPluginConfig>;
  ai: Partial<AIServerPluginConfig>;
}) =>
  base
    .use($authMiddleware(pluginConfigs))
    .input(
      type<{
        provider: AIProviderId;
        messages: UIMessage[];
      }>()
    )
    .handler(
      withRpcHandler(({ input, context }) =>
        streamChatService({
          userId: context.session.session.userId,
          ...input,
          pluginConfigs,
        })
      )
    );

const $streamCompletion = (pluginConfigs: {
  auth: Partial<AuthServerPluginConfig>;
  ai: Partial<AIServerPluginConfig>;
}) =>
  base
    .use($authMiddleware(pluginConfigs))
    .input(
      type<{
        provider: AIProviderId;
        prompt: string;
      }>()
    )
    .handler(
      withRpcHandler(({ input, context }) =>
        streamCompletionService({
          userId: context.session.session.userId,
          ...input,
          pluginConfigs,
        })
      )
    );

export const $ai = (pluginConfigs: {
  auth: Partial<AuthServerPluginConfig>;
  ai: Partial<AIServerPluginConfig>;
}) => ({
  getAISettings: $getAISettings(pluginConfigs),
  saveAISettings: $saveAISettings(pluginConfigs),
  updateAISettings: $updateAISettings(pluginConfigs),
  deleteAPIKey: $deleteAPIKey(pluginConfigs),
  saveOrUpdateAISettings: $saveOrUpdateAISettings(pluginConfigs),
  testAPIKey: $testAPIKey(pluginConfigs),
  streamChat: $streamChat(pluginConfigs),
  streamCompletion: $streamCompletion(pluginConfigs),
});
