import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ChangelogContent } from "@/app/changelogs/_components/changelog-content";
import { getReleasedPackageChangelogs } from "@/lib/changelog";

export const metadata: Metadata = {
  title: "Changelogs — Zap Studio",
  description:
    "Browse changelogs for every released Zap Studio package in one place.",
};

export default async function ChangelogIndexPage(): Promise<ReactNode> {
  const changelogs = await getReleasedPackageChangelogs();
  const firstPackage = changelogs[0];

  if (!firstPackage) {
    notFound();
  }

  return <ChangelogContent allPackages={changelogs} current={firstPackage} />;
}
