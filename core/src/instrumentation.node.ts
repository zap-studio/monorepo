import "server-only";

await import("./zap/lib/orpc/server"); // used to optimize SSR performance (see https://orpc.unnoq.com/docs/best-practices/optimize-ssr)
