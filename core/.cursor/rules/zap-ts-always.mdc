---
description: 
globs: 
alwaysApply: true
---
# Core Rules for Zap.ts apps/core

Adhere to Zap.ts’s philosophy, using Next.js, TypeScript, Drizzle ORM, oRPC, Zustand, and shadcn/ui.

## Configuration

The entry point and all configurations for Zap.ts are specified in [zap.config.ts](mdc:zap.config.ts).

## Rules

### Project Structure
- Organize code in `src`:
  - Server actions: `src/zap/actions/<feature>-<action>.action.ts` (e.g., `chat.action.ts`).
  - Next.js App Router: `src/app/` with:
    - `(api)/(auth-only)`: Authenticated APIs (e.g., `ai/chat/route.ts`).
    - `(api)/(public)`: Public APIs (e.g., `auth/[...all]/route.ts`).
    - `(pages)/(auth-only)`: Authenticated pages (e.g., `app/page.tsx`).
    - `(pages)/(public)`: Public pages (e.g., `(home)/page.tsx`).
  - Components:
    - `src/components/ui/`: shadcn/ui components (e.g., `Button.tsx`).
    - `src/components/common/`: General components (e.g., `ProfileCard.tsx`).
    - `src/zap/components/<feature>/`: Feature-specific (e.g., `chat/ChatWindow.tsx`).
  - Static data: `src/data/` (e.g., `settings.ts`).
  - Drizzle schemas: `src/zap/db/schema/<feature>.sql.ts` (e.g., `auth.sql.ts`).
  - Hooks: `src/zap/hooks/<feature>/use-<feature>.ts` (e.g., `chat/use-chat.ts`).
  - Utilities: `src/zap/lib/` (e.g., `utils.ts`).
  - Providers: `src/zap/providers/` for third-party context; prefer `src/zap/stores/`.
  - oRPC: `src/zap/rpc/procedures/<feature>.rpc.ts` and [router.ts](mdc:src/rpc/router.ts).
  - Schemas: `src/zap/schemas/<feature>.schema.ts` for Zod.
  - Stores: `src/zap/stores/<feature>.store.ts` (e.g., `chat.store.ts`).

### Naming Conventions
- Filenames: kebab-case (e.g., `user-card.tsx`, `use-chat.ts`).
- Zod schemas: PascalCase (e.g., `ChatSchema`).
- oRPC procedures: camelCase (e.g., `getMessages`).
- Data constants: UPPERCASE (e.g., `FEATURE_FLAGS`).
- Server actions: `<feature>-<action>.action.ts`.
- Hooks: `use-<feature>.ts`.
- Stores: `<feature>.store.ts`.
- Database schemas: `<feature>.sql.ts`.
- Components: PascalCase (e.g., `ChatWindow`).

### Type Safety
- Use TypeScript with `strict: true` per [tsconfig.json](mdc:tsconfig.json).
- Define Zod schemas in `src/zap/schemas/` for APIs (e.g., `@src/zap/schemas/user.schema.ts`).
- Use oRPC in `src/zap/rpc/procedures/` with schemas from `src/zap/schemas/`.
- Infer types from Drizzle schemas in `src/zap/db/schema/`.

### Performance and Simplicity
- Server actions in `src/zap/actions/` for one-off tasks.
- oRPC API routes in `src/app/(api)/` for reusable endpoints.
- Prefer Zustand stores in `src/zap/stores/` over `src/zap/providers/`.
- Use shadcn/ui in `src/components/ui/` for UI consistency.
- Minimize dependencies per `apps/core/bun.lock`.

### Tool Integration
- **Drizzle ORM**: Schemas in `src/zap/db/schema/`; use `drizzle-orm`.
- **oRPC**: Procedures in `src/zap/rpc/procedures/`; update `src/zap/rpc/router.ts`.
- **Zustand**: Stores in `src/zap/stores/`.
- **shadcn/ui**: Components in `src/components/ui/`.
- **better-auth**: Auth in `src/zap/lib/auth/`.
- **AI Vercel SDK**: AI in `src/zap/hooks/ai/` and `src/zap/actions/ai.action.ts`.
- **Tailwind CSS**: Styles in `src/globals.css` with `tailwind-merge`.
- **Posthog**: Analytics in `src/zap/components/analytics/` and `src/zap/lib/posthog/`.
- **Resend**: Emails in `src/zap/lib/resend/` and `src/zap/components/emails/`.

### Formatting and Linting
- Run `bun run format` with `.prettierrc`.
- Ensure ESLint compliance with [eslint.config.mjs](mdc:eslint.config.mjs) (`bun run lint`).

## Example of Directory Structure
```
apps/core/src/
├── app/
│   ├── (api)/(auth-only)/ai/chat/route.ts
│   ├── (api)/(public)/auth/[...all]/route.ts
│   ├── (pages)/(auth-only)/app/page.tsx
│   ├── (pages)/(public)/(home)/page.tsx
├── components/
│   ├── common/ProfileCard.tsx
│   ├── ui/Button.tsx
├── zap/
│   ├── actions/chat.action.ts
│   ├── components/chat/ChatWindow.tsx
│   ├── db/schema/auth.sql.ts
│   ├── hooks/chat/use-chat.ts
│   ├── lib/utils.ts
│   ├── providers/theme.provider.tsx
│   ├── rpc/procedures/chat.rpc.ts
│   ├── schemas/chat.schema.ts
│   ├── stores/chat.store.ts
├── data/settings.ts
├── globals.css
```

## Package.json

Ensure the correct dependency versions listed in [package.json](mdc:package.json) are used.