import { createFileRoute } from "@tanstack/react-router";
import { CodeShowcaseSection } from "@/routes/_marketing/-components/code-showcase-section";
import { CTASection } from "@/routes/_marketing/-components/cta-section";
import { HeroSection } from "@/routes/_marketing/-components/hero-section";
import { PackagesSection } from "@/routes/_marketing/-components/packages-section";
import { PrinciplesSection } from "@/routes/_marketing/-components/principles-section";
import { SocialProofSection } from "@/routes/_marketing/-components/social-proof-section";
import { getGitHubStatsFn } from "@/lib/github/github.functions";
import { pageMeta } from "@/lib/site";

const homeDescription =
  "Framework-agnostic TypeScript packages for the features every app needs. Type-safe, tested, zero lock-in.";

export const Route = createFileRoute("/_marketing/")({
  head: () => ({
    meta: pageMeta(undefined, homeDescription),
  }),
  loader: () => getGitHubStatsFn(),
  component: IndexRoute,
});

function IndexRoute() {
  const stats = Route.useLoaderData();

  return (
    <main className="flex flex-1 flex-col">
      <HeroSection />
      <SocialProofSection stats={stats} />
      <PackagesSection />
      <PrinciplesSection />
      <CodeShowcaseSection />
      <CTASection />
    </main>
  );
}
