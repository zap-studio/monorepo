import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { generateSecret } from './generate-secret.js';

const coreEnv = [
  'BETTER_AUTH_SECRET',
  'BETTER_AUTH_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'SITE_URL',
  'DATABASE_URL',
  'RESEND_API_KEY',
  'NEXT_PUBLIC_VAPID_PUBLIC_KEY',
  'VAPID_PRIVATE_KEY',
  'POLAR_ACCESS_TOKEN',
  'POLAR_WEBHOOK_SECRET',
  'NEXT_PUBLIC_POSTHOG_KEY',
  'NEXT_PUBLIC_POSTHOG_HOST',
  'ENCRYPTION_KEY',
  'MCP_GITHUB_PERSONAL_ACCESS_TOKEN',
  'MCP_POSTHOG_AUTH_HEADER',
  'MCP_SUPABASE_ACCESS_TOKEN',
  'MCP_MAGIC_API_KEY',
  'MCP_FIRECRAWL_API_KEY',
  'MCP_NOTION_API_HEADERS',
  'MCP_PERPLEXITY_API_KEY',
  'MCP_ELEVENLABS_API_KEY',
  'MCP_SENTRY_ACCESS_TOKEN',
  'MCP_SENTRY_HOST',
  'ZAP_MAIL',
];

/**
 * Generates an `.env.local` file with required environment variables.
 *
 * This function collects core environment variables and additional variables
 * from the selected plugins. It then generates an `.env.local` file with placeholders
 * or appropriate values, such as:
 * - A securely generated `BETTER_AUTH_SECRET`
 * - A sample `DATABASE_URL`
 * - A default `BETTER_AUTH_URL`
 *
 * @param {string} outputDir - The output directory where the `.env.local` file will be written.
 *
 * A promise that resolves when the `.env.local` file is written.
 *
 * @example
 * ```ts
 * await generateEnv(["pluginA", "pluginB"]);
 * // Generates an .env.local file with required env variables.
 * ```
 */
export async function generateEnv(outputDir: string): Promise<void> {
  const envContent = coreEnv
    .map((envVar) => {
      switch (envVar) {
        case 'BETTER_AUTH_SECRET':
          return `${envVar}="${generateSecret()}"`;

        case 'DATABASE_URL':
          return `${envVar}="postgresql://fake_user:fake_password@ep-example-database.us-west-1.aws.neon.tech/fake_db?sslmode=require"`;

        case 'BETTER_AUTH_URL':
          return `${envVar}="http://localhost:3000"`;

        case 'MCP_NOTION_API_HEADERS':
          return `${envVar}='{"Authorization": "Bearer ntn_your_token"}'`;

        case 'ENCRYPTION_KEY':
          return `${envVar}="${generateSecret()}"`;

        case 'ZAP_MAIL':
          return `${envVar}="example@zap.ts"`;

        default:
          return `${envVar}="your_${envVar.toLowerCase()}_here"`;
      }
    })
    .join('\n');

  await writeFile(resolve(outputDir, '.env'), envContent);
}
