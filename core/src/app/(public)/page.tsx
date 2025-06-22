import { cn } from "@/lib/utils";
import { AnimatedSection } from "@/zap/components/common/animated-section";
import { Footer } from "@/zap/components/common/footer";
import { Navbar } from "@/zap/components/common/header";
import { FaqSection } from "@/zap/components/landing/landing-faq";
import { FeaturesSection } from "@/zap/components/landing/landing-features";
import { HeroSection } from "@/zap/components/landing/landing-hero";
import { PricingSection } from "@/zap/components/landing/landing-pricing";
import { SolutionSection } from "@/zap/components/landing/landing-solution";
import { TestimonialSection } from "@/zap/components/landing/landing-testimonial";
import { client } from "@/zap/lib/orpc/client";

const SECTION_CLASSNAME = "w-full py-12 md:py-24 lg:py-32";
const SECTIONS = [
  {
    id: "hero",
    component: HeroSection,
    className:
      "h-[calc(100vh-4rem)] border-b bg-muted/50 flex items-center justify-center md:py-0 overflow-hidden min-h-[500px]",
  },
  {
    id: "solution",
    component: SolutionSection,
    className: `bg-muted/50 border-y ${SECTION_CLASSNAME}`,
  },
  {
    id: "testimonials",
    component: TestimonialSection,
    className: SECTION_CLASSNAME,
  },
  {
    id: "features",
    component: FeaturesSection,
    className: `bg-muted/50 border-y ${SECTION_CLASSNAME}`,
  },
  { id: "pricing", component: PricingSection, className: SECTION_CLASSNAME },
  {
    id: "faq",
    component: FaqSection,
    className: `bg-muted/50 border-t ${SECTION_CLASSNAME}`,
  },
];

export default async function LandingPage() {
  const [ratings, numberOfUsers] = await Promise.all([
    client.feedbacks.getAverageRating(),
    client.users.getNumberOfUsers(),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {SECTIONS.map(({ id, component: Component, className }, index) => (
          <AnimatedSection
            key={id}
            id={id}
            className={cn(className)}
            delay={index * 0.1}
          >
            <Component {...{ ratings, numberOfUsers }} />
          </AnimatedSection>
        ))}
      </main>
      <Footer />
    </div>
  );
}
