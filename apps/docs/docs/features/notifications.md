# Notifications & Emails

Zap.ts empowers your app with real-time communication through push notifications via its Progressive Web App (PWA) setup and email capabilities using [Resend](https://resend.com/) and [React Email](https://react.email/). This guide covers how to leverage push notifications for user engagement and set up email sending with Resend, giving you the tools to keep users informed in a snap.

## Why Emails and Notifications in Zap.ts?

- **Push Notifications**: Re-engage users with timely updates via the PWA, even when the app isn’t open.
- **Emails**: Send transactional or marketing emails with Resend and beautiful templates via React Email.
- **Pre-Configured**: Both systems are ready to go, saving you setup time.

## Push Notifications with PWA

Zap.ts includes PWA support out of the box, enabling push notifications through a service worker and a custom hook.

### How It Works

1. **PWA Plugin**: `src/plugins/pwa.ts` initializes push notifications using a Zustand store.
2. **Store**: `src/stores/push-notifications.store.ts` manages subscription and notification logic.
3. **Service Worker**: Handles background push events.

### Setting Up Push Notifications

Zap.ts’s PWA is pre-configured, but you’ll need to enable and test it.

#### 1. Enable the PWA Hook

Use the `usePwa` hook in your app:

```tsx
// src/components/Notifications.tsx
"use client";

import { usePwa } from "@/plugins/pwa";

export default function Notifications() {
  usePwa(); // Initializes push notifications

  return (
    <div>
      <p>Push notifications are enabled!</p>
    </div>
  );
}
```

The `usePwa` hook from `src/plugins/pwa.ts` triggers initialization:

```ts
// src/plugins/pwa.ts
"use client";

import { usePushNotificationsStore } from "@/stores/push-notifications.store";
import { useEffect } from "react";

export const usePwa = () => {
  const initialize = usePushNotificationsStore((state) => state.initialize);
  useEffect(() => initialize(), [initialize]);
};
```

#### 2. Request Permission and Subscribe

The assumed `push-notifications.store.ts` handles permission and subscription.

- **VAPID Keys**: Generate these with a tool like `web-push` (`npm install -g web-push; web-push generate-vapid-keys`) and add the public key here.
- **Service Worker**: Ensure `sw.js` exists in `public/` to handle push events.

### Testing Push Notifications

1. Run `bun run dev`.
2. Visit `http://localhost:3000`, allow notifications in your browser, and check the console for subscription logs.
3. Trigger a test push from your server.

## Emails with Resend and React Email

Zap.ts includes placeholders for Resend and React Email to send emails easily.

### How It Works

1. **Resend**: A service for sending emails (API key required).
2. **React Email**: Creates email templates with React components.
3. **Placeholder**: Zap.ts sets up the structure, but you’ll need to implement the sending logic.

### Setting Up Emails

#### 1. Install Resend

```bash
bun add resend @react-email/components
```

#### 2. Configure Resend

Create `src/lib/email.ts`:

```ts
// src/lib/email.ts
import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);
```

Add to `.env.local`:

```
RESEND_API_KEY=your-resend-api-key
```

Get your API key from [Resend](https://resend.com/).

#### 3. Create an Email Template

```tsx
// src/emails/Welcome.tsx
import { Html, Head, Body, Text } from "@react-email/components";

export default function Welcome({ name }: { name: string }) {
  return (
    <Html>
      <Head />
      <Body>
        <Text>Welcome, {name}! Thanks for joining Zap.ts.</Text>
      </Body>
    </Html>
  );
}
```

#### 4. Send an Email

```ts
// src/lib/send-welcome-email.ts
import { resend } from "@/lib/email";
import Welcome from "@/emails/Welcome";
import { render } from "@react-email/render";

export async function sendWelcomeEmail(to: string, name: string) {
  await resend.emails.send({
    from: "Zap.ts <no-reply@yourdomain.com>",
    to,
    subject: "Welcome to Zap.ts!",
    html: render(<Welcome name={name} />),
  });
}
```

Call it from your app (e.g., after signup):

```ts
// src/app/api/signup/route.ts (example)
import { sendWelcomeEmail } from "@/lib/send-welcome-email";

export async function POST(req: Request) {
  const { email, name } = await req.json();
  await sendWelcomeEmail(email, name);
  return new Response("Email sent!", { status: 200 });
}
```

### Testing Emails

1. Run `bun run dev`.
2. Trigger the email (e.g., via a signup API call).
3. Check your inbox or Resend’s dashboard for delivery.

## Troubleshooting

- **Push Fails**: Ensure VAPID keys are set, the service worker is registered, and browser permissions are granted.
- **Email Not Sending**: Verify `RESEND_API_KEY` and check Resend’s logs for errors.

## Learning More

- **Emails**: Explore [Resend docs](https://resend.com/docs) and [React Email docs](https://react.email/docs) for advanced setups.

## Why Emails and Notifications in Zap.ts?

- **Engagement**: Keep users connected with push and email.
- **Speed**: Pre-built hooks and placeholders get you started fast.
- **Flexibility**: Extend with your own logic or services.

Zap into real-time communication now!
