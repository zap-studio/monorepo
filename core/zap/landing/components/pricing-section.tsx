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
import { isPluginEnabled } from "@/lib/plugins";
import { ZapButton } from "@/zap/components/core";
import { PriceDisplay, PricingToggle } from "@/zap/payments/components";
import { getBillingDetails, getSortedProducts } from "@/zap/payments/utils";
import { ZAP_PAYMENTS_CONFIG } from "@/zap/payments/zap.plugin.config";

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);

  const sortedProducts = getSortedProducts(
    Object.values(ZAP_PAYMENTS_CONFIG.PRODUCTS_METADATA),
    isYearly,
  );

  if (!isPluginEnabled("payments")) {
    return null;
  }

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
          yearlyDiscount={ZAP_PAYMENTS_CONFIG.YEARLY_DISCOUNT}
        />
      </div>

      <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedProducts.map((product) => {
          const { price, recurringInterval } = getBillingDetails(
            product,
            isYearly,
          );

          return (
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
                <PriceDisplay
                  alignment="left"
                  interval={recurringInterval}
                  price={price}
                />
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
          );
        })}
      </div>
    </div>
  );
}
