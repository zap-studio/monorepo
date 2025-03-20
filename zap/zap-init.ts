import { getPromptAnswers } from "./utils/prompts";
import { alreadyInstalled } from "./utils/already-installed";
import { generateConfigFile } from "./utils/generate-config-file";
import { generateEnv } from "./utils/generate-env";
import { installDependencies } from "./utils/install-dependencies";

async function run() {
  alreadyInstalled();
  const { packageManager, selectedPlugins } = await getPromptAnswers();
  await generateConfigFile(selectedPlugins);
  await generateEnv(selectedPlugins);
  await installDependencies(packageManager, selectedPlugins);
}

run().catch((err) => {
  console.error("Error during zap initialization:", err);
  process.exit(1);
});
