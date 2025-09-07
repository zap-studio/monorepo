"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { betterAuthClient } from "@/zap/auth/providers/better-auth/client";
import { ZapButton } from "@/zap/components/core/button";
import { ClientError } from "@/zap/errors";
import { handleClientError } from "@/zap/errors/client";
import { SALES_EMAIL } from "@/zap.config";

import { useActiveSubscriptionSlug } from "../providers/polar/client";
import { getBillingDetails, getSortedProducts } from "../utils";
import { ZAP_PAYMENTS_CONFIG } from "../zap.plugin.config";
import { PriceDisplay } from "./price-display";
import { PricingToggle } from "./pricing-toggle";

export function BillingCards() {
  const [isYearly, setIsYearly] = useState(false);
  const activeSubscriptionSlug = useActiveSubscriptionSlug(isYearly);

  const handleCheckout = async (
    productId: string,
    slug: string,
    price: number | string,
    contactSales?: boolean
  ) => {
    try {
      if (contactSales) {
        window.open(`mailto:${SALES_EMAIL}`);
        return;
      }

      if (price === 0) {
        toast.info("This is a free plan. No checkout required.");
        return;
      }

      if (!productId) {
        throw new ClientError("Product ID not found");
      }

      toast.loading("Redirecting to checkout...");

      await betterAuthClient.checkout({
        products: [productId],
        slug,
      });
    } catch (error) {
      handleClientError(error);
    }
  };

  const sortedProducts = getSortedProducts(isYearly);

  return (
    <div className="w-full">
      <PricingToggle
        isYearly={isYearly}
        onToggle={setIsYearly}
        yearlyDiscount={ZAP_PAYMENTS_CONFIG.YEARLY_DISCOUNT}
      />

      <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedProducts.map((product) => {
          const { price, recurringInterval } = getBillingDetails(
            product,
            isYearly
          );

          const isCurrentPlan = activeSubscriptionSlug === product.slug;
          const isFree = price === 0;
          const isContactSales = product?.contactSales;
          const isDisabled = isCurrentPlan || isFree;

          const getButtonText = () => {
            if (isCurrentPlan) {
              return "Current Plan";
            }

            if (isContactSales) {
              return "Contact Sales";
            }

            if (isFree) {
              return "Free Plan";
            }

            return `Subscribe to ${product.name}`;
          };

          const getButtonVariant = () => {
            if (isCurrentPlan) {
              return "secondary" as const;
            }

            if (product.popular && !isDisabled) {
              return "default" as const;
            }

            return "outline" as const;
          };

          return (
            <Card
              className="relative flex flex-col justify-between border bg-muted/50 shadow-none transition-all duration-300"
              key={product.slug}
            >
              {product.popular && (
                <div className="-top-4 absolute right-0 left-0 mx-auto w-fit rounded-full bg-primary px-3 py-1 font-medium text-primary-foreground text-xs">
                  Most Popular
                </div>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{product.name}</CardTitle>
                <PriceDisplay
                  alignment="center"
                  interval={recurringInterval}
                  price={price}
                />
                <CardDescription className="text-base">
                  {product.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex h-full flex-col justify-between space-y-6">
                {(product.features?.length || 0) > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">What&apos;s included:</h4>
                    <ul className="grid gap-2">
                      {product.features?.map((feature) => (
                        <li className="flex items-center gap-2" key={feature}>
                          <Check className="h-4 w-4 text-primary" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-6">
                  <ZapButton
                    className="w-full cursor-pointer"
                    disabled={isDisabled}
                    onClick={() =>
                      handleCheckout(
                        product.productId || "",
                        product.slug,
                        price,
                        product?.contactSales
                      )
                    }
                    size="lg"
                    variant={getButtonVariant()}
                  >
                    {getButtonText()}
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
