---
applyTo: "**"
---

These rules define the structural and development standards for any project based on the Zap.ts stack. They exist to maintain consistency, reliability, and clarity across codebases.

## Project structure

Organize all logic under the `src/` directory, using the following layout:

- `actions/` — Server actions (e.g., `update-user.action.ts`)
- `app/` — Next.js app routes (pages, layouts, metadata)
- `components/` — Reusable UI components
  - `ui/` — Low-level primitives
  - `common/` — Feature-specific blocks
- `data/` — Static values, constants (UPPERCASE)
- `db/` — Drizzle ORM schemas and DB logic
- `hooks/` — Custom React hooks (`use-*`)
- `lib/` — Shared utilities (API clients, helpers)
- `providers/` — React context providers
- `rpc/` — oRPC type-safe procedures
- `stores/` — Zustand stores for app state
- `types/` — Global types and Zod schemas

## Naming conventions

| Type            | Pattern       | Example                 |
| --------------- | ------------- | ----------------------- |
| Hook            | `use-*.ts`    | `use-user-profile.ts`   |
| Component       | `*.tsx`       | `user-card.tsx`         |
| Mail Template   | `*.mail.tsx`  | `template.mail.tsx`     |
| Store           | `*.store.ts`  | `user.store.ts`         |
| Server Action   | `*.action.ts` | `update-user.action.ts` |
| DB Schema (SQL) | `*.sql.ts`    | `auth.sql.ts`           |
| Zod Schema      | `*.schema.ts` | `user.schema.ts`        |
| RPC Procedure   | `*.rpc.ts`    | `user.rpc.ts`           |
| Constants       | UPPERCASE     | `BASE_URL` in `data/`   |

## Type safety

- TypeScript is mandatory.
- All input/output validation must use Zod (`src/types/*.schema.ts`).
- Prefer Zustand over React Context.
- RPC must be type-safe with oRPC.

## State management

- Use Zustand (`src/stores/`) for local/global state.
- Middleware: Use `persist` where needed.
- Wrap access in custom hooks for clarity.

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
```

## Type-Safe API

- Define oRPC functions in `src/rpc/procedures/`.
- Register them in `src/rpc/router.ts`.
- Use SWR or custom hooks for fetching client-side.

```ts
import { useORPC } from "@/zap/stores/orpc.store";
import useSWR from "swr";

export const useUserProfile = () => {
  const orpc = useORPC();
  return useSWR(
    orpc.userProfile.key(),
    orpc.userProfile.queryOptions().queryFn,
  );
};
```

## Authentication

- Use the Better Auth package.
- Auth logic lives in `src/zap/lib/auth/server.ts`.
- Use server actions for login/session handling.

## Database

- Use Drizzle ORM with PostgreSQL.
- Define schemas in `src/db/schema/`.
- Re-export them via `src/db/schema/index.ts`.

```ts
import { z } from "zod";

export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
});
```

## Error handling

- Use [Effect](https://effect.website) for typed async flows.
- Avoid `try/catch`; prefer declarative error modeling.

## Environment Variables

- Store secrets in `.env`.
- Prefix project-specific variables with `MCP_`.

## PWA / SEO / Analytics

- Configure via `zap.config.ts`.
- Auto-generate PWA manifest from config.
- Use `next-sitemap` for SEO sitemaps.

## AI/LLM integration

- Use Vercel AI SDK for streaming responses.
- Store encrypted API keys in DB.
- Support OpenAI, Mistral, etc.
- Use type-safe settings via RPC.

```ts
const { isSaving, saveApiKey } = useAISettings();
await saveApiKey({ provider: "openai", model: "gpt-4o-mini", apiKey: "..." });

const { messages, input, handleSubmit } = useChat({
  api: "/api/ai/chat",
});
```

## Push notifications

- Use the browser Push API with service workers.
- Store subscriptions in DB.
- Use web-push for sending.

```ts
await webpush.sendNotification(
  subscription,
  JSON.stringify({
    title: "New message",
    body: "You have a new message",
  }),
);
```

## Email system

- Use Resend for transactional emails.
- Use React-based email templates.
- Implement rate limiting and tracking.
- Use Effect for errors.

```ts
await sendVerificationEmail({
  subject: "Verify your email",
  recipients: ["user@example.com"],
  url: "https://app.com/verify?token=abc123",
});
```

## Dependencies

- Respect versions from `package.json`.
- No implicit upgrades unless manually approved.
