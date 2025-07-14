import "server-only";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // This import supports only Node.js runtime.
    await import("./zap/lib/orpc/server");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    // This import supports only edge runtime.
  }
}
