# Getting Started

Welcome to Zap.ts! This page helps you learn how Zap.ts works and how to set it up for your project. It’s designed to make building apps fast and simple.

## Demo (in 5 minutes)

**Note**: This will be added soon.

## Project Structure

Before proceeding, ensure that Zap.ts is installed by following the instructions on the [installation](/docs/introduction/installation.md) page.

### Overview

Zap.ts has many folders and files. Here’s a quick look at the main ones:

- `/src/app`: Where your app’s pages live (like `page.tsx` for the homepage).
- `/src/lib`: Tools and helper code (like `auth-server.ts` for login setup).
- `/src/db`: Database connection and tables (like `schema/auth.ts` for users).

### Key Folders

To learn more about the way we recommend you structure your code, see the [best practices](/docs/misc/best-practices) page. In the meantime, here is a quick overview.

- `/src/app`: Holds your app’s pages and routes. Example: `page.tsx` shows the homepage.
- `/src/lib`: Has reusable code. Example: `utils.ts` helps combine styles with `cn()`.
- `/src/db`: Connects to your database. Example: `index.ts` uses Neon for PostgreSQL.
- `/src/schemas`: Rules for checking data (like `ai.schema.ts` for AI settings).
- `/src/stores`: Manages app state (like `ai.store.ts` for AI provider choice).
- `/src/actions`: Server actions for tasks (like `emails.action.ts` to send emails).
- `/src/data`: Static data or flags (like `settings.ts` for app settings).
- `/src/features`: Code for specific features (like `push-notifications` for notifications).
- `/src/hooks`: Global reusable functions (like `use-mobile.ts` to check screen size).
- `/src/rpc`: API procedures (like `router.ts` for server calls).
- `/src/styles`: CSS stylesheets (like `animation.css` for animations).
- `/src/providers`: React providers (like `theme.provider.tsx` for dark mode).

### Why It’s Built This Way

Zap.ts wants you to focus on building your app’s features, not on boring setup tasks. This structure saves time. You don’t need to create everything from zero. It keeps your code neat so you can find things easily. It also provides a framework so you don't overthink too much about it.

### Flexibility

You can keep what you like or replace what you don’t need. For instance, if you don’t want push notifications, you can remove them.

## Environment Variables

Update `.env.local` with your own settings. Example:

```
DATABASE_URL=your_database_url
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
BETTER_AUTH_SECRET=your_better_auth_secret
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
POLAR_ACCESS_TOKEN=your_polar_access_token
POLAR_WEBHOOK_SECRET=your_polar_webhook_secret
RESEND_API_KEY=your_resend_api_key
SITE_URL=your_site_url
```

These connect your app to services like the database or email. You can remove the ones you don't need.

::: tip
You can use `DATABASE_URL` with any database you like, such as Supabase or your own PostgreSQL, instead of Neon.
:::

## Quick Scripts

Use these commands to run Zap.ts. Pick your package manager:

::: code-group

```bash [bun]
bun run dev          # Start the dev server fast
bun run build        # Build your app for production quickly
bun run start        # Run the production app
bun run lint         # Check your code with ESLint
bun run format       # Make your code pretty with Prettier
bun run db:push      # Update the database schema instantly
bun run db:migrate   # Apply database changes fast
bun run db:generate  # Create migration files in a flash
bun run db:studio    # Open Drizzle Studio to see your database
bun run db:pull      # Get the database schema easily
```

```bash [npm]
npm run dev          # Start the dev server fast
npm run build        # Build your app for production quickly
npm run start        # Run the production app
npm run lint         # Check your code with ESLint
npm run format       # Make your code pretty with Prettier
npm run db:push      # Update the database schema instantly
npm run db:migrate   # Apply database changes fast
npm run db:generate  # Create migration files in a flash
npm run db:studio    # Open Drizzle Studio to see your database
npm run db:pull      # Get the database schema easily
```

```bash [yarn]
yarn dev             # Start the dev server fast
yarn build           # Build your app for production quickly
yarn start           # Run the production app
yarn lint            # Check your code with ESLint
yarn format          # Make your code pretty with Prettier
yarn db:push         # Update the database schema instantly
yarn db:migrate      # Apply database changes fast
yarn db:generate     # Create migration files in a flash
yarn db:studio       # Open Drizzle Studio to see your database
yarn db:pull         # Get the database schema easily
```

```bash [pnpm]
pnpm dev             # Start the dev server fast
pnpm build           # Build your app for production quickly
pnpm start           # Run the production app
pnpm lint            # Check your code with ESLint
pnpm format          # Make your code pretty with Prettier
pnpm db:push         # Update the database schema instantly
pnpm db:migrate      # Apply database changes fast
pnpm db:generate     # Create migration files in a flash
pnpm db:studio       # Open Drizzle Studio to see your database
pnpm db:pull         # Get the database schema easily
```

:::

## Next Steps

### Build Something

Start making your app! Try adding a new page in `/src/app/` like `about.tsx`.

### Ask Questions

Need support? Ask the creator on [X (formerly Twitter)](https://www.x.com/alexandretrotel/).

Happy coding with Zap.ts! ⚡
