import { createFileRoute } from "@tanstack/react-router";

import { pageMeta } from "@/lib/site";
import { HeroSection } from "@/routes/_marketing/-components/hero-section";

const homeDescription =
  "Framework-agnostic TypeScript packages for the features every app needs. Type-safe, tested, zero lock-in.";

export const Route = createFileRoute("/_marketing/")({
  head: () => ({
    meta: pageMeta(undefined, homeDescription),
  }),
  component: IndexRoute,
});

function IndexRoute() {
  return (
    <main className="flex flex-1 flex-col">
      <HeroSection />
    </main>
  );
}
