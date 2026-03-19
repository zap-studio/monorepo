import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { getGitHubStats } from "@/lib/github/github.server";

export const getGitHubStatsFn = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .handler(() => getGitHubStats());
