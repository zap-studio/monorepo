export type AIProviderId = "openai" | "mistral";

export const AIProviderIdEnum = {
  OPENAI: "openai",
  MISTRAL: "mistral",
} as const;

export type AIPluginConfig = {
  COMPLETION?: {
    FREQUENCY_PENALTY?: number;
    MAX_OUTPUT_TOKENS?: number;
    MAX_RETRIES?: number;
    PRESENCE_PENALTY?: number;
    STOP_SEQUENCES?: string[];
    TEMPERATURE?: number;
  };
  CHAT?: {
    FREQUENCY_PENALTY?: number;
    MAX_OUTPUT_TOKENS?: number;
    MAX_RETRIES?: number;
    PRESENCE_PENALTY?: number;
    STOP_SEQUENCES?: string[];
    TEMPERATURE?: number;
  };
  SYSTEM_PROMPT: string;
};
