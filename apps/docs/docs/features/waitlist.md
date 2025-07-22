# Waitlist

Zap.ts provides a _built-in_ waitlist feature to gauge product interest and collect potential user emails before launching your application.

## Overview

- **Customizable Display:** Configure title, description, and user count visibility.
- **Dynamic Control:** Enable or disable the waitlist using feature flags.
- **Email Collection:** Gather potential user emails for launch announcements.
- **Market Validation:** Test product-market fit by measuring signup interest.

## Purpose

Waitlists are often used before launching your real products. A lot of modern startups use waitlists before building their product to:

- **Build Early Community** - Create a group of engaged potential customers
- **Collect User Insights** - Gather feedback and understand your target audience
- **Create Launch Momentum** - Build anticipation for your product launch
- **Generate Social Proof** - Show momentum and credibility to future users
- **Reduce Marketing Costs** - Have a ready audience when you're ready to launch
- **Validate Market Demand** - Test if there's genuine interest in your product idea

## Configuration

The waitlist appearance and behavior can be customized through the `ZAP_DEFAULT_SETTINGS` configuration:

```ts
// zap.config.ts
export const ZAP_DEFAULT_SETTINGS: ZapSettings = {
  WAITLIST: {
    ENABLE_WAITLIST_PAGE: false,
    TITLE: "try Zap.ts",
    DESCRIPTION: "be the first to build applications as fast as a zap.",
    SHOW_COUNT: true, // Display current signup count
  },
  // ...other settings
};
```

#### Configuration Options

- **`ENABLE_WAITLIST_AGE`**: The flag to enable this feature or not.
- **`TITLE`**: The main heading displayed on the waitlist page
- **`DESCRIPTION`**: Subtitle or tagline explaining the value proposition
- **`SHOW_COUNT`**: Show or hide the current number of signups

Of course, you can customize the code as you wish. Those options are just here to help you getting started even _faster_!
