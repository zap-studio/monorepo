import type { CheckoutOptions } from "@polar-sh/better-auth";

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
