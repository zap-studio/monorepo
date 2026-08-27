import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useFavicon } from "./use-favicon.ts";

const FAVICON_SELECTOR = "link[rel~='icon']";
const ORIGINAL_FAVICON = "/original.svg";
const UPDATED_FAVICON = "/updated.svg";

afterEach(() => {
  for (const link of document.querySelectorAll(FAVICON_SELECTOR)) {
    link.remove();
  }
});

describe("useFavicon", () => {
  it('creates a <link rel="icon"> when none exists', () => {
    renderHook(() => useFavicon("/favicon.svg"));

    const link = document.querySelector<HTMLLinkElement>(FAVICON_SELECTOR);
    expect(link?.href).toContain("/favicon.svg");
  });

  it('reuses an existing <link rel="icon">', () => {
    const existing = document.createElement("link");
    existing.rel = "icon";
    existing.href = ORIGINAL_FAVICON;
    document.head.append(existing);

    renderHook(() => useFavicon(UPDATED_FAVICON));

    expect(document.querySelectorAll(FAVICON_SELECTOR)).toHaveLength(1);
    expect(existing.href).toContain(UPDATED_FAVICON);
  });

  it("updates the href when it changes", () => {
    const { rerender } = renderHook(({ href }: { href: string }) => useFavicon(href), {
      initialProps: { href: "/a.svg" },
    });

    rerender({ href: "/b.svg" });

    const link = document.querySelector<HTMLLinkElement>(FAVICON_SELECTOR);
    expect(link?.href).toContain("/b.svg");
  });

  it("restores the previous href on unmount", () => {
    const existing = document.createElement("link");
    existing.rel = "icon";
    existing.href = ORIGINAL_FAVICON;
    document.head.append(existing);

    const { unmount } = renderHook(() => useFavicon(UPDATED_FAVICON));
    unmount();

    expect(existing.href).toContain(ORIGINAL_FAVICON);
  });
});
