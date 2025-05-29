# Getting Started

Welcome to Zap.ts! This page helps you learn how Zap.ts works and how to set it up for your project. It’s designed to make building apps fast and simple.

## Demo (in 5 minutes)

**Note**: This will be added soon.

## Project Structure

Before proceeding, ensure that Zap.ts is installed by following the instructions on the [installation](/docs/introduction/installation.md) page.

### Overview

Zap.ts wants you to focus on building your app’s features, not on boring setup tasks. This structure saves time. You don’t need to create everything from zero. It keeps your code neat so you can find things easily. It also provides a framework so you don't overthink too much about it.

Before getting started, read our [best practices](/docs/misc/best-practices.md) to learn more.

:::tip
You can keep what you like or get rid of what you don’t need. For instance, if you don’t want push notifications, you can remove them.
:::

## Environment Variables

Update `.env` with your own settings. Example:

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
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=your_posthog_host
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_auth_token
ENCRYPTION_KEY=your_encryption_key
```

These connect your app to services like the database or email. You can remove the ones you don't need.

:::warning
The above `.env` file serves as an example. You should only rely on the instance of Zap.ts that was present during its initial installation.
:::

## Configure the App

To get started, make sure to configure your app settings in:

```bash
zap.config.ts
```

This file defines environment-aware defaults, feature flags, and app behavior like:

- Auth requirements and redirect paths
- Whether to enable analytics with PostHog
- PWA settings (icons, theme, description)
- Email rate limiting and subject prefix

It’s fully customizable and acts as the core config hub for your app logic.

## Quick Scripts

Use these commands to run Zap.ts. Pick your favorite package manager:

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
