import type { ReactNode } from "react";

import { CodeShowcaseSection } from "./_components/code-showcase-section";
import { CTASection } from "./_components/cta-section";
import { FooterSection } from "./_components/footer-section";
import { HeroSection } from "./_components/hero-section";
import { PackagesSection } from "./_components/packages-section";
import { PrinciplesSection } from "./_components/principles-section";
import { SocialProofSection } from "./_components/social-proof-section";

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
