import { FeatureCard } from "@/zap/components/landing/features/feature-card";
import { FEATURES } from "@/zap/data/landing";

export function FeaturesSection() {
  return (
    <div className="w-full px-4 md:px-6">
      <div className="mx-auto max-w-4xl space-y-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Features that accelerate your development
        </h2>
        <p className="text-muted-foreground text-lg md:text-xl">
          Everything you need to build modern web applications, all in one
          place.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </div>
  );
}
