import { createServerFn } from "@tanstack/react-start";
import {
  getPackageChangelogBySlug,
  getReleasedPackageChangelogs,
} from "@/lib/changelog/changelog.server";

export const getReleasedPackageChangelogsFn = createServerFn({ method: "GET" }).handler(() =>
  getReleasedPackageChangelogs(),
);

export const getPackageChangelogBySlugFn = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(({ data }) => getPackageChangelogBySlug(data.slug));
