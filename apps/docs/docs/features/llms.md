# Large Language Models (LLMs)

Zap.ts makes it easy to add _AI-powered features_ to your app, with a focus on _flexibility_, _type safety_, and a great _developer experience_.

For that, Zap.ts strongly leverages the [Vercel AI SDK](https://sdk.vercel.ai) to simplify the integration of AI-powered chat and completion features.

The **SDK** provides a lightweight, React-friendly abstraction over streaming responses from large language models (LLMs).

## Overview

- **API key encryption:** API keys are always encrypted before being stored in the database, ensuring _security_ and _privacy_.
- **Multi-provider support:** Out of the box, Zap.ts supports [OpenAI](https://openai.com/) and [Mistral](https://mistral.ai/), with the ability to add more [providers](https://ai-sdk.dev/providers/ai-sdk-providers).
- **Settings persistence:** User AI settings are saved per-provider and automatically loaded.
- **Streaming responses:** Both completions and chat endpoints stream results for a responsive UI.
- **Type-safe:** All API routes and stores use Zod schemas and TypeScript for safety and autocompletion.
- **User-configurable:** Users can select their AI provider and manage API keys directly from the frontend.

## Architecture

The AI system in Zap.ts is split between the frontend and backend:

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

## Adding New Providers

To add a new AI provider:

1. **Extend the provider list:** Update `AI_PROVIDERS_OBJECT` with your new provider's details.

2. **Update the schema:** Add your provider to the `AIProviderIdSchema` enum.

3. **Add model support:** Add your provider's available models to `ModelsByProvider`.

4. **Handle model creation:** Update the `getModel` utility to support your new provider.

5. **Update UI:** The `AISettingsSheet` component will automatically include your new provider.

## Customizing Models

To customize or add models for a provider:

1. **Edit the models list:** Update the `ModelsByProvider` object with your desired model names.

2. **Set default model:** Change the default model for each provider in `DEFAULT_MODEL`.

3. **UI updates:** The settings panel will automatically reflect your changes.

## Advanced Features

For advanced features like RAG, tool calling, or custom workflows, see the [Vercel AI SDK documentation](https://ai-sdk.dev/docs/guides/rag-chatbot#what-is-rag).
