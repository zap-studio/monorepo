# Large Language Models (LLMs)

**Zap.ts** makes it easy to add _AI-powered features_ to your app, with a focus on _flexibility_, _type safety_, and a great _developer experience_.

For that, **Zap.ts** strongly leverages the [Vercel AI SDK](https://sdk.vercel.ai) to simplify the integration of AI-powered chat and completion features.

The **SDK** provides a lightweight, React-friendly abstraction over streaming responses from large language models (LLMs).

## Overview

- **API key encryption:** API keys are always encrypted before being stored in the database, ensuring _security_ and _privacy_.
- **Multi-provider support:** Out of the box, **Zap.ts** supports [OpenAI](https://openai.com/) and [Mistral](https://mistral.ai/), with the ability to add more [providers](https://ai-sdk.dev/providers/ai-sdk-providers).
- **Settings persistence:** User AI settings are saved per-provider and automatically loaded.
- **Streaming responses:** Both completions and chat endpoints stream results for a responsive UI.
- **Type-safe:** All API routes and stores use Zod schemas and TypeScript for safety and autocompletion.
- **User-configurable:** Users can select their AI provider and manage API keys directly from the frontend.

## Architecture

The AI system in **Zap.ts** is split between the frontend and backend:

### 1. Client-side: Provider Selection & API Key Management

- **Store:** The `useAISettings` hook manages the selected provider and API keys, with settings persisted in the database.
- **UI Components:** The `AISettingsSheet` component provides a complete settings interface.
- **Validation:** Real-time API key validation with provider-specific testing.

```ts
// Example: useAISettings hook
const { isSaving, isValidated, saveApiKey } = useAISettings();

const saveApiKey = async (values: AIFormValues) => {
  await Effect.runPromise(
    Effect.gen(function* (_) {
      yield* _(
        Effect.tryPromise({
          try: () => orpc.ai.saveOrUpdateAISettings.call(values),
          catch: () => {
            throw new Error("Failed to save API key");
          },
        })
      );
    })
  );
};
```

### 2. Backend: Streaming API Endpoints & Settings Management

- **Completions:** `/api/ai/completion` streams text completions for a prompt.
- **Chat:** `/api/ai/chat` streams chat-style responses for a conversation.
- **Settings:** RPC procedures for saving, retrieving, and testing AI settings.
- **Model Selection:** The `getModel` utility picks the right model instance based on the provider and API key.

All endpoints use **Zod schemas** to validate input and leverage the [Vercel AI SDK](https://ai-sdk.dev/docs/introduction) for streaming.

## Database Schema

AI settings are stored securely with encrypted API keys:

```sql
-- src/zap/db/schema/ai.sql.ts
export const userAISettings = pgTable("user_ai_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => user.id),
  provider: text("provider").notNull(), // e.g. "openai", "mistral"
  model: text("model").$type<ModelName>().notNull(), // e.g. "gpt-4o-mini"
  encryptedApiKey: jsonb("encrypted_api_key").$type<{
    iv: string;
    encrypted: string;
  }>().notNull(), // Encrypted API key
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

## How to use it in your app?

### 1. Configure AI Settings

Use the `AISettingsSheet` component to let users configure their AI provider:

```tsx
import { AISettingsSheet } from "@/zap/components/ai/ai-settings-panel";

export function SettingsPage() {
  const [aiSettingsOpen, setAiSettingsOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setAiSettingsOpen(true)}>
        Configure AI Settings
      </Button>

      <AISettingsSheet open={aiSettingsOpen} onOpenChange={setAiSettingsOpen} />
    </div>
  );
}
```

### 2. Send AI Requests

Use the [Vercel AI SDK](https://ai-sdk.dev/docs/ai-sdk-ui/overview) hooks to send requests:

```tsx
import { useChat } from "ai/react";

export function ChatComponent() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/ai/chat",
  });

  return (
    <form onSubmit={handleSubmit}>
      <input value={input} onChange={handleInputChange} />
      <button type="submit">Send</button>
    </form>
  );
}
```

### 3. Handle Streaming Responses

The AI endpoints automatically handle streaming for smooth user experience:

```tsx
import { useCompletion } from "ai/react";

export function CompletionComponent() {
  const { completion, input, handleInputChange, handleSubmit } = useCompletion({
    api: "/api/ai/completion",
  });

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
        <button type="submit">Complete</button>
      </form>
      <div>{completion}</div>
    </div>
  );
}
```

## Adding new providers

To add a new AI provider:

1. **Extend the provider list:** Update `AI_PROVIDERS_OBJECT` with your new provider's details.

2. **Update the schema:** Add your provider to the `AIProviderIdSchema` enum.

3. **Add model support:** Add your provider's available models to `ModelsByProvider`.

4. **Handle model creation:** Update the `getModel` utility to support your new provider.

5. **Update UI:** The `AISettingsSheet` component will automatically include your new provider.

## Customizing models

To customize or add models for a provider:

1. **Edit the models list:** Update the `ModelsByProvider` object with your desired model names.

2. **Set default model:** Change the default model for each provider in `DEFAULT_MODEL`.

3. **UI updates:** The settings panel will automatically reflect your changes.

## Advanced Features

For advanced features like RAG, tool calling, or custom workflows, see the [Vercel AI SDK documentation](https://ai-sdk.dev/docs/guides/rag-chatbot#what-is-rag).

## References

### `AIProviderIdSchema`

Defines the allowed provider IDs. Update this enum to add new providers.

```ts
// src/zap/schemas/ai.schema.ts
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

Maps each provider to its supported model names. Add or remove models here to control what's available in the UI.

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
// src/zap/lib/ai/get-model.ts
import { createOpenAI } from "@ai-sdk/openai";
import { createMistral } from "@ai-sdk/mistral";

export const getModel = (
  provider: AIProviderId,
  apiKey: string,
  modelName: ModelName
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

---

### Server Actions

```ts
// src/zap/actions/ai/
-get -
  ai -
  settings.action.ts -
  save -
  ai -
  settings.action.ts -
  save -
  or -
  update -
  ai -
  settings.action.ts -
  test -
  api -
  key.action.ts -
  update -
  ai -
  settings.action.ts -
  delete -api -
  key.action.ts;
```

---

### React Hooks

```ts
// src/zap/hooks/features/ai/
-use -
  ai -
  settings.ts -
  use -
  init -
  ai -
  settings.ts -
  use -
  ai -
  chat.ts -
  use -
  ai -
  completion.ts;
```

---

### UI Components

```tsx
// src/zap/components/ai/
-ai - settings - panel.tsx;
```

---

### RPC Procedures

```ts
// src/zap/rpc/procedures/
-ai.rpc.ts;
```
