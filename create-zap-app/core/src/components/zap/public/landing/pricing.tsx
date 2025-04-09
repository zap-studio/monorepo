"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);

  const pricingPlans = [
    {
      title: "Free",
      price: { monthly: "$0", yearly: "$0" },
      description: "Perfect for side projects and experiments",
      features: [
        "Core boilerplate code",
        "Basic authentication",
        "Community support",
        "GitHub repository access",
      ],
      buttonText: "Get Started",
      buttonVariant: "outline" as const,
    },
    {
      title: "Pro",
      price: { monthly: "$29", yearly: "$279" },
      description: "For professional developers and small teams",
      features: [
        "Everything in Free",
        "Advanced authentication",
        "Premium components",
        "Priority support",
        "1-click deployments",
        "Team collaboration",
      ],
      buttonText: "Get Started",
      buttonVariant: "default" as const,
      popular: true,
      savings: 50,
    },
    {
      title: "Enterprise",
      price: { monthly: "Custom", yearly: "Custom" },
      description: "For large teams and organizations",
      features: [
        "Everything in Pro",
        "Custom integrations",
        "Dedicated support",
        "SLA guarantees",
        "Custom branding",
        "On-premise options",
      ],
      buttonText: "Contact Sales",
      buttonVariant: "outline" as const,
    },
  ];

  const renderPrice = (plan: (typeof pricingPlans)[0]) => {
    const price = isYearly ? plan.price.yearly : plan.price.monthly;
    const period = isYearly ? "per year" : "per month";

    const monthlyPrice = parseFloat(plan.price.monthly.replace("$", ""));
    const yearlyPrice = parseFloat(plan.price.yearly.replace("$", ""));
    const savings =
      plan.savings && isYearly && plan.price.monthly !== plan.price.yearly
        ? (monthlyPrice * 12 - yearlyPrice).toFixed(2)
        : null;

    return (
      <div className="mt-2 flex flex-col items-start space-y-1 text-left">
        <div className="flex items-end space-x-2">
          <span className="text-4xl font-extrabold tracking-tight">
            {price}
          </span>
          {plan.title !== "Enterprise" && (
            <span className="text-muted-foreground mb-1 text-sm font-medium">
              {period}
            </span>
          )}
        </div>
        {savings && (
          <span className="rounded-md bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
            Save ${savings}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="w-full px-4 md:px-6">
      <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center space-y-4 text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Simple, transparent pricing
        </h2>
        <p className="text-muted-foreground max-w-[85%] md:text-xl">
          Choose the plan that&apos;s right for you and start building today.
        </p>
        <PricingToggle onToggle={setIsYearly} />
      </div>

      <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {pricingPlans.map((plan, i) => (
          <Card
            key={i}
            className="bg-muted/50 relative flex flex-col justify-between border shadow-none transition-all duration-300"
          >
            {plan.popular && (
              <div className="bg-primary text-primary-foreground absolute -top-4 right-0 left-0 mx-auto w-fit rounded-full px-3 py-1 text-xs font-medium">
                Most Popular
              </div>
            )}
            <CardHeader>
              <CardTitle>{plan.title}</CardTitle>
              {renderPrice(plan)}
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex h-full flex-col justify-between">
              <ul className="grid gap-2">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="text-primary h-4 w-4" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Button className="w-full" variant={plan.buttonVariant} asChild>
                  <Link href="/register">{plan.buttonText}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

interface PricingToggleProps {
  onToggle: (isYearly: boolean) => void;
}

function PricingToggle({ onToggle }: PricingToggleProps) {
  const [isYearly, setIsYearly] = useState(false);

  const handleToggle = (checked: boolean) => {
    setIsYearly(checked);
    onToggle(checked);
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      <Label
        htmlFor="pricing-toggle"
        className={!isYearly ? "font-medium" : "text-muted-foreground"}
      >
        Monthly
      </Label>
      <Switch
        id="pricing-toggle"
        checked={isYearly}
        onCheckedChange={handleToggle}
      />
      <Label
        htmlFor="pricing-toggle"
        className={isYearly ? "font-medium" : "text-muted-foreground"}
      >
        Yearly
      </Label>
    </div>
  );
}
