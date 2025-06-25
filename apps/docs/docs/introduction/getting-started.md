# Getting Started

## Demo (in 5 minutes)

**Note**: This will be added soon.

## Project structure

Before proceeding, ensure that **Zap.ts** is installed by following the instructions on the [installation](/docs/introduction/installation.md) page and make sure to read our [best practices](/docs/misc/best-practices.md) to learn more about **Zap.ts**' philosophy.

Since **Zap.ts** is _simply_ a **Next.js** starter kit, you own your code; therefore can keep what you like and get rid of things you don’t need.

## Environment variables

The `.env` file connects your app to services like the database or email provider. You can remove the ones you don't need.

Update it with your own settings. Example:

```
BETTER_AUTH_SECRET=your_better_auth_secret
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=your_database_url
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
POLAR_ACCESS_TOKEN=your_polar_access_token
POLAR_WEBHOOK_SECRET=your_polar_webhook_secret
RESEND_API_KEY=your_resend_api_key
```

Also, don’t forget to configure your environment variables in your **Zap.ts** deployment environment.

:::warning
The above `.env` file serves as an example. You should only rely on the instance of **Zap.ts** that was present during its initial installation.
:::

## Configure the app

To get started, make sure to complete all the required steps in the below file — this is your single source of configuration, designed to simplify setup and ensure you don’t miss anything important.

```bash
zap.config.ts
```

This file defines environment-aware defaults, feature flags, and app behavior like:

- Auth requirements and redirect paths
- Email rate limiting and subject prefix
- PWA settings (icons, theme, description)
- Whether to enable analytics with PostHog

It’s fully customizable and acts as the core config hub for your app logic.

## Quick scripts

Use these commands to run Zap.ts. Pick your favorite package manager:

::: code-group

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

:::

:::warning
This list of commands may not be exhaustive and can change over time as Zap.ts evolves. Always check your local package.json for the most up-to-date command list.
:::


## Command-Line Interface (CLI)

The `create-zap-app` CLI is a tool for _quickly_ setting up a **Zap.ts** project or adding procedures to an existing one.

Also, you should note that more features will be added from time to time. You can run `create-zap-app --help` to check the latest CLI available commands.

But in the meantime, here is a _concise_ overview of what the CLI does when installing your project.

#### Creating a new project

Running `create-zap-app` without arguments sets up a new Zap.ts project.

The following steps are done to install the project:

1. Asks for a name (default: `my-zap-app`) and ensuring everything is okay.
2. Lets you choose your _favorite_ package manager (e.g. `npm`, `yarn`, `pnpm`, or `bun`).
3. Fetches the Zap.ts template from GitHub and extracts it.
4. Installs dependencies using the selected package manager.
5. Creates an `.env.local` file with placeholders.
