import "server-only";

import { type } from "@orpc/server";
import type { UIMessage } from "ai";
import { base } from "@/zap/api/rpc/middlewares";
import { $authMiddleware } from "@/zap/auth/rpc/middlewares";
import { withRpcHandler } from "@/zap/errors/handlers";
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
    .use($authMiddleware(pluginConfigs.auth))
    .input(InputGetAPIKeySchema)
    .handler(
      withRpcHandler(async ({ input, context }) => {
        return await getAISettingsService({
          userId: context.session.session.userId,
          provider: input.provider,
        });
      })
    );

const $saveAISettings = (pluginConfigs: {
  auth: Partial<AuthServerPluginConfig>;
}) =>
  base
    .use($authMiddleware(pluginConfigs.auth))
    .input(InputSaveAPIKeySchema)
    .handler(
      withRpcHandler(({ input, context }) => {
        return saveAISettingsService({
          userId: context.session.session.userId,
          ...input,
        });
      })
    );

const $updateAISettings = (pluginConfigs: {
  auth: Partial<AuthServerPluginConfig>;
}) =>
  base
    .use($authMiddleware(pluginConfigs.auth))
    .input(InputUpdateAPIKeySchema)
    .handler(
      withRpcHandler(({ input, context }) => {
        return updateAISettingsService({
          userId: context.session.session.userId,
          ...input,
        });
      })
    );

const $deleteAPIKey = (pluginConfigs: {
  auth: Partial<AuthServerPluginConfig>;
}) =>
  base
    .use($authMiddleware(pluginConfigs.auth))
    .input(InputDeleteAPIKeySchema)
    .handler(
      withRpcHandler(({ input, context }) => {
        return deleteAPIKeyService({
          userId: context.session.session.userId,
          ...input,
        });
      })
    );

const $saveOrUpdateAISettings = (pluginConfigs: {
  auth: Partial<AuthServerPluginConfig>;
}) =>
  base
    .use($authMiddleware(pluginConfigs.auth))
    .input(InputSaveAPIKeySchema)
    .handler(
      withRpcHandler(({ input, context }) => {
        return saveOrUpdateAISettingsService({
          userId: context.session.session.userId,
          ...input,
        });
      })
    );

const $testAPIKey = (pluginConfigs: {
  auth: Partial<AuthServerPluginConfig>;
}) =>
  base
    .use($authMiddleware(pluginConfigs.auth))
    .input(InputTestAPIKeySchema)
    .handler(
      withRpcHandler(({ input }) => {
        return testAPIKeyService({
          ...input,
        });
      })
    );

const $streamChat = (pluginConfigs: {
  auth: Partial<AuthServerPluginConfig>;
}) =>
  base
    .use($authMiddleware(pluginConfigs.auth))
    .input(
      type<{
        provider: AIProviderId;
        messages: UIMessage[];
      }>()
    )
    .handler(
      withRpcHandler(({ input, context }) => {
        return streamChatService({
          userId: context.session.session.userId,
          ...input,
        });
      })
    );

const $streamCompletion = (pluginConfigs: {
  auth: Partial<AuthServerPluginConfig>;
}) =>
  base
    .use($authMiddleware(pluginConfigs.auth))
    .input(
      type<{
        provider: AIProviderId;
        prompt: string;
      }>()
    )
    .handler(
      withRpcHandler(({ input, context }) => {
        return streamCompletionService({
          userId: context.session.session.userId,
          ...input,
        });
      })
    );

export const $ai = (pluginConfigs: {
  auth: Partial<AuthServerPluginConfig>;
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
