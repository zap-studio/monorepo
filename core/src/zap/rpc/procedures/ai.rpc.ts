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
  .handler(withRpcHandler(getAISettingsService));

const saveAISettings = base
  .use(authMiddleware)
  .input(InputSaveAPIKeySchema)
  .handler(withRpcHandler(saveAISettingsService));

const updateAISettings = base
  .use(authMiddleware)
  .input(InputUpdateAPIKeySchema)
  .handler(withRpcHandler(updateAISettingsService));

const deleteAPIKey = base
  .use(authMiddleware)
  .input(InputDeleteAPIKeySchema)
  .handler(withRpcHandler(deleteAPIKeyService));

const saveOrUpdateAISettings = base
  .use(authMiddleware)
  .input(InputSaveAPIKeySchema)
  .handler(withRpcHandler(saveOrUpdateAISettingsService));

const testAPIKey = base
  .use(authMiddleware)
  .input(InputTestAPIKeySchema)
  .handler(withRpcHandler(testAPIKeyService));

const streamChat = base
  .use(authMiddleware)
  .input(
    type<{
      provider: AIProviderId;
      messages: ModelMessage[];
    }>(),
  )
  .handler(withRpcHandler(streamChatService));

const streamCompletion = base
  .use(authMiddleware)
  .input(
    type<{
      provider: AIProviderId;
      prompt: string;
    }>(),
  )
  .handler(withRpcHandler(streamCompletionService));

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
