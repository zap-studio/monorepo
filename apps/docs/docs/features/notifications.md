# Notifications & Emails

**Zap.ts** provides a unified system for sending notifications and transactional emails to your users. This includes _push notifications_, and _email delivery_, all with type safety and extensibility in mind.

## Overview

- **Emails:** Transactional emails for verification, password reset, magic links, and more.
- **Extensible:** Easily customize notification channels, templates, and triggers.
- **Push Notifications:** Real-time web push notifications using the browser's Push API and service workers.
- **Type-safe:** All notification and email actions are fully typed with TypeScript and Zod.

## Push Notifications

**Zap.ts** uses the browser Push API and a PWA service worker (`/sw.js`) to deliver real-time notifications.

- **API Endpoints:**  
  - `POST /api/(auth-only)/user/notifications/subscribe` — Subscribe a user to push notifications.
  - `DELETE /api/(auth-only)/user/notifications/unsubscribe` — Unsubscribe a user.
- **Subscription:** Users can subscribe to push notifications, which stores their subscription in the database.
- **Service Worker:** The service worker (`public/sw.js`) handles displaying notifications when received.

For more, see the [MDN Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API) and [Next.js PWA Guide](https://nextjs.org/docs/app/guides/progressive-web-apps).

## Emails

**Zap.ts** uses [Resend](https://resend.com/) for transactional email delivery. Email actions are defined in `src/zap/actions/emails.action.ts` and support:

- **Forgot password emails**
- **Magic link emails**
- **Verification emails**
- **Custom emails**

**Example: Sending a Verification Email**

```ts
// src/zap/actions/emails.action.ts
import { resend } from "@/zap/lib/resend/server";
import { VerificationEmail } from "@/zap/components/features/emails/verification";

export const sendVerificationEmail = async ({
  subject,
  recipients,
  url,
}) => {
  return Effect.runPromise(
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
          catch: (e) => e,
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

## References

### `sw.js`

```js
// public/sw.js
self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || "/icon.png",
      badge: "/badge.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: "2",
      },
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});
```

---

### `usePushNotificationsStore`

```ts
// src/zap/stores/push-notifications.store.ts
"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PushNotificationsStore {
  isSupported: boolean;
  subscription: PushSubscription | null;
  message: string;
  isIOS: boolean;
  isStandalone: boolean;
  isSubscribed: boolean;
  setMessage: (message: string) => void;
  initialize: () => void;
}

export const usePushNotificationsStore = create<PushNotificationsStore>()(
  persist(
    (set) => ({
      isSupported: false,
      subscription: null,
      message: "",
      isIOS: false,
      isStandalone: false,
      isSubscribed: false,

      setMessage: (message) => set({ message }),

      initialize: () => {
        if (typeof window === "undefined" || typeof navigator === "undefined")
          return;

        const isSupported =
          "serviceWorker" in navigator && "PushManager" in window;
        const isIOS =
          /iPad|iPhone|iPod/.test(navigator.userAgent) &&
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          !(window as any).MSStream;
        const isStandalone = window.matchMedia(
          "(display-mode: standalone)",
        ).matches;

        set({ isSupported, isIOS, isStandalone });

        if (isSupported) {
          navigator.serviceWorker
            .register("/sw.js", { scope: "/", updateViaCache: "none" })
            .then(async (registration) => {
              const sub = await registration.pushManager.getSubscription();
              set({ subscription: sub, isSubscribed: !!sub });
            });
        }
      },
    }),
    { name: "push-notifications" },
  ),
);

export const usePushNotificationsInitializer = () => {
  const { initialize } = usePushNotificationsStore();

  useEffect(() => {
    initialize();
  }, [initialize]);
};
```

---

### `usePushNotifications`

```ts
// src/zap/hooks/features/push-notifications/use-push-notifications.ts
"use client";

import { Effect } from "effect";
import { toast } from "sonner";
import useSWRMutation from "swr/mutation";

import { $fetch } from "@/lib/fetch";
import { urlBase64ToUint8Array } from "@/zap/lib/pwa/pwa";
import { usePushNotificationsStore } from "@/zap/stores/push-notifications.store";

interface SubscriptionResponse {
	success: boolean;
	subscriptionId: string;
}

interface UnsubscribeResponse {
	success: boolean;
}

interface ApiError {
	message: string;
}

export function usePushNotifications() {
	const store = usePushNotificationsStore();

	const { trigger: subscribeTrigger, isMutating: isSubscribing } =
		useSWRMutation<
			SubscriptionResponse,
			ApiError,
			string,
			{ subscription: PushSubscriptionJSON }
		>(
			"/api/user/notifications/subscribe",
			(url: string, { arg }: { arg: { subscription: PushSubscriptionJSON } }) =>
				$fetch<SubscriptionResponse>(url, {
					method: "POST",
					body: arg,
				}).catch(() => {
					throw { message: "Subscription API failed" };
				}),
			{
				optimisticData: { success: true, subscriptionId: "temp-id" },
				rollbackOnError: true,
				populateCache: (result) => result,
				onSuccess: () => {
					toast.success(`Subscribed to notifications!`);
				},
				onError: (error) => {
					if (store.subscription) {
						store.subscription.unsubscribe().catch(() => {});
						usePushNotificationsStore.setState({
							subscription: null,
							isSubscribed: false,
						});
					}
					toast.error(`Failed to subscribe: ${error.message}`);
				},
			},
		);

	const { trigger: unsubscribeTrigger, isMutating: isUnsubscribing } =
		useSWRMutation<UnsubscribeResponse, ApiError, string>(
			"/api/user/notifications/unsubscribe",
			(url: string) =>
				$fetch<UnsubscribeResponse>(url, {
					method: "DELETE",
				}).catch(() => {
					throw { message: "Unsubscribe API failed" };
				}),
			{
				optimisticData: { success: true },
				rollbackOnError: false,
				populateCache: (result) => result,
				onSuccess: () => {
					toast.success("We will miss you!");
				},
				onError: () => {
					toast.error(`Failed to unsubscribe from notifications.`);
				},
			},
		);

	const subscribeToPush = async () => {
		await Effect.runPromise(
			Effect.gen(function* (_) {
				usePushNotificationsStore.setState({ isSubscribed: true });

				const registration = yield* _(
					Effect.tryPromise({
						try: () => navigator.serviceWorker.ready,
						catch: () => {
							throw new Error("Service worker not ready");
						},
					}),
				);

				const sub = yield* _(
					Effect.tryPromise({
						try: () =>
							registration.pushManager.subscribe({
								userVisibleOnly: true,
								applicationServerKey: urlBase64ToUint8Array(
									process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
								),
							}),
						catch: () => {
							throw new Error("Failed to subscribe to push manager");
						},
					}),
				);

				usePushNotificationsStore.setState({ subscription: sub });
				const serializedSub = sub.toJSON();

				yield* _(
					Effect.tryPromise({
						try: () => subscribeTrigger({ subscription: serializedSub }),
						catch: (e) => e,
					}),
				);
			}).pipe(
				Effect.catchAll(() =>
					Effect.sync(() => {
						usePushNotificationsStore.setState({
							subscription: null,
							isSubscribed: false,
						});
						toast.error("Failed to subscribe to push notifications");
					}),
				),
			),
		);
	};

	const unsubscribeFromPush = async () => {
		const { subscription } = store;
		if (!subscription) return;
		await Effect.runPromise(
			Effect.gen(function* (_) {
				usePushNotificationsStore.setState({
					subscription: null,
					isSubscribed: false,
				});

				yield* _(
					Effect.tryPromise({
						try: () => subscription.unsubscribe(),
						catch: () => {
							throw new Error("Failed to unsubscribe");
						},
					}),
				);

				yield* _(
					Effect.tryPromise({
						try: () => unsubscribeTrigger(),
						catch: () => {
							throw new Error("Failed to trigger unsubscribe");
						},
					}),
				);
			}).pipe(
				Effect.catchAll(() =>
					Effect.sync(() => {
						toast.error("Failed to unsubscribe from push notifications");
					}),
				),
			),
		);
	};

	return {
		subscribeToPush,
		unsubscribeFromPush,
		isSubscribing,
		isUnsubscribing,
	};
}
```

---

### `POST subscribe`

```ts
// src/app/(api)/api/(auth-only)/user/notifications/subscribe
import { eq } from "drizzle-orm";
import { Effect } from "effect";
import { NextResponse } from "next/server";
import { z } from "zod/v4";

import { db } from "@/db";
import { getPushNotificationsByUserQuery } from "@/zap/db/queries/push-notifications.query";
import { pushNotifications } from "@/zap/db/schema/notifications.sql";
import { auth } from "@/zap/lib/auth/server";

const subscribeSchema = z.object({
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string(),
      auth: z.string(),
    }),
  }),
});

export async function POST(req: Request) {
  return Effect.runPromise(
    Effect.gen(function* (_) {
      const session = yield* _(
        Effect.tryPromise({
          try: () => auth.api.getSession({ headers: req.headers }),
          catch: () => null,
        }),
      );

      if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      const userId = session.user.id;

      const body = yield* _(
        Effect.tryPromise({
          try: () => req.json(),
          catch: () => new Error("Invalid JSON body"),
        }),
      );

      const subscriptionResult = yield* _(
        Effect.try({
          try: () => subscribeSchema.parse(body).subscription,
          catch: () => new Error("Invalid subscription data"),
        }).pipe(Effect.either),
      );

      if (subscriptionResult._tag === "Left") {
        return NextResponse.json(
          { message: "Invalid subscription data" },
          { status: 400 },
        );
      }

      const subscription = subscriptionResult.right;

      const existingSubscription = yield* _(
        Effect.tryPromise({
          try: () => getPushNotificationsByUserQuery.execute({ userId }),
          catch: () => null,
        }),
      );

      if (existingSubscription) {
        yield* _(
          Effect.tryPromise({
            try: () =>
              db
                .update(pushNotifications)
                .set({ subscription })
                .where(eq(pushNotifications.userId, userId))
                .execute(),
            catch: () => null,
          }),
        );

        return NextResponse.json({
          success: true,
          subscriptionId: existingSubscription.id,
        });
      }

      const newSubscriptionArr = yield* _(
        Effect.tryPromise({
          try: () =>
            db
              .insert(pushNotifications)
              .values({
                userId: userId,
                subscription,
              })
              .returning()
              .execute(),
          catch: () => [],
        }),
      );

      const newSubscription = newSubscriptionArr[0];

      return NextResponse.json({
        success: true,
        subscriptionId: newSubscription?.id,
      });
    }).pipe(
      Effect.catchAll((err) =>
        Effect.succeed(
          NextResponse.json(
            {
              message:
                err instanceof z.ZodError
                  ? "Invalid subscription data"
                  : "Internal server error",
            },
            { status: err instanceof z.ZodError ? 400 : 500 },
          ),
        ),
      ),
    ),
  );
}
```

---

### `DELETE unsubscribe`

```ts
// src/app/(api)/api/(auth-only)/user/notifications/unsubscribe
import { eq } from "drizzle-orm";
import { Effect } from "effect";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { pushNotifications } from "@/zap/db/schema/notifications.sql";
import { auth } from "@/zap/lib/auth/server";

export async function DELETE(req: Request) {
  return Effect.runPromise(
    Effect.gen(function* (_) {
      const session = yield* _(
        Effect.tryPromise({
          try: () => auth.api.getSession({ headers: req.headers }),
          catch: () => null,
        }),
      );

      if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      const userId = session.user.id;

      yield* _(
        Effect.tryPromise({
          try: () =>
            db
              .delete(pushNotifications)
              .where(eq(pushNotifications.userId, userId))
              .execute(),
          catch: (error) => error,
        }),
      );

      return NextResponse.json({ success: true });
    }).pipe(
      Effect.catchAll(() =>
        Effect.succeed(
          NextResponse.json(
            { message: "Internal server error" },
            { status: 500 },
          ),
        ),
      ),
    ),
  );
}
```

---

### `sendMail`

```ts
// src/zap/actions/emails.action.ts
interface SendMailProps {
	subject: string;
	recipients: string[];
	react?: JSX.Element;
}

export const sendMail = async ({
	subject,
	recipients,
	react,
}: SendMailProps) => {
	return Effect.runPromise(
		Effect.gen(function* (_) {
			const { data, error } = yield* _(
				Effect.tryPromise({
					try: () =>
						resend.emails.send({
							from,
							to: recipients,
							subject,
							react,
						}),
					catch: (e) => e,
				}),
			);

			if (error) {
				return yield* _(Effect.fail(error));
			}

			return data;
		}),
	);
};
```

---

### `TemplateEmail`

```tsx
// src/zap/components/features/emails/template.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

import { BASE_URL } from "@/zap.config";

export function TemplateEmail() {
  return (
    <Html>
      <Head />
      <Preview>A simple email from us</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={heading}>Hey there 👋</Text>
          <Text style={paragraph}>
            Just a quick note with a button you can click. No strings attached.
          </Text>
          <Section style={buttonWrapper}>
            <Button href={BASE_URL} style={button}>
              Click me
            </Button>
          </Section>
          <Text style={footer}>
            If the button doesn’t work, you can paste this link into your
            browser:
            <br />
            {BASE_URL}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f9fafb",
  padding: "40px 0",
  fontFamily: "Arial, sans-serif",
};

const container = {
  backgroundColor: "#ffffff",
  padding: "40px",
  borderRadius: "8px",
  maxWidth: "520px",
  margin: "0 auto",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
};

const heading = {
  fontSize: "22px",
  fontWeight: "bold" as const,
  marginBottom: "16px",
  color: "#111827",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "1.5",
  color: "#374151",
  marginBottom: "24px",
};

const buttonWrapper = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const button = {
  backgroundColor: "#000000",
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "6px",
  fontWeight: "bold" as const,
  textDecoration: "none",
  display: "inline-block",
};

const footer = {
  fontSize: "14px",
  color: "#6B7280",
  lineHeight: "1.5",
  wordBreak: "break-word" as const,
};
```