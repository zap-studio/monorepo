import { afterEach, describe, expect, it, vi } from "vitest";

import { renderHook } from "../../tests/_react.ts";
import { useTextSelection } from "./use-text-selection.ts";

const SELECTED_TEXT = "hello world";

const selectText = (element: HTMLElement) => {
  const range = document.createRange();
  range.selectNodeContents(element);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
};

afterEach(() => {
  window.getSelection()?.removeAllRanges();
  document.body.replaceChildren();
});

describe("useTextSelection", () => {
  it("starts with an empty selection", async () => {
    const { result } = await renderHook(() => useTextSelection());

    expect(result.current).toBe("");
  });

  it("updates to the selected text on selectionchange", async () => {
    const paragraph = document.createElement("p");
    paragraph.textContent = SELECTED_TEXT;
    document.body.append(paragraph);

    const { result } = await renderHook(() => useTextSelection());
    selectText(paragraph);

    await vi.waitFor(() => expect(result.current).toBe(SELECTED_TEXT));
  });

  it("falls back to an empty string when getSelection() returns null", async () => {
    const spy = vi.spyOn(window, "getSelection").mockReturnValue(null);

    const { result } = await renderHook(() => useTextSelection());

    expect(result.current).toBe("");
    spy.mockRestore();
  });

  it("stops updating after unmount", async () => {
    const paragraph = document.createElement("p");
    paragraph.textContent = SELECTED_TEXT;
    document.body.append(paragraph);

    const { result, unmount } = await renderHook(() => useTextSelection());
    await unmount();
    selectText(paragraph);

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(result.current).toBe("");
  });
});
