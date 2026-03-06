import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getReleasedPackageChangelogs } from "@/lib/changelog";

export const metadata: Metadata = {
  title: "Changelogs — Zap Studio",
  description:
    "Browse changelogs for every released Zap Studio package in one place.",
};

export default async function ChangelogIndexPage(): Promise<never> {
  const changelogs = await getReleasedPackageChangelogs();
  const firstPackage = changelogs[0];

  if (!firstPackage) {
    notFound();
  }

  redirect(`/changelogs/${firstPackage.slug}`);
}
