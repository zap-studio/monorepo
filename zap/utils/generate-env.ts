import { writeFileSync } from "fs";
import { resolve } from "path";
import { plugins } from "../plugins-list";
import { generateBetterAuthSecret } from "./generate-better-auth-secret";
import { PluginNames } from "../schemas/plugins.schema";

const coreEnv = [
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "SITE_URL",
];

export const generateEnv = async (selectedPlugins: PluginNames) => {
  const pluginEnvVars = selectedPlugins
    .flatMap((name) => {
      const plugin = plugins.find((p) => p.name === name);
      return plugin?.env || [];
    })
    .filter((envVar, index, self) => self.indexOf(envVar) === index);

  const allEnvVars = [...coreEnv, ...pluginEnvVars].sort();

  const envContent = allEnvVars
    .map((envVar) => {
      if (envVar === "BETTER_AUTH_SECRET") {
        const betterAuthSecret = generateBetterAuthSecret();
        return `${envVar}="${betterAuthSecret}"`;
      }

      if (envVar === "DATABASE_URL") {
        return `${envVar}="postgresql://fake_user:fake_password@ep-example-database.us-west-1.aws.neon.tech/fake_db?sslmode=require"`;
      }

      if (envVar === "BETTER_AUTH_URL") {
        return `${envVar}="http://localhost:3000"`;
      }

      return `${envVar}="your_${envVar.toLowerCase()}_here"`;
    })
    .join("\n");
  writeFileSync(resolve(process.cwd(), ".env.local"), envContent);

  console.log("Generated .env.local with required environment variables");
};
