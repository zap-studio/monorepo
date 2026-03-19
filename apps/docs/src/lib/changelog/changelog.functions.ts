import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import {
  getPackageChangelogBySlug,
  getReleasedPackageChangelogs,
} from "@/lib/changelog/changelog.server";

export const getReleasedPackageChangelogsFn = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .handler(() => getReleasedPackageChangelogs());

export const getPackageChangelogBySlugFn = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .middleware([staticFunctionMiddleware])
  .handler(({ data }) => getPackageChangelogBySlug(data.slug));
