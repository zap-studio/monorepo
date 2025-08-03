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

const PLANS = [
  {
    name: "Pro Monthly",
    price: "$19",
    period: "month",
    description: "Perfect for individuals and small teams",
    popular: false,
    productId: "6e21c61f-b711-4ce5-b925-e4a20871074c",
    slug: "pro-monthly",
  },
  {
    name: "Pro Yearly",
    price: "$190",
    period: "year",
    description: "Best value for committed users",
    popular: true,
    productId: "ad7d7325-3d72-42e5-8164-d4706c513468",
    slug: "pro-yearly",
    savings: "Save $38",
  },
];

export function BillingCards() {
  const handleCheckout = async (slug: string) => {
    try {
      const products =
        ZAP_DEFAULT_SETTINGS.PAYMENTS.POLAR?.PRODUCTS?.filter(
          (product) => product.slug === slug,
        )?.map((product) => product.productId) || [];

      await authClient.checkout({
        products,
        slug,
      });
    } catch {
      toast.error("Failed to initiate checkout. Please try again.");
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-6 lg:grid-cols-2">
      {PLANS.map((plan) => (
        <Card
          className={`relative ${plan.popular ? "border-primary shadow-lg" : ""}`}
          key={plan.slug}
        >
          {plan.popular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
              <Badge className="bg-primary text-primary-foreground">
                <Zap className="mr-1 size-3" />
                Most Popular
              </Badge>
            </div>
          )}

          <CardHeader className="pb-8 text-center">
            <CardTitle className="text-2xl">{plan.name}</CardTitle>
            <CardDescription className="text-base">
              {plan.description}
            </CardDescription>
            <div className="mt-4">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">/{plan.period}</span>
              </div>
              {plan.savings && (
                <Badge className="mt-2" variant="secondary">
                  {plan.savings}
                </Badge>
              )}
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
              size="lg"
              variant={plan.popular ? "default" : "outline"}
              onClick={() => handleCheckout(plan.slug)}
            >
              Subscribe to {plan.name}
            </ZapButton>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
