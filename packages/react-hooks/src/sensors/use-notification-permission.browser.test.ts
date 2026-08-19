import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useNotificationPermission } from "./use-notification-permission.ts";

class MockNotification {
  static permission: NotificationPermission = "default";
  static requestPermission = vi.fn<() => Promise<NotificationPermission>>();

  readonly title: string;
  readonly body: string | undefined;

  constructor(title: string, options?: NotificationOptions) {
    this.title = title;
    this.body = options?.body;
  }

  close() {}
}

function setMockNotification(permission: NotificationPermission) {
  MockNotification.permission = permission;
  Object.defineProperty(window, "Notification", { configurable: true, value: MockNotification });
}

describe(useNotificationPermission, () => {
  it("reports the current Notification.permission", () => {
    setMockNotification("default");

    const { result } = renderHook(() => useNotificationPermission());

    expect(result.current.permission).toBe("default");
  });

  it("updates permission after requestPermission resolves", async () => {
    setMockNotification("default");
    MockNotification.requestPermission.mockResolvedValue("granted");

    const { result } = renderHook(() => useNotificationPermission());

    await act(async () => {
      await result.current.requestPermission();
    });

    expect(result.current.permission).toBe("granted");
  });

  it("notify no-ops and returns undefined when permission is not granted", () => {
    setMockNotification("denied");

    const { result } = renderHook(() => useNotificationPermission());

    expect(result.current.notify("Hi")).toBeUndefined();
  });

  it("notify creates a Notification when permission is granted", () => {
    setMockNotification("granted");

    const { result } = renderHook(() => useNotificationPermission());
    const notification = result.current.notify("Hi", { body: "there" });

    expect(notification).toBeInstanceOf(MockNotification);
    expect(notification?.title).toBe("Hi");
    expect(notification?.body).toBe("there");
  });

  it('requestPermission resolves "denied" without calling the API when unsupported', async () => {
    Object.defineProperty(window, "Notification", { configurable: true, value: undefined });

    const { result } = renderHook(() => useNotificationPermission());
    expect(result.current.permission).toBe("unsupported");

    await act(async () => {
      const resolved = await result.current.requestPermission();
      expect(resolved).toBe("denied");
    });
  });
});
