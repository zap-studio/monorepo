export type RecurringInterval = 'month' | 'year' | 'one-time';
export type Currency = 'usd' | 'eur';

export interface ProductMetadata {
  productId?: string;
  slug: string;
  name: string;
  description: string;
  price?: number | string;
  currency: Currency;
  recurringInterval?: 'one-time' | 'month' | 'year';
  features: string[];
  popular?: boolean;
  contactSales?: boolean;
  billingOptions?: {
    monthly?: BillingOption;
    yearly?: BillingOption;
  };
}

export interface BillingOption {
  productId: string;
  price: number;
  recurringInterval: 'month' | 'year';
}

export interface PaymentsPluginConfig {
  POLAR?: {
    AUTHENTICATED_USERS_ONLY: boolean;
    CREATE_CUSTOMER_ON_SIGNUP: boolean;
    ENVIRONMENT: 'sandbox' | 'production' | undefined;
    PRODUCTS?: Array<{
      productId: string;
      slug: string;
    }>;
    SUCCESS_URL?: string;
  };
  YEARLY_DISCOUNT: number;
  PRODUCTS_METADATA: Record<string, ProductMetadata>;
}
