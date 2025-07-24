import { resolve } from 'node:path';
import { Effect } from 'effect/index';
import type { Ora } from 'ora';
import { CORE_ENV } from '@/data/env';
import { generateSecret } from '@/utils/generation/generate-secret.js';
import { writeFileEffect } from '..';

function getEnvVarContent(envVar: string) {
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

  return Effect.succeed(content);
}

function getOptionalEnvVarContent(envVar: string) {
  return Effect.succeed(`${envVar}="your_${envVar.toLowerCase()}_here"`);
}

interface GenerateEnvOptions {
  outputDir: string;
  filename?: string;
  spinner?: Ora | null;
}

export function generateEnv({
  outputDir,
  filename = '.env',
  spinner,
}: GenerateEnvOptions) {
  const program = Effect.gen(function* () {
    const envContent = CORE_ENV.map((envVar) => getEnvVarContent(envVar)).join(
      '\n'
    );

    yield* writeFileEffect(resolve(outputDir, filename), envContent);

    spinner?.succeed('.env file generated.');
  });

  return program;
}
