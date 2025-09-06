const VIBRATION_DURATION = 100;
const VIBRATION_PAUSE = 50;
const NOTIFICATION_VIBRATION_PATTERN = [
  VIBRATION_DURATION,
  VIBRATION_PAUSE,
  VIBRATION_DURATION,
];

self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || "/icon.png",
      badge: "/badge.png",
      vibrate: NOTIFICATION_VIBRATION_PATTERN,
      data: {
        dateOfArrival: Date.now(),
        primaryKey: "2",
      },
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("https://demo.zap-ts.zapstudio.dev")); // Make sure the URL matches your app's URL
});
