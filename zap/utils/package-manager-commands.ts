export const packageManagerCommands: Record<
  string,
  { add: string; remove: string }
> = {
  bun: { add: "bun add", remove: "bun remove" },
  npm: { add: "npm install", remove: "npm uninstall" },
  yarn: { add: "yarn add", remove: "yarn remove" },
  pnpm: { add: "pnpm add", remove: "pnpm remove" },
};
