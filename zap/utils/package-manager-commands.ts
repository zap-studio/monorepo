export const packageManagerCommands: Record<
  string,
  { add: string; remove: string; install: string }
> = {
  bun: { add: "bun add", remove: "bun remove", install: "bun install" },
  npm: { add: "npm install", remove: "npm uninstall", install: "npm install" },
  yarn: { add: "yarn add", remove: "yarn remove", install: "yarn install" },
  pnpm: { add: "pnpm add", remove: "pnpm remove", install: "pnpm install" },
};
