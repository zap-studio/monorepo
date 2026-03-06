import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ChangelogContent } from "@/app/changelogs/_components/changelog-content";
import {
  getPackageChangelogBySlug,
  getReleasedPackageChangelogs,
} from "@/lib/changelog";

export default async function PackageChangelogPage({
  params,
}: PageProps<"/changelogs/[package]">): Promise<ReactNode> {
  const { package: packageSlug } = await params;
  const [current, allPackages] = await Promise.all([
    getPackageChangelogBySlug(packageSlug),
    getReleasedPackageChangelogs(),
  ]);

  if (!current) {
    notFound();
  }

  return <ChangelogContent allPackages={allPackages} current={current} />;
}

export async function generateStaticParams(): Promise<{ package: string }[]> {
  const changelogs = await getReleasedPackageChangelogs();
  return changelogs.map((entry) => ({ package: entry.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/changelogs/[package]">): Promise<Metadata> {
  const { package: packageSlug } = await params;
  const packageChangelog = await getPackageChangelogBySlug(packageSlug);

  if (!packageChangelog) {
    notFound();
  }

  return {
    title: `${packageChangelog.packageName} Changelogs`,
    description: `Release notes for ${packageChangelog.packageName}.`,
  };
}
