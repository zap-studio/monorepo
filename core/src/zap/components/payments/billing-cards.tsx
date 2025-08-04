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
import type { ProductMetadata, RecurringInterval } from "@/zap.config";
import { PricingToggle } from "@/zap/components/landing/pricing/pricing-toggle";
import { authClient } from "@/zap/lib/auth/client";
import { getBillingDetails } from "@/zap/lib/payments/utils";

interface BillingCardsProps {
  products: ProductMetadata[];
}

const yearlyDiscount = 20;

export function BillingCards({ products }: BillingCardsProps) {
  const [isYearly, setIsYearly] = useState(false);

  const handleCheckout = async (productId: string, slug: string) => {
    try {
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

  const productsArray = products.flatMap((product) => {
    if (product.billingOptions) {
      const key = isYearly ? "yearly" : "monthly";
      const billing = product.billingOptions[key];

      if (!billing) {
        return [];
      }

      return {
        ...product,
        ...billing,
        slug: `${product.slug}-${key}`,
      };
    }

    if (
      product.recurringInterval === "one-time" ||
      !(product.billingOptions || product.recurringInterval)
    ) {
      return product;
    }

    return [];
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
      <div className="mt-2 flex flex-col items-center space-y-1 text-center transition-all duration-500">
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

  const getProductBillingDetails = (
    productData: ProductMetadata,
    yearlyMode: boolean,
  ) => {
    const billingKey = yearlyMode ? "yearly" : "monthly";
    const billingOption = productData.billingOptions?.[billingKey];

    return {
      price: productData.price ?? billingOption?.price ?? 0,
      recurringInterval:
        productData.recurringInterval ??
        billingOption?.recurringInterval ??
        "month",
    };
  };

  const sortedProducts = productsArray.sort((a, b) => {
    const aPrice = getBillingDetails(a, isYearly).price;
    const bPrice = getBillingDetails(b, isYearly).price;

    if (typeof aPrice === "string" || typeof bPrice === "string") {
      return 0;
    }

    return aPrice - bPrice;
  });

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
                {renderPrice(price, recurringInterval)}
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
                    onClick={() =>
                      handleCheckout(product.productId || "", product.slug)
                    }
                    size="lg"
                    variant={product.popular ? "default" : "outline"}
                  >
                    {typeof product.price === "string"
                      ? "Contact Sales"
                      : `Subscribe to ${product.name}`}
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
