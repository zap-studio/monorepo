import { Navbar } from "@/components/zap/public/navbar";
import { AnimatedSection } from "@/components/zap/public/animated";
import { TestimonialSection } from "@/components/zap/public/landing/testimonial";
import { PricingSection } from "@/components/zap/public/landing/pricing";
import { FaqSection } from "@/components/zap/public/landing/faq";
import Footer from "@/components/zap/public/footer";
import { HeroSection } from "@/components/zap/public/landing/hero";
import { ProblemSection } from "@/components/zap/public/landing/problem";
import { SolutionSection } from "@/components/zap/public/landing/solution";
import { FeaturesSection } from "@/components/zap/public/landing/features";

const sections = [
  {
    id: "hero",
    component: <HeroSection />,
    delay: 0,
    className:
      "md:h-screen border-b bg-muted/50 flex items-center justify-center py-32 md:py-0",
  },
  { id: "problem", component: <ProblemSection />, delay: 0.1 },
  {
    id: "solution",
    component: <SolutionSection />,
    delay: 0.2,
    className: "bg-muted/50 border-y",
  },
  { id: "testimonials", component: <TestimonialSection />, delay: 0.3 },
  {
    id: "features",
    component: <FeaturesSection />,
    delay: 0.4,
    className: "bg-muted/50 border-y",
  },
  { id: "pricing", component: <PricingSection />, delay: 0.6 },
  {
    id: "faq",
    component: <FaqSection />,
    delay: 0.7,
    className: "bg-muted/50 border-t",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {sections.map(({ id, component, delay, className = "" }) => (
          <AnimatedSection
            key={id}
            id={id}
            className={`w-full py-12 md:py-24 lg:py-32 ${className}`}
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
