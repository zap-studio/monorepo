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
import type { ProductMetadata } from "@/zap.config";
import { authClient } from "@/zap/lib/auth/client";

interface BillingCardsProps {
  products: ProductMetadata[];
}

export function BillingCards({ products }: BillingCardsProps) {
  const handleCheckout = async (productId: string) => {
    try {
      const product = products.find((p) => p.productId === productId);

      if (!product) {
        throw new Error("Product not found");
      }

      await authClient.checkout({
        products: [productId],
        slug: product.slug,
      });
    } catch {
      toast.error("Failed to initiate checkout. Please try again.");
    }
  };

  const formatPrice = (price = 0, currency = "usd") =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(price);

  const filteredProducts = products.filter(
    (product): product is typeof product & { price: number } => {
      return (
        typeof product.price === "number" &&
        product.price > 0 &&
        product.recurringInterval !== "one-time"
      );
    },
  );

  const sortedProducts = filteredProducts.sort((a, b) => a.price - b.price);

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-6 lg:grid-cols-2">
      {sortedProducts.map((product) => {
        const formattedPrice = formatPrice(product.price, product.currency);

        return (
          <Card
            className={`relative ${product.popular ? "border-primary shadow-lg" : ""}`}
            key={product.productId}
          >
            {product.popular && (
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
              <div className="mt-4 flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold">{formattedPrice}</span>
                <span className="text-muted-foreground">
                  /{product.recurringInterval}
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {(product.features?.length || 0) > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold">What&apos;s included:</h4>
                  <ul className="space-y-2">
                    {product.features?.map((feature) => (
                      <li className="flex items-center gap-2" key={feature}>
                        <Check className="size-4 shrink-0 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <ZapButton
                className="w-full"
                onClick={() => handleCheckout(product.productId)}
                size="lg"
                variant={product.popular ? "default" : "outline"}
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
