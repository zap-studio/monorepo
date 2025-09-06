import "server-only";

import { type } from "@orpc/server";
import type { UIMessage } from "ai";
import { base } from "@/zap/api/rpc/middlewares";
import { authMiddleware } from "@/zap/auth/rpc/middlewares";
import { withRpcHandler } from "@/zap/errors/handlers";
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

const getAISettings = base
  .use(authMiddleware)
  .input(InputGetAPIKeySchema)
  .handler(
    withRpcHandler(async ({ input, context }) => {
      return await getAISettingsService({
        userId: context.session.session.userId,
        provider: input.provider,
      });
    })
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
    })
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
    })
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
    })
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
    })
  );

const testAPIKey = base
  .use(authMiddleware)
  .input(InputTestAPIKeySchema)
  .handler(
    withRpcHandler(async ({ input }) => {
      return await testAPIKeyService({
        ...input,
      });
    })
  );

const streamChat = base
  .use(authMiddleware)
  .input(
    type<{
      provider: AIProviderId;
      messages: UIMessage[];
    }>()
  )
  .handler(
    withRpcHandler(async ({ input, context }) => {
      return await streamChatService({
        userId: context.session.session.userId,
        ...input,
      });
    })
  );

const streamCompletion = base
  .use(authMiddleware)
  .input(
    type<{
      provider: AIProviderId;
      prompt: string;
    }>()
  )
  .handler(
    withRpcHandler(async ({ input, context }) => {
      return await streamCompletionService({
        userId: context.session.session.userId,
        ...input,
      });
    })
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
