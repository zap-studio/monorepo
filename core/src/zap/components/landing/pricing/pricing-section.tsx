"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ZapButton } from "@/components/zap-ui/button";
import { PRODUCTS_METADATA, type RecurringInterval } from "@/zap.config";
import { PricingToggle } from "@/zap/components/landing/pricing/pricing-toggle";

const yearlyDiscount = 20;

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);

  const productsArray = Object.values(PRODUCTS_METADATA).filter((product) => {
    if (product.recurringInterval === "one-time") {
      return true;
    }

    return isYearly
      ? product.recurringInterval === "year"
      : product.recurringInterval === "month";
  });

  const renderPrice = (price: number | string, interval: RecurringInterval) => {
    let displayPrice: string;
    let intervalText: string;

    if (typeof price === "string") {
      displayPrice = price;
      intervalText = "";
    } else if (interval === "year") {
      displayPrice = `$${(price / 12).toFixed(2)}`;
      intervalText = "/month";
    } else if (interval === "month") {
      displayPrice = `$${price.toFixed(2)}`;
      intervalText = "/month";
    } else if (interval === "one-time") {
      displayPrice = `$${price.toFixed(2)}`;
      intervalText = "one-time";
    } else {
      displayPrice = `$${price.toFixed(2)}`;
      intervalText = "";
    }

    return (
      <div className="mt-2 flex flex-col items-start space-y-1 text-left transition-all duration-500">
        <div className="flex items-end space-x-2">
          <span className="text-4xl font-extrabold tracking-tight">
            {displayPrice}
          </span>
          {intervalText && (
            <span className="text-muted-foreground mb-1 text-sm font-medium">
              {intervalText}
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
        {productsArray.map((product) => (
          <Card
            className="bg-muted/50 relative flex flex-col justify-between border shadow-none transition-all duration-300"
            key={product.slug}
          >
            {product.popular && (
              <div className="bg-primary text-primary-foreground absolute -top-4 right-0 left-0 mx-auto w-fit rounded-full px-3 py-1 text-xs font-medium">
                Most Popular
              </div>
            )}

            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
              {renderPrice(product.price, product.recurringInterval)}
              <CardDescription>{product.description}</CardDescription>
            </CardHeader>

            <CardContent className="flex h-full flex-col justify-between">
              <ul className="grid gap-2">
                {product.features?.map((feature) => (
                  <li className="flex items-center gap-2" key={feature}>
                    <Check className="text-primary h-4 w-4" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <ZapButton asChild className="w-full">
                  <Link href="/app/billing">Get Started</Link>
                </ZapButton>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
