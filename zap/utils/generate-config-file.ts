import { writeFileSync } from "fs";
import { resolve } from "path";

export const generateConfigFile = async (selectedPlugins: string[]) => {
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
};
