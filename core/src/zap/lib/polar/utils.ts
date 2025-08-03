import { type ProductMetadata, PRODUCTS_METADATA } from "@/zap.config";

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
