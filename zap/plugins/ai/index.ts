import { registerPlugin, Plugin } from "..";

export const aiSdkPlugin: Plugin = {
  name: "ai",
  dependencies: ["ai", "@ai-sdk/react", "@ai-sdk/openai", "@ai-sdk/mistral"],
  setup: () => {
    console.log("AI Vercel SDK is now enabled!");
  },
};

registerPlugin(aiSdkPlugin);
