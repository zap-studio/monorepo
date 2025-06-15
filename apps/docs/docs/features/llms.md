# Large Language Models (LLMs)

**Zap.ts** makes it easy to add _AI-powered features_ to your app, with a focus on _flexibility_, _type safety_, and a great _developer experience_.

For that, **Zap.ts** strongly leverages the [Vercel AI SDK](https://sdk.vercel.ai) to simplify the integration of AI-powered chat and completion features.

The **SDK** provides a lightweight, React-friendly abstraction over streaming responses from large language models (LLMs).

## Overview

- **Multi-provider support:** Out of the box, **Zap.ts** supports [OpenAI](https://openai.com/) and [Mistral](https://mistral.ai/), with the ability to add more [providers](https://ai-sdk.dev/providers/ai-sdk-providers).
- **Streaming responses:** Both completions and chat endpoints stream results for a responsive UI.
- **User-configurable:** Users can select their AI provider and manage API keys directly from the frontend.
- **Type-safe:** All API routes and stores use Zod schemas and TypeScript for safety and autocompletion.
- **API key encryption:** API keys are always encrypted before being stored in the database, ensuring _security_ and _privacy_.

## How AI is integrated?

The AI system in **Zap.ts** is split between the frontend and backend:

### 1. Client-side: Provider Selection & API Key Management

- **Store:** The `useAIProviderStore` (Zustand) manages the selected provider and API keys, persisted in local storage.
- **Usage:** Users can pick a provider (e.g., OpenAI or Mistral) and enter their API key via the UI. The store exposes helpers to get/set providers and keys.

```ts
// Example: useAIProviderStore
const { aiProvider, apiKeys, setAIProvider, setApiKey } = useAIProviderStore();
```

### 2. Backend: Streaming API Endpoints

- **Completions:** `/api/ai/completion` streams text completions for a prompt.
- **Chat:** `/api/ai/chat` streams chat-style responses for a conversation.
- **Model Selection:** The `getModel` utility picks the right model instance based on the provider and API key.

All endpoints use **Zod schemas** to validate input and leverage the [Vercel AI SDK](https://ai-sdk.dev/docs/introduction) for streaming.

## How to use it in your app?

1. **Let users pick a provider and enter their API key:** Use the `useAIProviderStore` hook in your frontend to manage provider selection and API keys.

2. **Send requests to the AI endpoints:** Use [Vercel AI SDK](https://ai-sdk.dev/docs/ai-sdk-ui/overview) hooks such as `useChat` and `useCompletions` to request the endpoints.

3. **Handle streaming responses:** Use the [Vercel AI SDK](https://sdk.vercel.ai/docs/introduction) on the frontend to consume streamed responses for a smooth user experience.

## Adding new providers

To add a new AI provider:

1. **Extend the provider list:** Update `AI_PROVIDERS_OBJECT` with your new provider's details (e.g., `provider`, `name`, `needsApiKey`).

2. **Update the schema:** Add your provider to the `AIProviderIdSchema` enum.

3. **Add model support:** Add your provider's available models to `ModelsByProvider`.

4. **Handle model creation:** Update the `getModel` utility to support your new provider, using the correct SDK or API client.

5. **(Optional) UI:** If you want users to select the new provider or its models, update the frontend components.

## Customizing models

To customize or add models for a provider:

1. **Edit the models list:** Update the `ModelsByProvider` object with your desired model names for each provider.

2. **(Optional) UI:** If you want users to select the new model, update the frontend components logic.

3. **Default model:** Change the default model for each provider in `DEFAULT_MODEL`.

## Advanced Features

For advanced features like RAG, tool calling, or custom workflows, see the [Vercel AI SDK documentation](https://ai-sdk.dev/docs/guides/rag-chatbot#what-is-rag).

## References

### `AIProviderIdSchema`

Defines the allowed provider IDs. Update this enum to add new providers.

```ts
// src/zap/schemas/ai.schema.ts
import { z } from "zod/v4";

export const AIProviderIdSchema = z.enum(["openai", "mistral"]);
```

---

### `AI_PROVIDERS_OBJECT`

Lists all available AI providers, their display names, and whether they require an API key.

```ts
// src/zap/data/ai.ts
export const AI_PROVIDERS_OBJECT = [
  {
    provider: "openai",
    name: "OpenAI",
    needsApiKey: true,
  },
  {
    provider: "mistral",
    name: "Mistral AI",
    needsApiKey: true,
  },
];
```

---

### `ModelsByProvider`

Maps each provider to its supported model names. Add or remove models here to control what’s available in the UI.

```ts
// src/zap/data/ai.ts
export const ModelsByProvider = {
  openai: [
    "o1",
    "o1-mini",
    "o3-mini",
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-4-turbo",
    "gpt-4",
    "gpt-3.5-turbo",
  ],
  mistral: [
    "ministral-3b-latest",
    "ministral-8b-latest",
    "mistral-large-latest",
    "mistral-small-latest",
    "pixtral-large-latest",
    "open-mistral-7b",
    "open-mixtral-8x7b",
    "open-mixtral-8x22b",
  ],
};
```

---

### `DEFAULT_MODEL`

Sets the default model for each provider.

```ts
// src/zap/data/ai.ts
export const DEFAULT_MODEL = {
  openai: "gpt-4o-mini",
  mistral: "mistral-small-latest",
};
```

---

### `getModel` Utility

Returns the correct model instance for a given provider and API key. Extend this function to support new providers or custom logic.

```ts
// src/zap/lib/ai.ts
import { createOpenAI } from "@ai-sdk/openai";
import { createMistral } from "@ai-sdk/mistral";

export const getModel = (
  provider: AIProviderId,
  apiKey: string,
  modelName: ModelName,
) => {
  const openAI = createOpenAI({ apiKey });
  const mistral = createMistral({ apiKey });

  switch (provider) {
    case "openai":
      return openAI(modelName);
    case "mistral":
      return mistral(modelName);
    default:
      throw new Error(`Invalid provider: ${provider}`);
  }
};
```
