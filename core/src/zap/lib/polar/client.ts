import "client-only";

import useSWR from "swr";

import { authClient } from "@/zap/lib/auth/client";
import { getProduct, ProductMetadata } from "@/zap/lib/polar/utils";

const fetchCustomerState = async () => {
  const state = await authClient.customer.state();
  return state;
};

export const useCustomerState = () => {
  return useSWR("customer-state", fetchCustomerState);
};

export const useActiveSubscriptions = () => {
  const { data: customerState, error } = useCustomerState();

  if (error || !customerState) {
    return [];
  }

  return customerState.data?.activeSubscriptions;
};

export const useActiveSubscriptionProductId = () => {
  const activeSubscriptions = useActiveSubscriptions();

  const activeSubscriptionProductId = activeSubscriptions?.[0]?.productId;

  if (!activeSubscriptionProductId) {
    return null;
  }

  return activeSubscriptionProductId;
};

export const useActiveSubscriptionProduct = (products?: ProductMetadata[]) => {
  const productId = useActiveSubscriptionProductId();

  if (!productId || !products) {
    return null;
  }

  const product = getProduct({ products, productId });

  return product;
};
