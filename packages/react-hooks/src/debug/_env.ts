declare const process: { env?: { NODE_ENV?: string } } | undefined;

/**
 * Shared production-mode gate behind every `unstable/` hook. These hooks
 * are dev/debug tools, not runtime behavior consumers should depend on
 * shipping — they no-op once `process.env.NODE_ENV === "production"`,
 * matching React's own dev/prod gating convention. Bundlers typically
 * replace this expression at build time; `typeof process` is checked
 * first so unbundled ESM in a browser (where `process` doesn't exist at
 * all) safely falls through to `false` instead of throwing.
 */
export const isProductionBuild = (): boolean =>
  typeof process !== "undefined" && process?.env?.NODE_ENV === "production";
