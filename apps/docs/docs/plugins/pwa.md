# PWA Support

Zap.ts comes with built-in Progressive Web App (PWA) support, enabling your application to work offline, load faster, and provide a native app-like experience on mobile and desktop devices. This guide explains how PWA is implemented in Zap.ts, how to configure it, and how to test it in your project.

## What is a PWA?

A Progressive Web App (PWA) is a web application that uses modern web technologies to deliver an app-like experience. Key features include:

- **Offline Functionality**: Works even without an internet connection using service workers.
- **Installability**: Users can "install" the app on their home screen without an app store.
- **Push Notifications**: Engage users with timely updates (optional setup required).
- **Fast Loading**: Caches assets for quick access.

Zap.ts leverages Next.js and its ecosystem to make PWA setup seamless, so you can focus on building your app rather than configuring the plumbing.

## How PWA Works in Zap.ts

Zap.ts integrates PWA support through a pre-configured setup. Here’s how it’s implemented:

1. **Service Worker**: A service worker (`sw.js`) is included to handle caching and offline functionality such as notifications. It’s registered automatically in production builds.
2. **Manifest File**: A web manifest (`manifest.json` or `manifest.ts`) defines metadata like the app’s name, icons, and theme colors, enabling installability.
3. **Next.js Integration**: The `next.config.ts` file includes headers for the service worker, ensuring it’s served correctly and secured with a Content Security Policy (CSP).
4. **Automatic Registration**: Zap.ts uses a lightweight approach to register the service worker without additional client-side code, keeping your app lean.

## Configuring PWA in Zap.ts

PWA support is enabled by default, but you can customize it to fit your needs. Here’s how:

### 1. Update the Manifest

The manifest file defines how your app appears when installed. By default, Zap.ts includes a basic manifest. To customize it:

- **Dynamic Manifest**: If using TypeScript (`src/app/manifest.ts`), modify it like this:

  ```ts
  import type { MetadataRoute } from "next";

  export default function manifest(): MetadataRoute.Manifest {
    return {
      name: "Zap.ts",
      short_name: "Zap.ts",
      description: "The boilerplate to build application as fast as a zap.",
      start_url: "/",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#000000",
      icons: [
        {
          src: "/icon-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/icon-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    };
  }
  ```

- Place your app icons (e.g., `icon-192x192.png`, `icon-512x512.png`) in the `public/` folder.

### 2. Customize the Service Worker (Optional)

The default service worker supports push notifications and notification clicks. To extend it (e.g., for custom caching strategies):

- Locate or create `public/sw.js` (if not provided, you can add it).

  ```js
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

  self.addEventListener("notificationclick", function (event) {
    event.notification.close();
    event.waitUntil(clients.openWindow("<https://your-website.com>"));
  });
  ```

- Modify it to fit your needs. Learn more [here](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers).

### 3. Environment Variables

No specific environment variables are required for PWA, but ensure your `SITE_URL` in `.env.local` matches your deployed domain for accurate manifest references:

```
SITE_URL=https://your-domain.com
```

## Testing PWA Support

### Locally

1. Build and start your app:
   ```bash
   bun run build && bun run start
   ```
2. Open `http://localhost:3000` in Chrome.
3. Use Chrome DevTools:
   - **Application > Manifest**: Verify metadata (name, icons).
   - **Application > Service Workers**: Ensure `sw.js` is registered.
   - **Network**: Toggle "Offline" and refresh to test offline mode.
4. Simulate a push notification using DevTools’ **Push** button under Service Workers.

### After Deployment

1. Deploy to Vercel (see [Vercel Deployment](/docs/deployment/vercel)).
2. Visit your URL (e.g., `https://your-app.vercel.app`).
3. Use Lighthouse:
   - Run a **Progressive Web App** audit in Chrome DevTools.
   - Confirm installability and offline support.
4. Test installability:
   - Look for the install icon in the address bar and add to your home screen.
5. Test push notifications:
   - Subscribe via your frontend and trigger a notification from your backend.

## Troubleshooting

- **Service Worker Not Registering**: Ensure `sw.js` is in `public/` and headers in `next.config.ts` are correct. Clear browser cache and re-deploy.
- **Manifest Errors**: Validate `manifest.json` syntax (use a JSON validator) and ensure icon paths are correct.
- **Offline Not Working**: Check `sw.js` caching logic and verify assets are cached in DevTools > Application > Cache Storage.

## Why PWA in Zap.ts?

- **User Engagement**: Installability and offline access keep users coming back.
- **Performance**: Caching reduces load times, aligning with Zap.ts’s speed focus.
- **No Extra Setup**: Zap.ts provides PWA out of the box, saving you time.

Start zapping with a PWA-ready app today!
