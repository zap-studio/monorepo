import "server-only";

import { type } from "@orpc/server";
import type { ModelMessage } from "ai";

import { authMiddleware, base } from "@/rpc/middlewares";
import { withRpcHandler } from "@/zap/lib/api/handlers";
import {
  InputDeleteAPIKeySchema,
  InputGetAPIKeySchema,
  InputSaveAPIKeySchema,
  InputTestAPIKeySchema,
  InputUpdateAPIKeySchema,
} from "@/zap/schemas/ai.schema";
import { deleteAPIKeyService } from "@/zap/services/ai/delete-api-key.service";
import { getAISettingsService } from "@/zap/services/ai/get-ai-settings.service";
import { saveAISettingsService } from "@/zap/services/ai/save-ai-settings.service";
import { saveOrUpdateAISettingsService } from "@/zap/services/ai/save-or-update-ai-settings.service";
import { streamChatService } from "@/zap/services/ai/stream-chat.service";
import { streamCompletionService } from "@/zap/services/ai/stream-completion.service";
import { testAPIKeyService } from "@/zap/services/ai/test-api-key.service";
import { updateAISettingsService } from "@/zap/services/ai/update-ai-settings.service";
import type { AIProviderId } from "@/zap/types/ai.types";

const getAISettings = base
  .use(authMiddleware)
  .input(InputGetAPIKeySchema)
  .handler(
    withRpcHandler(async ({ input, context }) => {
      return await getAISettingsService({
        userId: context.session.session.userId,
        provider: input.provider,
      });
    }),
  );

const saveAISettings = base
  .use(authMiddleware)
  .input(InputSaveAPIKeySchema)
  .handler(
    withRpcHandler(async ({ input, context }) => {
      return await saveAISettingsService({
        userId: context.session.session.userId,
        ...input,
      });
    }),
  );

const updateAISettings = base
  .use(authMiddleware)
  .input(InputUpdateAPIKeySchema)
  .handler(
    withRpcHandler(async ({ input, context }) => {
      return await updateAISettingsService({
        userId: context.session.session.userId,
        ...input,
      });
    }),
  );

const deleteAPIKey = base
  .use(authMiddleware)
  .input(InputDeleteAPIKeySchema)
  .handler(
    withRpcHandler(async ({ input, context }) => {
      return await deleteAPIKeyService({
        userId: context.session.session.userId,
        ...input,
      });
    }),
  );

const saveOrUpdateAISettings = base
  .use(authMiddleware)
  .input(InputSaveAPIKeySchema)
  .handler(
    withRpcHandler(async ({ input, context }) => {
      return await saveOrUpdateAISettingsService({
        userId: context.session.session.userId,
        ...input,
      });
    }),
  );

const testAPIKey = base
  .use(authMiddleware)
  .input(InputTestAPIKeySchema)
  .handler(
    withRpcHandler(async ({ input }) => {
      return await testAPIKeyService({
        ...input,
      });
    }),
  );

const streamChat = base
  .use(authMiddleware)
  .input(
    type<{
      provider: AIProviderId;
      messages: ModelMessage[];
    }>(),
  )
  .handler(
    withRpcHandler(async ({ input, context }) => {
      return await streamChatService({
        userId: context.session.session.userId,
        ...input,
      });
    }),
  );

const streamCompletion = base
  .use(authMiddleware)
  .input(
    type<{
      provider: AIProviderId;
      prompt: string;
    }>(),
  )
  .handler(
    withRpcHandler(async ({ input, context }) => {
      return await streamCompletionService({
        userId: context.session.session.userId,
        ...input,
      });
    }),
  );

export const ai = {
  getAISettings,
  saveAISettings,
  updateAISettings,
  deleteAPIKey,
  saveOrUpdateAISettings,
  testAPIKey,
  streamChat,
  streamCompletion,
};
