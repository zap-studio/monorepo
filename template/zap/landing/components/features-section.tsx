import { Check } from "lucide-react";

import { FEATURES } from "../data";

export function FeaturesSection() {
  return (
    <div className="w-full px-4 md:px-6">
      <div className="mx-auto max-w-4xl space-y-4 text-center">
        <h2 className="font-bold text-3xl tracking-tight sm:text-4xl md:text-5xl">
          Features that accelerate your development
        </h2>
        <p className="text-lg text-muted-foreground md:text-xl">
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

type FeatureCardProps = {
  title: string;
  description: string;
};

function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border bg-background p-6 transition-all hover:border-foreground active:border-foreground">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
        <Check className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="mt-1 text-muted-foreground text-sm">{description}</p>
    </div>
  );
}
