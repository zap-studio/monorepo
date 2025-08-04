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
import { ZapButton } from "@/components/zap-ui/button";
import type { ProductMetadata } from "@/zap.config";
import { SUPPORT_EMAIL } from "@/zap.config";
import { PricingToggle } from "@/zap/components/landing/pricing/pricing-toggle";
import { PriceDisplay } from "@/zap/components/payments/price-display";
import { authClient } from "@/zap/lib/auth/client";
import {
  getProductBillingDetails,
  getSortedProducts,
} from "@/zap/lib/payments/utils";
import { useActiveSubscriptionSlug } from "@/zap/lib/polar/client";

interface BillingCardsProps {
  products: ProductMetadata[];
}

const yearlyDiscount = 20;

export function BillingCards({ products }: BillingCardsProps) {
  const [isYearly, setIsYearly] = useState(false);
  const activeSubscriptionSlug = useActiveSubscriptionSlug(products, isYearly);

  const handleCheckout = async (
    productId: string,
    slug: string,
    price: number | string,
  ) => {
    try {
      if (typeof price === "string") {
        window.open(`mailto:${SUPPORT_EMAIL}`);
        return;
      }

      if (price === 0) {
        toast.info("This is a free plan. No checkout required.");
        return;
      }

      if (!productId) {
        throw new Error("Product ID not found");
      }

      toast.loading("Redirecting to checkout...");

      await authClient.checkout({
        products: [productId],
        slug,
      });
    } catch {
      toast.error("Failed to initiate checkout. Please try again.");
    }
  };

  const sortedProducts = getSortedProducts(products, isYearly);

  return (
    <div className="w-full">
      <PricingToggle
        isYearly={isYearly}
        onToggle={setIsYearly}
        yearlyDiscount={yearlyDiscount}
      />

      <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedProducts.map((product) => {
          const { price, recurringInterval } = getProductBillingDetails(
            product,
            isYearly,
          );

          const isCurrentPlan = activeSubscriptionSlug === product.slug;
          const isFree = price === 0;
          const isContactSales = typeof price === "string";
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
              className="bg-muted/50 relative flex flex-col justify-between border shadow-none transition-all duration-300"
              key={product.slug}
            >
              {product.popular && (
                <div className="bg-primary text-primary-foreground absolute -top-4 right-0 left-0 mx-auto w-fit rounded-full px-3 py-1 text-xs font-medium">
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
                          <Check className="text-primary h-4 w-4" />
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
