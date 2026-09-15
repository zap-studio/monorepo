import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

import { act, renderHook } from "../../tests/_react.ts";
import { useDropzone, useFileDrop, type UseFileDropResult } from "./use-file-drop.ts";

interface MutableBox {
  current: HTMLDivElement | null;
}

const dragEventWithFiles = (type: string, files: File[]): DragEvent => {
  const dataTransfer = new DataTransfer();
  for (const file of files) {
    dataTransfer.items.add(file);
  }
  return new DragEvent(type, { dataTransfer });
};

const renderDropzone = async (onDrop: (files: File[]) => void) => {
  let latest!: UseFileDropResult<HTMLDivElement>;
  const TestComponent = () => {
    latest = useFileDrop<HTMLDivElement>(onDrop);
    return createElement("div", { ref: latest.ref });
  };
  const { unmount } = await render(createElement(TestComponent));
  return {
    get current() {
      return latest;
    },
    unmount,
  };
};

describe("useFileDrop", () => {
  it("starts with isOver: false", async () => {
    const zone = await renderDropzone(() => {});

    expect(zone.current.isOver).toBe(false);
  });

  it("becomes true on dragenter", async () => {
    const zone = await renderDropzone(() => {});

    await act(() => {
      zone.current.ref.current?.dispatchEvent(new DragEvent("dragenter", { cancelable: true }));
    });

    expect(zone.current.isOver).toBe(true);
  });

  it("becomes false on dragleave", async () => {
    const zone = await renderDropzone(() => {});

    await act(() => {
      zone.current.ref.current?.dispatchEvent(new DragEvent("dragenter", { cancelable: true }));
    });
    expect(zone.current.isOver).toBe(true);

    await act(() => {
      zone.current.ref.current?.dispatchEvent(new DragEvent("dragleave"));
    });

    expect(zone.current.isOver).toBe(false);
  });

  it("calls onDrop with the dropped files and resets isOver", async () => {
    const onDrop = vi.fn<(files: File[]) => void>();
    const zone = await renderDropzone(onDrop);
    const file = new File(["hello"], "hello.txt", { type: "text/plain" });

    await act(() => {
      zone.current.ref.current?.dispatchEvent(new DragEvent("dragenter", { cancelable: true }));
    });

    await act(() => {
      zone.current.ref.current?.dispatchEvent(dragEventWithFiles("drop", [file]));
    });

    expect(onDrop).toHaveBeenCalledTimes(1);
    const [files] = onDrop.mock.calls[0] ?? [];
    expect(files?.map((f) => f.name)).toEqual(["hello.txt"]);
    expect(zone.current.isOver).toBe(false);
  });

  it("calls onDrop with an empty array when the drop event has no dataTransfer", async () => {
    const onDrop = vi.fn<(files: File[]) => void>();
    const zone = await renderDropzone(onDrop);

    await act(() => {
      zone.current.ref.current?.dispatchEvent(new DragEvent("drop"));
    });

    expect(onDrop).toHaveBeenCalledWith([]);
  });

  it("prevents the default browser behavior on dragover", async () => {
    const zone = await renderDropzone(() => {});
    const event = new DragEvent("dragover", { cancelable: true });

    await act(() => {
      zone.current.ref.current?.dispatchEvent(event);
    });

    expect(event.defaultPrevented).toBe(true);
  });

  it("calls the latest onDrop without re-subscribing", async () => {
    const first = vi.fn<(files: File[]) => void>();
    const second = vi.fn<(files: File[]) => void>();
    const box: MutableBox = { current: null };
    const TestComponent = ({ onDrop }: { onDrop: (files: File[]) => void }) => {
      const { ref } = useFileDrop<HTMLDivElement>(onDrop);
      return createElement("div", {
        ref: (node: HTMLDivElement | null) => {
          box.current = node;
          ref.current = node;
        },
      });
    };
    const { rerender } = await render(createElement(TestComponent, { onDrop: first }));

    await rerender(createElement(TestComponent, { onDrop: second }));
    await act(() => {
      box.current?.dispatchEvent(dragEventWithFiles("drop", []));
    });

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("does not attach listeners when no element is attached to the ref", () => {
    expect(async () => {
      await renderHook(() => useFileDrop(() => {}));
    }).not.toThrow();
  });

  it("removes listeners on unmount", async () => {
    const onDrop = vi.fn<(files: File[]) => void>();
    const zone = await renderDropzone(onDrop);
    const element = zone.current.ref.current;

    await zone.unmount();

    await act(() => {
      element?.dispatchEvent(dragEventWithFiles("drop", []));
    });

    expect(onDrop).not.toHaveBeenCalled();
  });

  it("exposes useDropzone as an alias for the same hook", () => {
    expect(useDropzone).toBe(useFileDrop);
  });
});

describe("useFileDrop ref tracking", () => {
  it("wires up a drop target that only attaches after the first render", async () => {
    const onDrop = vi.fn<(files: File[]) => void>();
    let latest!: UseFileDropResult<HTMLDivElement>;
    const TestComponent = ({ show }: { show: boolean }) => {
      latest = useFileDrop<HTMLDivElement>(onDrop);
      return show ? createElement("div", { ref: latest.ref }) : null;
    };
    const { rerender } = await render(createElement(TestComponent, { show: false }));

    await rerender(createElement(TestComponent, { show: true }));
    const file = new File(["x"], "late.txt", { type: "text/plain" });
    await act(() => {
      latest.ref.current?.dispatchEvent(dragEventWithFiles("drop", [file]));
    });

    expect(onDrop).toHaveBeenCalledWith([file]);
  });
});
