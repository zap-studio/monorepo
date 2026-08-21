import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useFavicon } from "./use-favicon.ts";

afterEach(() => {
  document.querySelectorAll("link[rel~='icon']").forEach((link) => link.remove());
});

describe(useFavicon, () => {
  it('creates a <link rel="icon"> when none exists', () => {
    renderHook(() => useFavicon("/favicon.svg"));

    const link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    expect(link?.href).toContain("/favicon.svg");
  });

  it('reuses an existing <link rel="icon">', () => {
    const existing = document.createElement("link");
    existing.rel = "icon";
    existing.href = "/original.svg";
    document.head.append(existing);

    renderHook(() => useFavicon("/updated.svg"));

    expect(document.querySelectorAll("link[rel~='icon']")).toHaveLength(1);
    expect(existing.href).toContain("/updated.svg");
  });

  it("updates the href when it changes", () => {
    const { rerender } = renderHook(({ href }: { href: string }) => useFavicon(href), {
      initialProps: { href: "/a.svg" },
    });

    rerender({ href: "/b.svg" });

    const link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    expect(link?.href).toContain("/b.svg");
  });

  it("restores the previous href on unmount", () => {
    const existing = document.createElement("link");
    existing.rel = "icon";
    existing.href = "/original.svg";
    document.head.append(existing);

    const { unmount } = renderHook(() => useFavicon("/updated.svg"));
    unmount();

    expect(existing.href).toContain("/original.svg");
  });
});
