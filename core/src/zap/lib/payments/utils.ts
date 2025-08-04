import type { ProductMetadata } from "@/zap.config";

export function getBillingDetails(product: ProductMetadata, isYearly: boolean) {
  const billingKey = isYearly ? "yearly" : "monthly";
  const billingOption = product.billingOptions?.[billingKey];

  return {
    price: product.price ?? billingOption?.price ?? 0,
    recurringInterval:
      product.recurringInterval ?? billingOption?.recurringInterval ?? "month",
  };
}
