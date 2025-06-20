# Feedback System

**Zap.ts** includes a comprehensive feedback system that allows users to provide ratings and detailed feedback about your application. This system is designed to be user-friendly, type-safe, and easily extensible.

## Overview

- **User Ratings:** 0-10 rating scale with visual feedback
- **Detailed Feedback:** Optional text descriptions for qualitative insights
- **One-time Submission:** Users can only submit feedback once per account
- **Type-safe:** Full TypeScript and Zod validation
- **Real-time UI:** Optimistic updates with rollback on error
- **Persistent Storage:** Feedback stored securely in PostgreSQL

## How it Works

The feedback system consists of several components working together:

### 1. Database Schema

Feedback is stored in a dedicated table with user associations:

```sql
-- src/zap/db/schema/feedback.sql.ts
export const feedback = pgTable("feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().unique().references(() => user.id),
  rating: integer("rating").notNull(),
  description: text("description"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});
```

### 2. Server Actions

Feedback submission is handled through type-safe server actions:

```ts
// src/zap/actions/feedbacks/submit-feedback.action.ts
export const submitFeedbackAction = async ({
  context,
  input,
}: {
  context: SubmitFeedbackContext;
  input: SubmitFeedbackInput;
}) => {
  return Effect.runPromise(
    Effect.gen(function* (_) {
      const userId = context.session.user.id;

      yield* _(
        Effect.tryPromise({
          try: () =>
            db
              .insert(feedbackTable)
              .values({
                userId,
                rating: input.rating,
                description: input.description || "",
                submittedAt: new Date(),
              })
              .execute(),
          catch: (e) => e,
        })
      );

      return { success: true };
    })
  );
};
```

### 3. React Hooks

Custom hooks provide a clean API for feedback functionality:

```ts
// src/zap/hooks/features/feedbacks/use-feedback.ts
export const useUserFeedback = () => {
  const orpc = useORPC();
  return useSWR(
    orpc.feedbacks.getUserFeedback.key(),
    orpc.feedbacks.getUserFeedback.queryOptions().queryFn
  );
};

export const useSubmitFeedback = (
  setIsExistingFeedback: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const orpc = useORPC();

  return useSWRMutation(orpc.feedbacks.submit.key(), giveFeedback, {
    optimisticData: (current) => ({ ...current, success: true }),
    rollbackOnError: true,
    revalidate: true,
    onSuccess: () => {
      setIsExistingFeedback(true);
      toast.success("Thank you for your feedback!");
    },
    onError: () => {
      setIsExistingFeedback(false);
      toast.error("Failed to submit feedback. Please try again.");
    },
  });
};
```

### 4. UI Components

The feedback dialog provides an intuitive interface:

```tsx
// src/zap/components/sidebar/sidebar-feedback-dialog.tsx
export function FeedbackDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { isExistingFeedback, setIsExistingFeedback } =
    useIsFeedbackSubmitted();
  const { trigger: submitFeedback, isMutating: isSubmitting } =
    useSubmitFeedback(setIsExistingFeedback);

  // Rating buttons with visual feedback
  const RatingButtons = () => {
    const rating = form.watch("rating");
    return (
      <div className="flex flex-wrap gap-2 pt-1">
        {Array.from({ length: 11 }, (_, i) => (
          <Button
            key={i}
            variant={i <= rating ? "default" : "outline"}
            onClick={() => form.setValue("rating", i)}
            disabled={isSubmitting || !!isExistingFeedback}
          >
            {i}
          </Button>
        ))}
      </div>
    );
  };

  // Form with rating and description fields
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Rating field */}
            {/* Description field */}
            {/* Submit button */}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

## Usage

### 1. Add Feedback Dialog to Your App

Include the feedback dialog in your sidebar or settings:

```tsx
import { FeedbackDialog } from "@/zap/components/sidebar/sidebar-feedback-dialog";

export function Sidebar() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setFeedbackOpen(true)}>Give Feedback</Button>

      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </div>
  );
}
```

### 2. Check if User Has Submitted Feedback

Use the hook to check feedback status:

```tsx
import { useIsFeedbackSubmitted } from "@/zap/hooks/features/feedbacks/use-feedback";

export function FeedbackButton() {
  const { isExistingFeedback } = useIsFeedbackSubmitted();

  if (isExistingFeedback) {
    return <div>Thank you for your feedback!</div>;
  }

  return <Button>Give Feedback</Button>;
}
```

### 3. Customize the Rating Scale

Modify the rating range by updating the component:

```tsx
// Change from 0-10 to 1-5 stars
{
  Array.from({ length: 5 }, (_, i) => (
    <Button
      key={i + 1}
      variant={i + 1 <= rating ? "default" : "outline"}
      onClick={() => form.setValue("rating", i + 1)}
    >
      ⭐
    </Button>
  ));
}
```

## Data Analysis

### Retrieving Feedback Data

Use the RPC procedures to analyze feedback:

```ts
// Get average rating
const averageRating = await orpc.feedbacks.getAverageRating.call();

// Get user's specific feedback
const userFeedback = await orpc.feedbacks.getUserFeedback.call();
```

### Feedback Schema

```ts
// src/zap/schemas/feedback.schema.ts
export const FeedbackSchema = z.object({
  rating: z.number().min(0).max(10),
  description: z.string().optional(),
});

export type FeedbackFormValues = z.infer<typeof FeedbackSchema>;
```

## References

### Database Schema

```ts
// src/zap/db/schema/feedback.sql.ts
export const feedback = pgTable("feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id),
  rating: integer("rating").notNull(),
  description: text("description"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});
```

### Server Actions

```ts
// src/zap/actions/feedbacks/
-submit -
  feedback.action.ts -
  get -
  user -
  feedback.action.ts -
  get -
  average -
  rating.action.ts;
```

### React Hooks

```ts
// src/zap/hooks/features/feedbacks/
-use - feedback.ts;
```

### UI Components

```tsx
// src/zap/components/sidebar/
-sidebar - feedback - dialog.tsx;
```

### RPC Procedures

```ts
// src/zap/rpc/procedures/
-feedbacks.rpc.ts;
```

````

## 3. Update AI/LLM Documentation

```markdown:apps/docs/docs/features/llms.md
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
- **Settings persistence:** User AI settings are saved per-provider and automatically loaded.

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
        }),
      );
    }),
  );
};
````

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

````

## 4. Update Cursor Rules

```markdown:core/.cursor/rules/zap-ts-core.mdc
---

# Zap.ts Architecture & Conventions

These rules define the structural and development standards for any project based on the Zap.ts stack.

They exist to maintain consistency, reliability, and clarity across codebases.

## 1. Project Structure

Organize all logic under the `src/` directory, using the following layout:

* `actions/` — Server actions (e.g., `update-user.action.ts`)
* `app/` — Next.js app routes (pages, layouts, metadata)
* `components/` — Reusable UI components

  * `ui/` — Low-level primitives
  * `common/` — Feature-specific blocks
* `data/` — Static values, constants (UPPERCASE)
* `db/` — Drizzle ORM schemas and DB logic
* `hooks/` — Custom React hooks (`use-*`)
* `lib/` — Shared utilities (API clients, helpers)
* `providers/` — React context providers
* `rpc/` — oRPC type-safe procedures
* `stores/` — Zustand stores for app state
* `types/` — Global types and Zod schemas

## 2. Naming Conventions

Use file names that reflect function and context:

| Type            | Pattern       | Example                 |
| --------------- | ------------- | ----------------------- |
| Hook            | `use-*.ts`    | `use-user-profile.ts`   |
| Component       | `*.tsx`       | `user-card.tsx`         |
| Store           | `*.store.ts`  | `user.store.ts`         |
| Server Action   | `*.action.ts` | `update-user.action.ts` |
| DB Schema (SQL) | `*.sql.ts`    | `auth.sql.ts`           |
| Zod Schema      | `*.schema.ts` | `user.schema.ts`        |
| RPC Procedure   | `*.rpc.ts`    | `user.rpc.ts`           |
| Constants       | Uppercase     | `BASE_URL` in `data/`   |

## 3. Type Safety

* TypeScript is mandatory.
* All input/output validation must use Zod (`src/types/*.schema.ts`).
* Prefer Zustand over React Context.
* RPC must be type-safe with oRPC.

## 4. State Management

* Use Zustand (`src/stores/`) for local/global state.
* Middleware: Use `persist` where needed.
* Wrap access in custom hooks for clarity.

```ts
import { create } from "zustand";

type UserState = {
  name: string;
  setName: (name: string) => void;
};

export const useUserStore = create<UserState>((set) => ({
  name: "",
  setName: (name) => set({ name }),
}));
````

## 5. Type-Safe API

- Define oRPC functions in `src/rpc/procedures/`.
- Register them in \[@rpc/router.ts].
- Use SWR or custom hooks for fetching client-side.

```ts
import { useORPC } from "@/zap/stores/orpc.store";
import useSWR from "swr";

export const useUserProfile = () => {
  const orpc = useORPC();
  return useSWR(
    orpc.userProfile.key(),
    orpc.userProfile.queryOptions().queryFn
  );
};
```

## 6. Authentication

- Use the Better Auth package.
- Place auth logic in \[@auth/].
- Use server actions for login/session handling.

## 7. Database

- Use Drizzle ORM with PostgreSQL.
- Define schemas in `src/db/schema/`.
- Re-export from \[@schema/index.ts].

```ts
import { z } from "zod";

export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
});
```

## 8. Error Handling

- Use [Effect](https://effect.website) for typed async flows and errors.
- Avoid try/catch; prefer declarative error modeling.

## 9. Environment Variables

- Store secrets/config in `.env`.
- Prefix anything MCP-specific with `MCP_`.

## 10. PWA / SEO / Analytics

- Configure all in \[@zap.config.ts].
- PWA manifest is generated from config.
- Use `next-sitemap` for automated SEO sitemap generation.

## 11. AI/LLM Integration

- Use Vercel AI SDK for streaming responses.
- Store encrypted API keys in database.
- Support multiple providers (OpenAI, Mistral).
- Use type-safe settings management with RPC.

```ts
// AI Settings Management
const { isSaving, saveApiKey } = useAISettings();
await saveApiKey({ provider: "openai", model: "gpt-4o-mini", apiKey: "..." });

// Streaming AI Responses
const { messages, input, handleSubmit } = useChat({
  api: "/api/ai/chat",
});
```

## 12. Feedback System

- Use one-time feedback submission per user.
- Store ratings (0-10) and optional descriptions.
- Implement optimistic updates with rollback.
- Use type-safe forms with Zod validation.

```ts
// Feedback Submission
const { trigger: submitFeedback } = useSubmitFeedback(setIsExistingFeedback);
await submitFeedback({ rating: 8, description: "Great app!" });
```

## 13. Push Notifications

- Use browser Push API with service workers.
- Store subscriptions in database with user associations.
- Implement VAPID key management.
- Use web-push library for server-side sending.

```ts
// Subscribe to notifications
const { subscribe } = usePushNotifications();
await subscribe();

// Send notification (server-side)
await webpush.sendNotification(
  subscription,
  JSON.stringify({
    title: "New message",
    body: "You have a new message",
  })
);
```

## 14. Email System

- Use Resend for transactional emails.
- Create React email templates.
- Implement rate limiting and tracking.
- Use Effect for error handling.

```ts
// Send verification email
await sendVerificationEmail({
  subject: "Verify your email",
  recipients: ["user@example.com"],
  url: "https://app.com/verify?token=abc123",
});
```

## 15. Dependencies

- Use correct versions and constraints from \[@package.json].
- Avoid implicit version upgrades unless explicitly updated.

## References

- @package.json: Project configuration, versions, conventions
- @zap.config.ts: Global PWA, SEO, analytics config
- @rpc/router.ts: RPC procedure registration
- @schema/index.ts: Central DB schema exports
- @auth/: Auth logic for Better Auth integration
- @zap/actions/ai/: AI settings and API management
- @zap/actions/feedbacks/: User feedback system
- @zap/actions/push-notifications/: Push notification management
- @zap/actions/emails/: Transactional email system

```

## Summary

I've analyzed the codebase and identified the key features that have been implemented but need documentation updates. Here's what I've prepared:

### **Documentation Updates:**

1. **Updated Overview.md** - Added comprehensive feature list showing all implemented capabilities
2. **Created Feedback System Documentation** - Complete guide for the user feedback system with ratings and descriptions
3. **Enhanced AI/LLM Documentation** - Updated with the complete implementation including settings management, encryption, and UI components
4. **Updated Cursor Rules** - Added sections for AI/LLM integration, feedback system, push notifications, and email system

### **Key Features Documented:**

- **AI/LLM Integration**: Multi-provider support, encrypted API keys, settings management, streaming responses
- **Feedback System**: 0-10 rating scale, one-time submission, optimistic updates, type-safe forms
- **Push Notifications**: Browser Push API, service workers, subscription management, VAPID keys
- **Email System**: Resend integration, React templates, rate limiting, verification emails
- **Enhanced Analytics**: PostHog integration with page view tracking

### **Architectural Patterns Documented:**

- Effect-based error handling
- Type-safe RPC procedures
- Zustand state management
- Zod validation schemas
- Drizzle ORM patterns
- React hooks for feature management

The documentation now accurately reflects the current state of the codebase and provides comprehensive guidance for developers using the Zap.ts stack.
```
