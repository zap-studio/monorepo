import { resolve } from "node:path";
import fs from "fs-extra";
import type { Ora } from "ora";
import { CORE_ENV } from "@/data/env.js";
import { FileSystemError } from "@/lib/errors.js";
import { generateSecret } from "@/utils/commands/generate/env/generate-secret.js";

function getEnvVarContent(envVar: string) {
  let content: string;

  switch (envVar) {
    case "BETTER_AUTH_SECRET":
      content = `${envVar}="${generateSecret()}"`;
      break;

    case "DATABASE_URL":
      content = `${envVar}="postgresql://your_username:your_password@your_database_host/your_database_name?sslmode=require"`;
      break;

    case "DATABASE_URL_DEV":
      content = `${envVar}="postgresql://postgres:password@localhost:5432/zap_dev"`;
      break;

    case "BETTER_AUTH_URL":
      content = `${envVar}="http://localhost:3000"`;
      break;

    case "ENCRYPTION_KEY":
      content = `${envVar}="${generateSecret()}"`;
      break;

    case "ZAP_MAIL":
      content = `# ${envVar}="example@zap.ts"`;
      break;

    default:
      content = getOptionalEnvVarContent(envVar);
  }

  return content;
}

function getOptionalEnvVarContent(envVar: string): string {
  return `${envVar}="your_${envVar.toLowerCase()}_here"`;
}

type GenerateEnvOptions = {
  outputDir: string;
  filename?: string;
  spinner?: Ora | null;
};

export async function generateEnv({
  outputDir,
  filename = ".env",
  spinner,
}: GenerateEnvOptions): Promise<void> {
  try {
    const envContent = CORE_ENV.map((envVar) => getEnvVarContent(envVar)).join(
      "\n"
    );

    await fs.writeFile(resolve(outputDir, filename), envContent);
    spinner?.succeed(".env file generated.");
  } catch (error) {
    throw new FileSystemError(`Failed to generate env file: ${error}`);
  }
}
