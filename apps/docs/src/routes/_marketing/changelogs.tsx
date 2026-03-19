import { createFileRoute, notFound } from "@tanstack/react-router";
import { ChangelogContent } from "@/components/changelog/changelog-content";
import { getReleasedPackageChangelogsFn } from "@/lib/changelog/changelog.functions";
import { pageMeta } from "@/lib/site";

const description = "Browse changelogs for every released Zap Studio package in one place.";

export const Route = createFileRoute("/_marketing/changelogs")({
  head: () => ({
    meta: pageMeta("Changelogs", description),
  }),
  loader: () => getReleasedPackageChangelogsFn(),
  component: ChangelogsRoute,
});

function ChangelogsRoute() {
  const changelogs = Route.useLoaderData();
  const firstPackage = changelogs[0];

  if (!firstPackage) {
    throw notFound();
  }

  return <ChangelogContent allPackages={changelogs} current={firstPackage} />;
}
