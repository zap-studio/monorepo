import { Check } from "lucide-react";

import { FEATURES } from "@/zap/landing/data";

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

interface FeatureCardProps {
  title: string;
  description: string;
}

function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div className="group bg-background hover:border-foreground active:border-foreground relative overflow-hidden rounded-xl border p-6 transition-all">
      <div className="bg-primary/10 mb-4 flex h-10 w-10 items-center justify-center rounded-full">
        <Check className="text-primary h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-1 text-sm">{description}</p>
    </div>
  );
}
