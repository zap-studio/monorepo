# Zap.ts ⚡ - The Lightning-Fast Next.js Boilerplate

Welcome to **Zap.ts** ⚡—a turbocharged, type-safe Next.js boilerplate designed to get your projects off the ground at lightning speed! Packed with modern tools and a sleek architecture, Zap.ts is your go-to foundation for building blazing-fast web applications.

## Why Zap.ts? ⚡

- **Speed**: Built with Bun and optimized for performance—launch faster than ever!
- **Type Safety**: Rock-solid TypeScript integration across the stack.
- **Modern Stack**: Cutting-edge tools like oRPC, Drizzle, and Vercel AI SDK.
- **Ready to Roll**: Pre-configured helpers and a clean structure to zap you straight to coding.

## Tech Stack ⚡

- **Next.js** with App Router - The backbone of your app, turbocharged.
- **oRPC** - Lightning-fast, type-safe API routes.
- **Better Auth** - Secure auth with email/password + GitHub OAuth out of the box.
- **Drizzle ORM** + **Neon Serverless PostgreSQL** - Database magic at warp speed.
- **Vercel AI SDK** - AI-powered features, seamlessly integrated.
- **Zustand** - Lightweight state management with a persisted AI store.
- **Zod** - Schema validation that’s fast and reliable.
- **React Email** + **Resend** - Send emails with style and speed.
- **Polar.sh** - Payments made simple (placeholder ready).
- **useSWR** - Data fetching that keeps up with your pace.
- **Tailwind CSS** - Styling that’s quick and beautiful.
- **Prettier** + Tailwind Plugin - Code formatting that’s clean as a whistle.

## Get Started ⚡

1. **Clone the Lightning**:

   ```bash
   git clone https://github.com/trotelalexandre/zap.ts zap-ts
   cd zap-ts
   ```

2. **Install at Warp Speed**:

   ```bash
   bun install
   ```

3. **Charge Up Your Environment**:
   Copy `.env.example` to `.env.local` and plug in your keys:

   ```
   DATABASE_URL=your_neon_database_url
   RESEND_API_KEY=your_resend_api_key
   POLAR_API_KEY=your_polar_api_key
   AUTH_SECRET=your_auth_secret
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   ```

4. **Zap the Database**:

   ```bash
   bun run db:migrate
   ```

5. **Launch in a Flash**:

   ```bash
   bun run dev
   ```

   Open `http://localhost:3000` and feel the speed!

## Architecture ⚡

Zap.ts is engineered for clarity and velocity:

- **Database**: Neon PostgreSQL + Drizzle ORM (`lib/db.ts`, `drizzle/`)—data at lightning speed.
- **Auth**: Better Auth with email/password + GitHub (`lib/auth.ts`, `lib/auth-client.ts`, `middleware.ts`)—secure and swift.
- **API**: oRPC for type-safe endpoints (`lib/orpc.ts`, `app/api/orpc/`)—API calls that zip.
- **State**: Zustand with a persisted AI store (`store/ai.ts`)—state management that doesn’t lag.
- **Emails**: React Email + Resend (`lib/email.ts`, `components/emails/`)—send messages in a flash (protected with admin role).
- **Payments**: Polar.sh placeholder (`lib/auth.ts`)—ready for your revenue stream and synced with Better Auth.
- **AI**: Vercel AI SDK with provider management (`lib/ai.ts`, `store/ai.ts`)—smart and fast.
- **Data Fetching**: useSWR (`hooks`)—fetch data at the speed of light.
- **Formatting**: Prettier + Tailwind plugin (`prettier.config.js`)—code that shines.

## Turbocharged Helpers ⚡

- **`lib/db.ts`**: Your Drizzle ORM instance, plugged into Neon (or whatever you want).
- **`lib/orpc.ts`**: oRPC router + client for lightning-fast APIs.
- **`lib/email.ts`**: Send emails with React Email and Resend in a snap.
- **`lib/ai.ts`**: Hook into Vercel AI SDK with your chosen provider.
- **`lib/hooks.ts`**: SWR hooks to fetch data at hyperspeed.
- **`store/ai.ts`**: Persisted Zustand store for AI provider keys—set it and forget it.

## Scripts ⚡

- `bun run dev` - Ignite the dev server.
- `bun run build` - Compile for production in a flash.
- `bun run start` - Launch the production app.
- `bun run lint` - Check your code with ESLint.
- `bun run format` - Beautify code with Prettier.
- `bun run db:push` - Push schema changes instantly.
- `bun run db:migrate` - Run migrations at top speed.
- `bun run db:generate` - Generate migrations in a blink.
- `bun run db:studio` - Open Drizzle Studio for a quick peek.
- `bun run db:pull` - Pull database schema with ease.

## Usage Examples ⚡

### Zap an API Call with oRPC + SWR

```typescript
import { useExample } from "@/hooks/use-example";

const { data } = useExample();
```

### Send a Lightning Email

```typescript
import { sendEmail } from "@/lib/email";
import WelcomeEmail from "@/emails/WelcomeEmail";

await sendEmail("Welcome!", ["user@example.com"]);
```

### Power Up AI Providers

```typescript
import { useAIProviderStore } from "@/store/ai";
import { getModel } from "@/lib/ai";

// It uses Zustand and you can add as many providers as you want
const { setAIProvider, setApiKey } = useAIProviderStore();
setAIProvider("openai");
setApiKey("openai", "your-openai-key");

// Get your AI model from server side (needs the provider and associated apiKey - pass them in the body)
const model = getModel("openai", "your-openai-key");
```

## TODO ⚡ - Hit the Ground Running!

To turbocharge your start with Zap.ts, search for `// TODO` comments scattered throughout the codebase! These handy markers highlight key spots where you can plug in your custom logic, configs, or integrations. Whether it’s hooking up Polar.sh payments, adding more Better Auth providers, or tweaking the AI setup—those `// TODO` tags are your launchpads to get zapping fast! Just grep the code, jump in, and watch your project take off like a bolt of lightning!

## Notes ⚡

- **Polar.sh**: Add payment routes/webhooks per their docs—charge up your revenue!
- **Better Auth**: Extend plugins in `lib/auth.ts` for more auth options.
- **SWR**: Built-in by default—swap to React Query if you prefer a different vibe.

## Built with Bun ⚡

Zap.ts runs on **Bun**, the blazing-fast JavaScript runtime, ensuring your dev experience is as quick as lightning.
