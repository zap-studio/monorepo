import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useInstallPrompt } from "./use-install-prompt.ts";

type BeforeInstallPromptTestEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const makeBeforeInstallPromptEvent = (
  outcome: "accepted" | "dismissed",
): BeforeInstallPromptTestEvent => {
  const event = new Event("beforeinstallprompt", { cancelable: true });
  return Object.assign(event, {
    prompt: vi.fn(() => Promise.resolve()),
    userChoice: Promise.resolve({ outcome, platform: "web" }),
  });
};

describe("useInstallPrompt", () => {
  it("starts with canInstall: false, installed: false", () => {
    const { result } = renderHook(() => useInstallPrompt());

    expect(result.current.canInstall).toBe(false);
    expect(result.current.installed).toBe(false);
  });

  it("becomes canInstall: true and prevents the default prompt on beforeinstallprompt", async () => {
    const { result } = renderHook(() => useInstallPrompt());
    const event = makeBeforeInstallPromptEvent("accepted");

    await act(async () => {
      window.dispatchEvent(event);
    });

    expect(result.current.canInstall).toBe(true);
    expect(event.defaultPrevented).toBe(true);
  });

  it("promptInstall() calls prompt(), resolves the outcome, and resets canInstall", async () => {
    const { result } = renderHook(() => useInstallPrompt());
    const event = makeBeforeInstallPromptEvent("accepted");

    await act(async () => {
      window.dispatchEvent(event);
    });

    let outcome: string = "";
    await act(async () => {
      outcome = await result.current.promptInstall();
    });

    expect(event.prompt).toHaveBeenCalledTimes(1);
    expect(outcome).toBe("accepted");
    expect(result.current.canInstall).toBe(false);
  });

  it('promptInstall() returns "unavailable" when no prompt is deferred', async () => {
    const { result } = renderHook(() => useInstallPrompt());

    let outcome: string = "";
    await act(async () => {
      outcome = await result.current.promptInstall();
    });

    expect(outcome).toBe("unavailable");
  });

  it("becomes installed: true on appinstalled, clearing canInstall", async () => {
    const { result } = renderHook(() => useInstallPrompt());
    const event = makeBeforeInstallPromptEvent("accepted");

    await act(async () => {
      window.dispatchEvent(event);
    });
    expect(result.current.canInstall).toBe(true);

    await act(async () => {
      window.dispatchEvent(new Event("appinstalled"));
    });

    expect(result.current.installed).toBe(true);
    expect(result.current.canInstall).toBe(false);
  });

  it("removes listeners on unmount", async () => {
    const { result, unmount } = renderHook(() => useInstallPrompt());
    unmount();

    await act(async () => {
      window.dispatchEvent(makeBeforeInstallPromptEvent("accepted"));
    });

    expect(result.current.canInstall).toBe(false);
  });
});
