import type {
  ComponentMap,
  IntegrationsMap,
  MiddlewareMap,
  RpcMiddlewareMap,
  ZapServerPlugin,
} from "@/zap/plugins/types";
import type { AIServerPluginConfig } from "@/zap/plugins/types/ai.plugin";
import { AI_PROVIDERS_OBJECT, DEFAULT_MODEL, ModelsByProvider } from "./data";
import { getApiSettingsForUserAndProviderQuery } from "./db/providers/drizzle/queries";
import { userAISettings } from "./db/providers/drizzle/schema";
import { $ai } from "./rpc/procedures";
import {
  AIFormSchema,
  AIProviderIdSchema,
  InputDeleteAPIKeySchema,
  InputGetAPIKeySchema,
  InputSaveAPIKeySchema,
  InputTestAPIKeySchema,
  InputUpdateAPIKeySchema,
  ModelNameSchema,
} from "./schemas";
import {
  deleteAPIKeyService,
  getAISettingsService,
  saveAISettingsService,
  saveOrUpdateAISettingsService,
  streamChatService,
  streamCompletionService,
  testAPIKeyService,
  updateAISettingsService,
} from "./services";
import { AIProviderIdEnum } from "./types";
import { getModel, getProviderName } from "./utils";

export function aiPlugin(
  config?: Partial<AIServerPluginConfig>
): ZapServerPlugin<
  "ai",
  AIServerPluginConfig,
  IntegrationsMap,
  ComponentMap,
  {
    AIProviderIdSchema: typeof AIProviderIdSchema;
    ModelNameSchema: typeof ModelNameSchema;
    AIFormSchema: typeof AIFormSchema;
    InputGetAPIKeySchema: typeof InputGetAPIKeySchema;
    InputSaveAPIKeySchema: typeof InputSaveAPIKeySchema;
    InputUpdateAPIKeySchema: typeof InputUpdateAPIKeySchema;
    InputDeleteAPIKeySchema: typeof InputDeleteAPIKeySchema;
    InputTestAPIKeySchema: typeof InputTestAPIKeySchema;
  },
  {
    getModel: typeof getModel;
    getProviderName: typeof getProviderName;
  },
  {
    AIProviderIdEnum: typeof AIProviderIdEnum;
  },
  {
    DEFAULT_MODEL: typeof DEFAULT_MODEL;
    AI_PROVIDERS_OBJECT: typeof AI_PROVIDERS_OBJECT;
    ModelsByProvider: typeof ModelsByProvider;
  },
  MiddlewareMap,
  ComponentMap,
  {
    getApiSettingsForUserAndProviderQuery: typeof getApiSettingsForUserAndProviderQuery;
  },
  {
    userAISettings: typeof userAISettings;
  },
  typeof $ai,
  RpcMiddlewareMap,
  {
    getAISettingsService: typeof getAISettingsService;
    deleteAPIKeyService: typeof deleteAPIKeyService;
    saveAISettingsService: typeof saveAISettingsService;
    saveOrUpdateAISettingsService: typeof saveOrUpdateAISettingsService;
    streamChatService: typeof streamChatService;
    streamCompletionService: typeof streamCompletionService;
    testAPIKeyService: typeof testAPIKeyService;
    updateAISettingsService: typeof updateAISettingsService;
  }
> {
  return {
    id: "ai",
    config,
    schemas: {
      AIProviderIdSchema,
      ModelNameSchema,
      AIFormSchema,
      InputGetAPIKeySchema,
      InputSaveAPIKeySchema,
      InputUpdateAPIKeySchema,
      InputDeleteAPIKeySchema,
      InputTestAPIKeySchema,
    },
    utils: {
      getModel,
      getProviderName,
    },
    types: {
      AIProviderIdEnum,
    },
    data: {
      DEFAULT_MODEL,
      AI_PROVIDERS_OBJECT,
      ModelsByProvider,
    },
    db: {
      providers: {
        drizzle: {
          queries: {
            getApiSettingsForUserAndProviderQuery,
          },
          schemas: {
            userAISettings,
          },
        },
      },
    },
    rpc: {
      procedures: $ai,
    },
    services: {
      getAISettingsService,
      deleteAPIKeyService,
      saveAISettingsService,
      saveOrUpdateAISettingsService,
      streamChatService,
      streamCompletionService,
      testAPIKeyService,
      updateAISettingsService,
    },
  } satisfies ZapServerPlugin<"ai">;
}
