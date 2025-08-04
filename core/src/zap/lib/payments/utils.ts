import type { ProductMetadata, RecurringInterval } from "@/zap.config";

export function getBillingDetails(product: ProductMetadata, isYearly: boolean) {
  const billingKey = isYearly ? "yearly" : "monthly";
  const billingOption = product.billingOptions?.[billingKey];

  return {
    price: product.price ?? billingOption?.price ?? 0,
    recurringInterval:
      product.recurringInterval ?? billingOption?.recurringInterval ?? "month",
  };
}

export function getProductBillingDetails(
  productData: ProductMetadata,
  yearlyMode: boolean,
) {
  const billingKey = yearlyMode ? "yearly" : "monthly";
  const billingOption = productData.billingOptions?.[billingKey];

  return {
    price: productData.price ?? billingOption?.price ?? 0,
    recurringInterval:
      productData.recurringInterval ??
      billingOption?.recurringInterval ??
      "month",
  };
}

export function getProductsArray(
  products: ProductMetadata[],
  isYearly: boolean,
) {
  return products.flatMap((product) => {
    if (product.billingOptions) {
      const key = isYearly ? "yearly" : "monthly";
      const billing = product.billingOptions[key];

      if (!billing) {
        return [];
      }

      return {
        ...product,
        ...billing,
        slug: `${product.slug}-${key}`,
      };
    }

    if (
      product.recurringInterval === "one-time" ||
      !(product.billingOptions || product.recurringInterval)
    ) {
      return product;
    }

    return [];
  });
}

export function getSortedProducts(
  products: ProductMetadata[],
  isYearly: boolean,
) {
  const productsArray = getProductsArray(products, isYearly);

  return productsArray.sort((a, b) => {
    const aPrice = getBillingDetails(a, isYearly).price;
    const bPrice = getBillingDetails(b, isYearly).price;

    if (typeof aPrice === "string" || typeof bPrice === "string") {
      return 0;
    }

    return aPrice - bPrice;
  });
}

export function getPriceDisplay(
  price: number | string,
  interval: RecurringInterval,
) {
  let displayPrice: string;
  let intervalText: string;

  if (typeof price === "string") {
    displayPrice = price;
    intervalText = "";
  } else if (interval === "year") {
    displayPrice = `$${(price / 12).toFixed(2)}`;
    intervalText = "/month";
  } else if (interval === "month") {
    displayPrice = `$${price.toFixed(2)}`;
    intervalText = "/month";
  } else if (interval === "one-time") {
    displayPrice = `$${price.toFixed(2)}`;
    intervalText = "one-time";
  } else {
    displayPrice = `$${price.toFixed(2)}`;
    intervalText = "";
  }

  return { displayPrice, intervalText };
}
