import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { generateSecret } from '@/utils/generation/generate-secret.js';

const CORE_ENV = [
  'BETTER_AUTH_SECRET',
  'BETTER_AUTH_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'SITE_URL',
  'DATABASE_URL',
  'DATABASE_URL_DEV',
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
 * Get the environment variable content with optional template formatting
 * This function provides default values for required environment variables.
 * It formats the content based on whether the file is a template or not.
 *
 * @param envVar - The name of the environment variable
 * @returns The formatted content for the environment variable
 */
function getEnvVarContent(envVar: string): string {
  let content: string;

  switch (envVar) {
    case 'BETTER_AUTH_SECRET':
      content = `${envVar}="${generateSecret()}"`;
      break;

    case 'DATABASE_URL':
      content = `${envVar}="postgresql://your_username:your_password@your_database_host/your_database_name?sslmode=require"`;
      break;

    case 'DATABASE_URL_DEV':
      content = `${envVar}="postgresql://postgres:password@localhost:5432/zap_dev"`;
      break;

    case 'BETTER_AUTH_URL':
      content = `${envVar}="http://localhost:3000"`;
      break;

    case 'ENCRYPTION_KEY':
      content = `${envVar}="${generateSecret()}"`;
      break;

    case 'ZAP_MAIL':
      content = `# ${envVar}="example@zap.ts"`;
      break;

    default:
      return getOptionalEnvVarContent(envVar);
  }

  return content;
}

/**
 * Get optional environment variable content with template formatting
 * This function provides default values for optional environment variables.
 * It formats the content based on whether the file is a template or not.
 *
 * @param envVar - The name of the environment variable
 * @returns The formatted content for the environment variable
 */
function getOptionalEnvVarContent(envVar: string): string {
  return `${envVar}="your_${envVar.toLowerCase()}_here"`;
}

/**
 * Generates an environment file with required environment variables.
 *
 * This function collects core environment variables and generates an environment file with placeholders
 * or appropriate values, such as:
 * - A securely generated `BETTER_AUTH_SECRET`
 * - A sample `DATABASE_URL`
 * - A default `BETTER_AUTH_URL`
 *
 * @param outputDir - The output directory where the environment file will be written.
 * @param filename - The name of the environment file (default: '.env').
 *
 * A promise that resolves when the environment file is written.
 *
 * @example
 * ```ts
 * // Generate a regular .env file
 * await generateEnv("./project");
 *
 * // Generate a template file
 * await generateEnv("./project", ".env.template", true);
 * ```
 */
export async function generateEnv(
  outputDir: string,
  filename = '.env'
): Promise<void> {
  const envContent = CORE_ENV.map((envVar) => getEnvVarContent(envVar)).join(
    '\n'
  );

  await writeFile(resolve(outputDir, filename), envContent);
}
