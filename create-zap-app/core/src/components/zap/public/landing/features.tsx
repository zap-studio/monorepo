import { Check } from "lucide-react";

const features = [
  {
    title: "Authentication Ready",
    description:
      "Secure, flexible authentication with BetterAuth. Social logins, email/password, and more.",
  },
  {
    title: "Database Integration",
    description:
      "Type-safe database access with Drizzle. PostgreSQL setup with migrations ready to go.",
  },
  {
    title: "Modern Styling",
    description:
      "Beautiful UI components with Tailwind CSS and shadcn/ui. Responsive by default.",
  },
  {
    title: "Type Safety",
    description:
      "End-to-end type safety with TypeScript. Catch errors before they happen.",
  },
  {
    title: "API Routes",
    description:
      "Type-safe API routes with built-in validation and error handling. Powered by oRPC.",
  },
  {
    title: "Deployment Ready",
    description: "Deploy to any platform with zero configuration in minutes.",
  },
];

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
        {features.map((feature, i) => (
          <FeatureCard key={i} {...feature} />
        ))}
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
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
