import { writeFileSync } from "fs";
import { resolve } from "path";
import { plugins } from "../plugins-list";

const coreEnv = [
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
];

export const generateEnv = async (selectedPlugins: string[]) => {
  const pluginEnvVars = selectedPlugins
    .flatMap((name) => {
      const plugin = plugins.find((p) => p.name === name);
      return plugin?.env || [];
    })
    .filter((envVar, index, self) => self.indexOf(envVar) === index);

  const allEnvVars = [...coreEnv, ...pluginEnvVars].sort();

  const envContent = allEnvVars
    .map((envVar) => `${envVar}=your_${envVar.toLowerCase()}_here`)
    .join("\n");
  writeFileSync(resolve(process.cwd(), ".env.local"), envContent);
  console.log("Generated .env.local with required environment variables");
};
