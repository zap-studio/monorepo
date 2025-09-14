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

const $getAISettings = (authConfig: Partial<AuthServerPluginConfig>) =>
  base
    .use($authMiddleware(authConfig))
    .input(InputGetAPIKeySchema)
    .handler(
      withRpcHandler(async ({ input, context }) => {
        return await getAISettingsService({
          userId: context.session.session.userId,
          provider: input.provider,
        });
      })
    );

const $saveAISettings = (authConfig: Partial<AuthServerPluginConfig>) =>
  base
    .use($authMiddleware(authConfig))
    .input(InputSaveAPIKeySchema)
    .handler(
      withRpcHandler(({ input, context }) => {
        return saveAISettingsService({
          userId: context.session.session.userId,
          ...input,
        });
      })
    );

const $updateAISettings = (authConfig: Partial<AuthServerPluginConfig>) =>
  base
    .use($authMiddleware(authConfig))
    .input(InputUpdateAPIKeySchema)
    .handler(
      withRpcHandler(({ input, context }) => {
        return updateAISettingsService({
          userId: context.session.session.userId,
          ...input,
        });
      })
    );

const $deleteAPIKey = (authConfig: Partial<AuthServerPluginConfig>) =>
  base
    .use($authMiddleware(authConfig))
    .input(InputDeleteAPIKeySchema)
    .handler(
      withRpcHandler(({ input, context }) => {
        return deleteAPIKeyService({
          userId: context.session.session.userId,
          ...input,
        });
      })
    );

const $saveOrUpdateAISettings = (authConfig: Partial<AuthServerPluginConfig>) =>
  base
    .use($authMiddleware(authConfig))
    .input(InputSaveAPIKeySchema)
    .handler(
      withRpcHandler(({ input, context }) => {
        return saveOrUpdateAISettingsService({
          userId: context.session.session.userId,
          ...input,
        });
      })
    );

const $testAPIKey = (authConfig: Partial<AuthServerPluginConfig>) =>
  base
    .use($authMiddleware(authConfig))
    .input(InputTestAPIKeySchema)
    .handler(
      withRpcHandler(({ input }) => {
        return testAPIKeyService({
          ...input,
        });
      })
    );

const $streamChat = (authConfig: Partial<AuthServerPluginConfig>) =>
  base
    .use($authMiddleware(authConfig))
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

const $streamCompletion = (authConfig: Partial<AuthServerPluginConfig>) =>
  base
    .use($authMiddleware(authConfig))
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

export const $ai = (authConfig: Partial<AuthServerPluginConfig>) => ({
  getAISettings: $getAISettings(authConfig),
  saveAISettings: $saveAISettings(authConfig),
  updateAISettings: $updateAISettings(authConfig),
  deleteAPIKey: $deleteAPIKey(authConfig),
  saveOrUpdateAISettings: $saveOrUpdateAISettings(authConfig),
  testAPIKey: $testAPIKey(authConfig),
  streamChat: $streamChat(authConfig),
  streamCompletion: $streamCompletion(authConfig),
});
