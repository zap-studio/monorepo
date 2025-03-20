import { PluginMetadata } from "../../schemas/plugins.schema";

export const aiPlugin: PluginMetadata = {
  name: "ai",
  dependencies: ["ai", "@ai-sdk/react", "@ai-sdk/openai", "@ai-sdk/mistral"],
  available: true,
  env: ["OPENAI_API_KEY", "MISTRAL_API_KEY"],
};
