import { createFileRoute, notFound } from "@tanstack/react-router";
import { ChangelogContent } from "@/components/changelog/changelog-content";
import {
  getPackageChangelogBySlugFn,
  getReleasedPackageChangelogsFn,
} from "@/lib/changelog/changelog.functions";
import { pageMeta } from "@/lib/site";

export const Route = createFileRoute("/_marketing/changelogs/$package")({
  head: ({ params }) => ({
    meta: pageMeta(`${params.package} Changelogs`, `Release notes for ${params.package}.`),
  }),
  loader: async ({ params }) => {
    const [current, allPackages] = await Promise.all([
      getPackageChangelogBySlugFn({ data: { slug: params.package } }),
      getReleasedPackageChangelogsFn(),
    ]);

    if (!current) {
      throw notFound();
    }

    return { allPackages, current };
  },
  component: ChangelogPackageRoute,
});

function ChangelogPackageRoute() {
  const loaderData = Route.useLoaderData();
  if (!loaderData) {
    throw notFound();
  }

  const { allPackages, current } = loaderData;

  return <ChangelogContent allPackages={allPackages} current={current} />;
}
