import { createServerFn } from "@tanstack/react-start";
import { getGitHubStats } from "@/lib/github/github.server";

export const getGitHubStatsFn = createServerFn({ method: "GET" }).handler(() => getGitHubStats());
