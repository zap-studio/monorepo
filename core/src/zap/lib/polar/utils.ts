import type { CheckoutOptions } from "@polar-sh/better-auth";
import type { ListResourceProduct } from "@polar-sh/sdk/models/components/listresourceproduct.js";

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
export type ProductMetadata = ListResourceProduct["items"][number];

export function getProduct({
  products,
  productId,
}: {
  products?: ProductMetadata[];
  productId: string | null;
}) {
  if (!(products && productId)) {
    return null;
  }

  const product = products.find((p) => p.id === productId);
  return product || null;
}
