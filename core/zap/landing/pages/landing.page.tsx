import { isPluginEnabled } from "@/lib/plugins";
import { Footer } from "@/zap/components/common/footer";
import { Header } from "@/zap/components/common/header";
import { FaqSection } from "../components/faq-section";
import { FeaturesSection } from "../components/features-section";
import { HeroSection } from "../components/hero-section";
import { PricingSection } from "../components/pricing-section";
import { SolutionSection } from "../components/solution-section";
import { TestimonialSection } from "../components/testimonial-section";

const isPaymentsEnabled = isPluginEnabled("payments");

const SECTION_CLASSNAME = "w-full py-12 md:py-24 lg:py-32";
export const SECTIONS = [
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
  {
    id: "pricing",
    component: PricingSection,
    className: SECTION_CLASSNAME,
    disabled: !isPaymentsEnabled,
  },
  {
    id: "faq",
    component: FaqSection,
    className: isPaymentsEnabled
      ? `bg-muted/50 border-t ${SECTION_CLASSNAME}`
      : SECTION_CLASSNAME,
  },
];

export function _LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {SECTIONS.map(({ id, component: Component, className, disabled }) => {
          if (disabled) {
            return null;
          }

          return (
            <section className={className} id={id} key={id}>
              <Component />
            </section>
          );
        })}
      </main>
      <Footer />
    </div>
  );
}
