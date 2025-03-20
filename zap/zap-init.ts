import { getPromptAnswers } from "./utils/prompts";
import { alreadyInstalled } from "./utils/already-installed";
import { generateEnv } from "./utils/generate-env";
import { installDependencies } from "./utils/install-dependencies";
import { togglePluginCodeBlocks } from "./utils/toggle-plugin-code-blocks";

// TODO - remove vercel analytics and speed insights if the user doesn't want them (and tacke other TODO)

async function run() {
  alreadyInstalled();
  const { packageManager, selectedPlugins } = await getPromptAnswers();
  await generateEnv(selectedPlugins);
  await installDependencies(packageManager, selectedPlugins);
  togglePluginCodeBlocks(selectedPlugins);
}

run().catch((err) => {
  console.error("Error during zap initialization:", err);
  process.exit(1);
});
