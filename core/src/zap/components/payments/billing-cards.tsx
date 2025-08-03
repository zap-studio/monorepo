"use client";

import { Check, Zap } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ZapButton } from "@/components/zap-ui/button";
import { ZAP_DEFAULT_SETTINGS } from "@/zap.config";
import { authClient } from "@/zap/lib/auth/client";
import type { ProductMetadata } from "@/zap/lib/polar/utils";

const FEATURES = [
  "Unlimited projects",
  "Advanced AI features",
  "Priority support",
  "Custom integrations",
  "Advanced analytics",
  "Team collaboration",
  "Export capabilities",
  "API access",
];

interface BillingCardsProps {
  products: ProductMetadata[];
}

export function BillingCards({ products }: BillingCardsProps) {
  const handleCheckout = async (productId: string) => {
    try {
      const productSlug = ZAP_DEFAULT_SETTINGS.PAYMENTS.POLAR?.PRODUCTS?.find(
        (product) => product.productId === productId,
      )?.slug;

      await authClient.checkout({
        products: [productId],
        slug: productSlug,
      });
    } catch {
      toast.error("Failed to initiate checkout. Please try again.");
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-6 lg:grid-cols-2">
      {products.map((product) => {
        const isPopular = product.metadata.popular === "true";
        const priceItem = product.prices?.find(
          (price) => price.amountType === "fixed",
        );

        const priceAmount = priceItem?.priceAmount || 0;
        const priceCurrency = priceItem?.priceCurrency || "usd";

        const formattedPrice = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: priceCurrency,
        }).format(priceAmount);

        return (
          <Card
            className={`relative ${isPopular ? "border-primary shadow-lg" : ""}`}
            key={product.id}
          >
            {isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
                <Badge className="bg-primary text-primary-foreground">
                  <Zap className="mr-1 size-3" />
                  Most Popular
                </Badge>
              </div>
            )}

            <CardHeader className="pb-8 text-center">
              <CardTitle className="text-2xl">{product.name}</CardTitle>
              <CardDescription className="text-base">
                {product.description}
              </CardDescription>
              <div className="mt-4">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">{formattedPrice}</span>
                  <span className="text-muted-foreground">
                    /{product.recurringInterval}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h4 className="font-semibold">What&apos;s included:</h4>
                <ul className="space-y-2">
                  {FEATURES.map((feature) => (
                    <li className="flex items-center gap-2" key={feature}>
                      <Check className="size-4 shrink-0 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <ZapButton
                className="w-full"
                onClick={() => handleCheckout(product.id)}
                size="lg"
                variant={isPopular ? "default" : "outline"}
              >
                Subscribe to {product.name}
              </ZapButton>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
