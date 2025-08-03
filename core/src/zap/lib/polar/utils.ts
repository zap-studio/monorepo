import type { CheckoutOptions } from "@polar-sh/better-auth";

import { type ProductMetadata, PRODUCTS_METADATA } from "@/zap.config";

type ExtractProductType<T> = T extends {
  products?: infer P | (() => Promise<infer Q>);
}
  ? P extends unknown[]
    ? P[number]
    : Q extends unknown[]
      ? Q[number]
      : P extends () => Promise<unknown>
        ? never
        : P
  : never;
export type Product = ExtractProductType<CheckoutOptions>;

export function getProducts() {
  const products = Object.values(PRODUCTS_METADATA);
  return products;
}

export function getProduct({
  products,
  productId,
}: {
  products: ProductMetadata[];
  productId: string;
}) {
  return products.find((product) => product.productId === productId) || null;
}
