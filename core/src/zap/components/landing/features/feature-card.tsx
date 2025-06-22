import { Check } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
}

export function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div className="group bg-background hover:border-foreground relative overflow-hidden rounded-xl border p-6 transition-all">
      <div className="bg-primary/10 mb-4 flex h-10 w-10 items-center justify-center rounded-full">
        <Check className="text-primary h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-1 text-sm">{description}</p>
    </div>
  );
}
