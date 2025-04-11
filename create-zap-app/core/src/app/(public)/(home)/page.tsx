import { Navbar } from "@/components/zap/public/navbar";
import { AnimatedSection } from "@/components/zap/public/animated";
import { TestimonialSection } from "@/components/zap/public/landing/testimonial";
import { PricingSection } from "@/components/zap/public/landing/pricing";
import { FaqSection } from "@/components/zap/public/landing/faq";
import Footer from "@/components/zap/public/footer";
import { HeroSection } from "@/components/zap/public/landing/hero";
import { SolutionSection } from "@/components/zap/public/landing/solution";
import { FeaturesSection } from "@/components/zap/public/landing/features";
import { orpcServer } from "@/lib/orpc-server";
import { cn } from "@/lib/utils";

export default async function LandingPage() {
  const ratings = await orpcServer.feedback.getAverageRating();
  const numberOfUsers = await orpcServer.users.getNumberOfUsers();

  const sections = [
    {
      id: "hero",
      component: (
        <HeroSection ratings={ratings} numberOfUsers={numberOfUsers} />
      ),
      delay: 0,
      className:
        "md:h-screen border-b bg-muted/50 flex items-center justify-center  md:py-0",
    },
    {
      id: "solution",
      component: <SolutionSection />,
      delay: 0.1,
      className: "bg-muted/50 border-y",
    },
    { id: "testimonials", component: <TestimonialSection />, delay: 0.2 },
    {
      id: "features",
      component: <FeaturesSection />,
      delay: 0.3,
      className: "bg-muted/50 border-y",
    },
    { id: "pricing", component: <PricingSection />, delay: 0.4 },
    {
      id: "faq",
      component: <FaqSection />,
      delay: 0.5,
      className: "bg-muted/50 border-t",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {sections.map(({ id, component, delay, className = "" }) => (
          <AnimatedSection
            key={id}
            id={id}
            className={cn(
              id !== "hero" && `w-full py-12 md:py-24 lg:py-32`,
              className,
            )}
            delay={delay}
          >
            {component}
          </AnimatedSection>
        ))}
      </main>

      <Footer />
    </div>
  );
}
