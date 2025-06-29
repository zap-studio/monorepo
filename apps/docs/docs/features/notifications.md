# Notifications & Emails

Zap.ts provides a unified system for sending notifications and transactional emails to your users. This includes _push notifications_, and _email delivery_, all with type safety and extensibility in mind.

## Overview

- **Emails:** Transactional emails for verification, password reset, magic links, and more.
- **Extensible:** Easily customize notification channels, templates, and triggers.
- **Push Notifications:** Real-time web push notifications using the browser's Push API and service workers.
- **Type-safe:** All notification and email actions are fully typed with TypeScript and Zod.

## Push Notifications

Zap.ts uses the browser Push API and a PWA service worker (`/sw.js`) to deliver real-time notifications.

- **API Endpoints:**  
  - `POST /api/(auth-only)/user/notifications/subscribe` — Subscribe a user to push notifications.
  - `DELETE /api/(auth-only)/user/notifications/unsubscribe` — Unsubscribe a user.
- **Subscription:** Users can subscribe to push notifications, which stores their subscription in the database.
- **Service Worker:** The service worker (`public/sw.js`) handles displaying notifications when received.

For more, see the [MDN Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API) and [Next.js PWA Guide](https://nextjs.org/docs/app/guides/progressive-web-apps).

## Emails

Zap.ts uses [Resend](https://resend.com/) for transactional email delivery. Email actions are defined in `src/zap/actions/emails.action.ts` and support:

- **Forgot password emails**
- **Magic link emails**
- **Verification emails**
- **Custom emails**

**Example: Sending a Verification Email**

```ts
// src/zap/actions/emails.action.ts
import { resend } from "@/zap/lib/resend/server";
import { VerificationEmail } from "@/zap/components/features/mails/verification";

export const sendVerificationEmail = async ({
  subject,
  recipients,
  url,
}) => {
  return await Effect.runPromise(
    Effect.gen(function* (_) {
      const { data, error } = yield* _(
        Effect.tryPromise({
          try: () =>
            resend.emails.send({
              from: "noreply@yourdomain.com",
              to: recipients,
              subject,
              react: VerificationEmail({ url }),
            }),
          catch: (e) => new Error("Failed to send the verification mail"),
        }),
      );
      if (error) throw error;
      return data;
    }),
  );
};
```

For more, see the [Resend documentation](https://resend.com/docs).

## Sending a Push Notification

To send a push notification to a user:

1. **Subscribe the user:** Ensure the user is subscribed using the `/api/(auth-only)/user/notifications/subscribe` endpoint and the `usePushNotifications` hook.

2. **Trigger a notification:** Use your backend logic to send a push notification to the user's subscription. For that, you need to fetch the user's subscription from the database and using a library like [web-push](https://github.com/web-push-libs/web-push) to send the notification.

**Example: Sending a push notification (server-side)**

```ts
import webpush from "web-push";
import { db } from "@/db";
import { pushNotifications } from "@/zap/db/schema/notifications.sql";

// Fetch subscription from DB
const subscription = await db
  .select()
  .from(pushNotifications)
  .where(/* ... */)
  .limit(1);

// Send notification
if (subscription) {
  await webpush.sendNotification(
    subscription,
    JSON.stringify({
      title: "You have a new message!",
      body: "Check your inbox for details.",
    }),
  );
}
```

## Sending an Email

To send a transactional email (verification, password reset, magic link, etc):

**Call the appropriate action:** Use the exported functions from `emails.action.ts` such as `sendVerificationEmail`, `sendForgotPasswordMail`, or `sendMagicLinkEmail`.

**Example: Sending a verification email**

```ts
import { sendVerificationEmail } from "@/zap/actions/emails.action";

await sendVerificationEmail({
  subject: "Verify your email address",
  recipients: ["user@example.com"],
  url: "https://yourapp.com/verify?token=abc123",
});
```

You can also send custom emails using the `sendMail` function and your own React email template.
