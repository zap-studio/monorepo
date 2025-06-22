"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PricingToggle } from "@/zap/components/landing/pricing/pricing-toggle";
import { PRICING_PLANS } from "@/zap/data/landing";

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);
  const yearlyDiscount = 0.2;

  const renderPrice = (plan: (typeof PRICING_PLANS)[0]) => {
    const isCustom = typeof plan.price.monthly === "string";

    let displayPrice: string | number = plan.price.monthly;

    if (!isCustom && isYearly) {
      const discountedMonthly =
        Number(plan.price.monthly) * (1 - yearlyDiscount);
      displayPrice = `$${discountedMonthly.toFixed(2)}`;
    } else if (!isCustom) {
      displayPrice = `$${Number(plan.price.monthly).toFixed(2)}`;
    }

    return (
      <div
        className={cn(
          "mt-2 flex flex-col items-start space-y-1 text-left transition-all duration-500",
        )}
      >
        <div className="flex items-end space-x-2">
          <span className="text-4xl font-extrabold tracking-tight">
            {displayPrice}
          </span>
          {!isCustom && (
            <span className="text-muted-foreground mb-1 text-sm font-medium">
              /month
            </span>
          )}
        </div>
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
        <PricingToggle
          isYearly={isYearly}
          onToggle={setIsYearly}
          yearlyDiscount={yearlyDiscount}
        />
      </div>

      <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {PRICING_PLANS.map((plan, i) => (
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
