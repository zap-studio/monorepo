import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useNotificationPermission } from "./use-notification-permission.ts";

const TestComponent = () => {
  const { permission } = useNotificationPermission();
  return permission;
};

describe("useNotificationPermission", () => {
  it('renders "unsupported" on the server, before Notification can be read', () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("unsupported");
  });
});
