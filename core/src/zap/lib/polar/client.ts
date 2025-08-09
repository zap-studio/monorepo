import "client-only";

import type { ProductMetadata } from "@/zap.config";
import { useZapQuery } from "@/zap/lib/api/hooks/use-zap-query";
import { authClient } from "@/zap/lib/auth/client";
import { getProduct } from "@/zap/lib/polar/utils";

async function fetchCustomerState() {
  const state = await authClient.customer.state();
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

export function useActiveSubscriptionProduct(products?: ProductMetadata[]) {
  const productId = useActiveSubscriptionProductId();

  if (!(productId && products)) {
    return null;
  }

  const product = getProduct({ products, productId });
  return product;
}

export function useActiveSubscriptionSlug(
  products?: ProductMetadata[],
  isYearly?: boolean,
) {
  const activeProduct = useActiveSubscriptionProduct(products);

  if (!activeProduct) {
    return null;
  }

  if (activeProduct.billingOptions && isYearly !== undefined) {
    const interval = isYearly ? "yearly" : "monthly";
    return `${activeProduct.slug}-${interval}`;
  }

  return activeProduct.slug;
}
