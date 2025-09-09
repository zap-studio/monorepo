import type {
  ComponentMap,
  IntegrationsMap,
  ZapClientPlugin,
} from "@/zap/plugins/types";
import type { AIClientPluginConfig } from "@/zap/plugins/types/ai.plugin";
import { SettingsSheet } from "./components/settings-sheet";
import { AI_PROVIDERS_OBJECT, DEFAULT_MODEL, ModelsByProvider } from "./data";
import {
  useAIChat,
  useAICompletion,
  useAISettings,
  useInitAISettings,
} from "./hooks";
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
import { AIProviderIdEnum } from "./types";
import { getModel, getProviderName } from "./utils";

export function aiClientPlugin(): ZapClientPlugin<
  "ai",
  AIClientPluginConfig,
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
  {
    useAIChat: typeof useAIChat;
    useAICompletion: typeof useAICompletion;
    useAISettings: typeof useAISettings;
    useInitAISettings: typeof useInitAISettings;
  },
  {
    SettingsSheet: typeof SettingsSheet;
  }
> {
  return {
    id: "ai",
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
    hooks: {
      useAIChat,
      useAICompletion,
      useAISettings,
      useInitAISettings,
    },
    components: {
      SettingsSheet,
    },
  } satisfies ZapClientPlugin<"ai">;
}
