import type { Metadata } from "next";
import type { ReactNode } from "react";

import { CodeShowcaseSection } from "./_components/code-showcase-section";
import { CTASection } from "./_components/cta-section";
import { FooterSection } from "./_components/footer-section";
import { HeroSection } from "./_components/hero-section";
import { PackagesSection } from "./_components/packages-section";
import { PrinciplesSection } from "./_components/principles-section";
import { SocialProofSection } from "./_components/social-proof-section";

export const metadata: Metadata = {
  title: "Zap Studio — The higher layer for modern apps",
  description:
    "Framework-agnostic TypeScript packages for the features every app needs. Type-safe, tested, zero lock-in.",
};

export default function HomePage(): ReactNode {
  return (
    <main className="flex flex-1 flex-col">
      <HeroSection />
      <SocialProofSection />
      <PackagesSection />
      <PrinciplesSection />
      <CodeShowcaseSection />
      <CTASection />
      <FooterSection />
    </main>
  );
}
