import { Footer, Header } from "../../components/common";
import {
  FaqSection,
  FeaturesSection,
  HeroSection,
  PricingSection,
  SolutionSection,
  TestimonialSection,
} from "../components";

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
  { id: "pricing", component: PricingSection, className: SECTION_CLASSNAME },
  {
    id: "faq",
    component: FaqSection,
    className: `bg-muted/50 border-t ${SECTION_CLASSNAME}`,
  },
];

export function _LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
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
