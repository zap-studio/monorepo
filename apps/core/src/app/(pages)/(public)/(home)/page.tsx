import { Navbar } from "@/zap/components/external/navbar";
import { AnimatedSection } from "@/zap/components/external/animated";
import { TestimonialSection } from "@/zap/components/external/landing/testimonial";
import { PricingSection } from "@/zap/components/external/landing/pricing";
import { FaqSection } from "@/zap/components/external/landing/faq";
import Footer from "@/zap/components/external/footer";
import { HeroSection } from "@/zap/components/external/landing/hero";
import { SolutionSection } from "@/zap/components/external/landing/solution";
import { FeaturesSection } from "@/zap/components/external/landing/features";
import { cn } from "@/lib/utils";
import { createOrpcServer } from "@/zap/lib/orpc/server";
import { headers } from "next/headers";

const DELAY_INCREMENT = 0.1;
const sectionClassName = "w-full py-12 md:py-24 lg:py-32";

const sections = (
  ratings: {
    averageRating: number;
    totalFeedbacks: number;
  },
  numberOfUsers: number,
) => [
  {
    id: "hero",
    component: <HeroSection ratings={ratings} numberOfUsers={numberOfUsers} />,
    className:
      "h-[calc(100vh-4rem)] border-b bg-muted/50 flex items-center justify-center md:py-0 overflow-hidden min-h-[500px]",
  },
  {
    id: "solution",
    component: <SolutionSection />,
    className: `bg-muted/50 border-y ${sectionClassName}`,
  },
  {
    id: "testimonials",
    component: <TestimonialSection />,
    className: sectionClassName,
  },
  {
    id: "features",
    component: <FeaturesSection />,
    className: `bg-muted/50 border-y ${sectionClassName}`,
  },
  {
    id: "pricing",
    component: <PricingSection />,
    className: sectionClassName,
  },
  {
    id: "faq",
    component: <FaqSection />,
    className: `bg-muted/50 border-t ${sectionClassName}`,
  },
];

export default async function LandingPage() {
  const orpcServer = createOrpcServer(await headers());
  const ratings = await orpcServer.getAverageRating();
  const numberOfUsers = await orpcServer.getNumberOfUsers();

  const sectionData = sections(ratings, numberOfUsers);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {sectionData.map(({ id, component, className }, index) => (
          <AnimatedSection
            key={id}
            id={id}
            className={cn(className)}
            delay={index * DELAY_INCREMENT}
          >
            {component}
          </AnimatedSection>
        ))}
      </main>

      <Footer />
    </div>
  );
}
