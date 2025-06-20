import { cn } from "@/lib/utils";
import { AnimatedSection } from "@/zap/components/common/animated";
import { Footer } from "@/zap/components/common/footer";
import { Navbar } from "@/zap/components/common/navbar";
import { FaqSection } from "@/zap/components/landing/landing-faq";
import { FeaturesSection } from "@/zap/components/landing/landing-features";
import { HeroSection } from "@/zap/components/landing/landing-hero";
import { PricingSection } from "@/zap/components/landing/landing-pricing";
import { SolutionSection } from "@/zap/components/landing/landing-solution";
import { TestimonialSection } from "@/zap/components/landing/landing-testimonial";
import { client } from "@/zap/lib/orpc/client";

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
  const ratings = await client.feedbacks.getAverageRating();
  const numberOfUsers = await client.users.getNumberOfUsers();

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
