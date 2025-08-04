# Payments & Subscriptions

Zap.ts provides a _complete_, _secure_ payment and subscription system out of the box, powered by [Polar](https://polar.sh/) and seamlessly integrated with [Better Auth](https://www.better-auth.com/).

The setup supports both one-time payments and recurring subscriptions with a modern, developer-friendly API.

## Overview

- **Better Auth Bridge:** Seamless connection between authentication and customer billing through Better Auth plugins.
- **Polar Integration:** Complete integration with Polar's payment platform for subscriptions and one-time payments.
- **Flexible Plans:** Support for monthly, yearly subscriptions, and one-time payments.
- **Multi-environment:** Separate sandbox and production environments for development and deployment.
- **Type-safe:** All payment logic is fully typed with TypeScript for better developer experience.

## How it works?

### 1. Polar Client (server-side)

The Polar client is configured in `src/zap/lib/polar/server.ts` and handles all server-side payment operations.

```ts
// src/zap/lib/polar/server.ts
import { Polar } from "@polar-sh/sdk";

export const polarClient = new Polar({
  accessToken: SERVER_ENV.POLAR_ACCESS_TOKEN,
  server: SERVER_ENV.POLAR_ENV, // 'sandbox' or 'production'
});
```

### 2. Better Auth Integration

The payment system is integrated with Better Auth through the `polar` plugin in `src/zap/lib/auth/server.ts`:

```ts
// src/zap/lib/auth/server.ts
import { polar, checkout, portal } from "@polar-sh/better-auth";

export const betterAuth = betterAuth({
  // ... other config
  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true, // Automatically create Polar customers
      use: [
        checkout({
          products: ZAP_DEFAULT_SETTINGS.PAYMENTS.POLAR?.PRODUCTS,
          successUrl: `/app/billing/success?checkout_id={CHECKOUT_ID}`,
          authenticatedUsersOnly: true,
        }),
        portal(), // Customer portal for managing subscriptions
      ],
    }),
    // ... other plugins
  ],
});
```

### 3. Client-side Payment Hooks

The client-side payment functionality is available through custom hooks in `src/zap/lib/polar/client.ts`:

```ts
// Example usage in components
import { useCustomerState, useActiveSubscriptions } from "@/zap/lib/polar/client";

export function BillingStatus() {
  const { data: customerState } = useCustomerState();
  const activeSubscriptions = useActiveSubscriptions();
  
  // Handle billing logic
}
```

## Environment Setup

### Required Environment Variables

Add these variables to your `.env` file:

```bash
# Polar Configuration
POLAR_ACCESS_TOKEN="polar_at_xxx" # Your Polar access token
POLAR_ENV="sandbox" # or "production" for live payments
POLAR_WEBHOOK_SECRET="your_webhook_secret" # For webhook verification (optional)
```

### Polar Environment Setup

1. **Create a Polar account** at [polar.sh](https://polar.sh/)
2. **Choose your environment:**
   - Use `sandbox` for development and testing
   - Use `production` for live payments
3. **Get your access token** from the Polar dashboard
4. **Configure products** in your Polar dashboard

:::warning
Remember that access tokens, products, and other data are completely separated between sandbox and production environments. Access tokens obtained in production are not usable in the sandbox environment and vice versa.
:::

## Product Configuration

### 1. Define Products

Products are configured in `zap.config.ts`:

```ts
// zap.config.ts
export const PRODUCTS_METADATA: Record<string, ProductMetadata> = {
  free: {
    productId: "",
    slug: "free",
    name: "Free",
    description: "Free plan with limited features",
    price: 0,
    currency: "usd",
    recurringInterval: "one-time",
    features: ["Limited projects", "Community support"],
  },
  "pro-monthly": {
    productId: "your_polar_product_id", // From Polar dashboard
    slug: "pro-monthly",
    name: "Pro (Monthly)",
    description: "Monthly subscription for Pro features",
    price: 20,
    currency: "usd",
    recurringInterval: "month",
    features: ["Unlimited projects", "Priority support"],
  },
  "pro-yearly": {
    productId: "your_polar_yearly_product_id",
    slug: "pro-yearly",
    name: "Pro (Yearly)",
    description: "Yearly subscription with 20% discount",
    price: 192, // 20% discount applied
    currency: "usd",
    recurringInterval: "year",
    popular: true,
    features: ["Unlimited projects", "Priority support"],
  },
};
```

### 2. Product Types

Zap.ts supports three types of products:

- **One-time payments:** `recurringInterval: "one-time"`
- **Monthly subscriptions:** `recurringInterval: "month"`
- **Yearly subscriptions:** `recurringInterval: "year"`

## Implementing Checkout

### 1. Basic Checkout Flow

```tsx
// components/billing-card.tsx
import { authClient } from "@/zap/lib/auth/client";

export function BillingCard({ product }: { product: ProductMetadata }) {
  const handleCheckout = async () => {
    try {
      await authClient.checkout({
        products: [product.productId],
        slug: product.slug,
      });
    } catch (error) {
      console.error("Checkout failed:", error);
    }
  };

  return (
    <button onClick={handleCheckout}>
      Subscribe to {product.name}
    </button>
  );
}
```

### 2. Success Page

After successful payment, users are redirected to `/app/billing/success`:

```tsx
// app/(protected)/app/billing/success/page.tsx
export default async function BillingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout_id?: string }>;
}) {
  const { checkout_id } = await searchParams;
  
  if (!checkout_id) {
    return <div>Missing checkout ID</div>;
  }

  return (
    <div>
      <h1>Payment Successful!</h1>
      <p>Your subscription has been activated.</p>
    </div>
  );
}
```

## Customer Management

### 1. Customer State

Access customer billing information:

```tsx
import { useCustomerState } from "@/zap/lib/polar/client";

export function CustomerInfo() {
  const { data: customerState, error } = useCustomerState();
  
  if (error) return <div>Error loading customer data</div>;
  if (!customerState) return <div>Loading...</div>;
  
  return (
    <div>
      <h2>Billing Information</h2>
      {/* Display customer information */}
    </div>
  );
}
```

### 2. Active Subscriptions

Check user's subscription status:

```tsx
import { useActiveSubscriptions, useActiveSubscriptionProduct } from "@/zap/lib/polar/client";

export function SubscriptionStatus() {
  const activeSubscriptions = useActiveSubscriptions();
  const activeProduct = useActiveSubscriptionProduct(products);
  
  if (!activeSubscriptions?.length) {
    return <div>No active subscriptions</div>;
  }
  
  return (
    <div>
      <h3>Active Plan: {activeProduct?.name}</h3>
      {/* Display subscription details */}
    </div>
  );
}
```

## Customization

### 1. Adding New Products

1. Create the product in your Polar dashboard
2. Add the product configuration to `PRODUCTS_METADATA`
3. Update your billing UI components

### 2. Custom Pricing Display

Modify or use a similar function to custom the pricing formatting.

```tsx
const formatPrice = (price: number | string, currency = "usd") => {
  const numericPrice = typeof price === "string" ? Number(price) : price;
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(numericPrice);
};
```

### 3. Styling Billing Components

All billing components use the same design system as the rest of your app:

- `BillingCards` - Product selection cards
- `FAQ` - Frequently asked questions
- `PricingSection` - Landing page pricing display

For more details about Polar's features and API, see the [Polar documentation](https://docs.polar.sh/).
