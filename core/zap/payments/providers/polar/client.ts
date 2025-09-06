import "client-only";

import { useZapQuery } from "@/zap/api/hooks";
import { betterAuthClient } from "@/zap/auth/providers/better-auth/client";

import { getProduct } from "../../utils";

async function fetchCustomerState() {
  const state = await betterAuthClient.customer.state();
  return state;
}

export function useCustomerState() {
  return useZapQuery({
    queryKey: ["customer-state"],
    queryFn: fetchCustomerState,
  });
}

export function useActiveSubscriptions() {
  const { data: customerState, error } = useCustomerState();

  if (error || !customerState) {
    return [];
  }

  return customerState.data?.activeSubscriptions;
}

export function useActiveSubscriptionProductId() {
  const activeSubscriptions = useActiveSubscriptions();
  const activeSubscriptionProductId = activeSubscriptions?.[0]?.productId;

  if (!activeSubscriptionProductId) {
    return null;
  }

  return activeSubscriptionProductId;
}

export function useActiveSubscriptionProduct() {
  const productId = useActiveSubscriptionProductId();

  if (!productId) {
    return null;
  }

  const product = getProduct(productId);
  return product;
}

export function useActiveSubscriptionSlug(isYearly?: boolean) {
  const activeProduct = useActiveSubscriptionProduct();

  if (!activeProduct) {
    return null;
  }

  if (activeProduct.billingOptions && isYearly !== undefined) {
    const interval = isYearly ? "yearly" : "monthly";
    return `${activeProduct.slug}-${interval}`;
  }

  return activeProduct.slug;
}
