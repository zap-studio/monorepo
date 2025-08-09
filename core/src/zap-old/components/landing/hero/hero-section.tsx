import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { ZapButton } from "@/components/zap-ui/button";
import { AnimatedSection } from "@/zap/components/common/animated-section";
import { AnimatedText } from "@/zap/components/landing/hero/animated-text";
import { Stats } from "@/zap/components/landing/hero/stats";

export function HeroSection() {
  return (
    <AnimatedSection isNotSection>
      <div className="flex w-full items-center justify-center px-4 pb-32 md:px-6 md:pb-48">
        <div className="mx-auto max-w-4xl space-y-4 text-center">
          <h1 className="text-foreground text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
            Ship <AnimatedText /> with Zap.ts ⚡️
          </h1>

          <p className="text-muted-foreground mx-auto max-w-[700px] md:text-xl">
            The ultimate Next.js boilerplate with everything you need to build
            production-ready applications in minutes, not months.
          </p>

          <div className="flex flex-col justify-center gap-2 min-[400px]:flex-row">
            <ZapButton asChild size="lg">
              <Link href="/register">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </ZapButton>

            <ZapButton asChild size="lg" variant="outline">
              <Link
                className="text-foreground"
                href="https://zap-ts.alexandretrotel.org"
                target="_blank"
              >
                View Documentation <ArrowUpRight className="h-4 w-4" />
              </Link>
            </ZapButton>
          </div>

          <Stats />
        </div>
      </div>
    </AnimatedSection>
  );
}
