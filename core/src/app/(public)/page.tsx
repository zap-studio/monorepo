import { Footer } from "@/zap/components/common/footer";
import { Navbar } from "@/zap/components/common/header";
import { FaqSection } from "@/zap/components/landing/faq/faq-section";
import { FeaturesSection } from "@/zap/components/landing/features/features-section";
import { HeroSection } from "@/zap/components/landing/hero/hero-section";
import { PricingSection } from "@/zap/components/landing/pricing/pricing-section";
import { SolutionSection } from "@/zap/components/landing/solution/solution-section";
import { TestimonialSection } from "@/zap/components/landing/testimonials/testimonial-section";

const SECTION_CLASSNAME = "w-full py-12 md:py-24 lg:py-32";
const SECTIONS = [
  {
    id: "hero",
    component: HeroSection,
    className:
      "h-[calc(100vh-4rem)] border-b flex items-center justify-center md:py-0 overflow-hidden min-h-[500px]",
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

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {SECTIONS.map(({ id, component: Component, className }) => (
          <section className={className} id={id} key={id}>
            <Component />
          </section>
        ))}
      </main>
      <Footer />
    </div>
  );
}
