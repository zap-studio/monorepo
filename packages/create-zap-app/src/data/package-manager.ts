export const LOCKFILES = [
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "bun.lockb",
  "bun.lock",
] as const;

export const PACKAGE_MANAGERS = ["npm", "yarn", "pnpm", "bun"] as const;
