import { writeFileSync } from "fs";
import { resolve } from "path";
import prompts from "prompts";
import { execSync } from "child_process";
import { plugins } from "./plugins-list";

// map package managers to their install/remove commands
const packageManagerCommands: Record<string, { add: string; remove: string }> =
  {
    bun: { add: "bun add", remove: "bun remove" },
    npm: { add: "npm install", remove: "npm uninstall" },
    yarn: { add: "yarn add", remove: "yarn remove" },
    pnpm: { add: "pnpm add", remove: "pnpm remove" },
  };

async function run() {
  // detect package manager
  let packageManager;
  if (!packageManager) {
    const response = await prompts({
      type: "select",
      name: "packageManager",
      message: "Could not detect package manager. Please choose one:",
      choices: [
        { title: "bun", value: "bun" },
        { title: "npm", value: "npm" },
        { title: "yarn", value: "yarn" },
        { title: "pnpm", value: "pnpm" },
      ],
    });
    packageManager = response.packageManager;
  }

  console.log(`Using package manager: ${packageManager}`);

  // prompt for plugin selection
  const response = await prompts([
    {
      type: "select",
      name: "orm",
      message: "Choose an ORM (required):",
      choices: [
        { title: "Drizzle", value: "drizzle" },
        { title: "Prisma", value: "prisma" },
      ],
    },
    {
      type: "multiselect",
      name: "optionalPlugins",
      message: "Select optional plugins:",
      choices: plugins
        .filter((p) => !p.category || p.category !== "orm")
        .map((p) => ({ title: p.name, value: p.name })),
    },
  ]);

  const selectedPlugins = [response.orm, ...response.optionalPlugins];

  // generate zap.config.ts
  const imports = selectedPlugins
    .map((name) => `import { ${name}Plugin } from "@/plugins/${name}";`)
    .join("\n");
  const enabledPlugins = selectedPlugins
    .map((name) => `${name}Plugin`)
    .join(", ");
  const configContent = `
    import { setupPlugins } from "@/plugins";
    ${imports}
  
    const enabledPlugins = [${enabledPlugins}];
    setupPlugins();
    `;
  writeFileSync(resolve(process.cwd(), "zap.config.ts"), configContent);
  console.log("Generated zap.config.ts");

  // install dependencies for selected plugins
  const dependencies = selectedPlugins
    .flatMap((name) => {
      const plugin = plugins.find((p) => p.name === name);
      return plugin?.dependencies || [];
    })
    .filter((dep, index, self) => self.indexOf(dep) === index); // remove duplicates

  // get all optional dependencies
  const allOptionalDeps = plugins
    .flatMap((p) => p.dependencies || [])
    .filter((dep, index, self) => self.indexOf(dep) === index);

  // determine unused optional dependencies
  const unusedDeps = allOptionalDeps.filter(
    (dep) => !dependencies.includes(dep),
  );

  // install selected dependencies
  if (dependencies.length > 0) {
    console.log("Installing dependencies:", dependencies.join(" "));
    const installCommand = packageManagerCommands[packageManager].add;
    execSync(`${installCommand} ${dependencies.join(" ")}`, {
      stdio: "inherit",
    });
  }

  // remove unused optional dependencies
  if (unusedDeps.length > 0) {
    console.log("Removing unused optional dependencies:", unusedDeps.join(" "));
    const removeCommand = packageManagerCommands[packageManager].remove;
    execSync(`${removeCommand} ${unusedDeps.join(" ")}`, { stdio: "inherit" });
  }

  // update app/layout.tsx to include plugin setup
  const layoutContent = `
    import { betterAuth } from "better-auth";
    import { setupPlugins } from "@/zap.config";
    ${selectedPlugins.includes("pwa") ? 'import { registerPWA } from "@/plugins/pwa/lib/register-pwa";' : ""}
  
    betterAuth.init();
    setupPlugins();
    ${selectedPlugins.includes("pwa") ? "registerPWA();" : ""}
  
    export default function RootLayout({ children }) {
      return (
        <html lang="en">
          <head>
            ${selectedPlugins.includes("pwa") ? '<link rel="manifest" href="/manifest.ts" />' : ""}
          </head>
          <body>{children}</body>
        </html>
      );
    }
    `;
  writeFileSync(resolve(process.cwd(), "src/app/layout.tsx"), layoutContent);
  console.log("Updated app/layout.tsx");
}

run().catch((err) => {
  console.error("Error during zap:init:", err);
  process.exit(1);
});
