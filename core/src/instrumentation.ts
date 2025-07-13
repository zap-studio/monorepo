import "server-only";

export async function register() {
  await import("./zap/lib/orpc/server");
}
