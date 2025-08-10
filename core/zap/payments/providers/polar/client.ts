import "client-only";

import { ProductMetadata } from "@/zap.config.types";
import { useZapQuery } from "../../../api/hooks/use-zap-query";
import { betterAuthClient } from "../../../auth/providers/better-auth/client";
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
