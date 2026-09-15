import { afterEach, describe, expect, it } from "vitest";

import { act, renderHook } from "../../tests/_react.ts";
import { asTestDouble } from "../../tests/_test-double.ts";
import { useMediaRecorder } from "./use-media-recorder.ts";

const WEBM_MIME_TYPE = "video/webm";

class MockMediaRecorder extends EventTarget {
  static readonly instances: MockMediaRecorder[] = [];

  static isTypeSupported(mimeType: string) {
    return mimeType === WEBM_MIME_TYPE;
  }
  state: "inactive" | "paused" | "recording" = "inactive";
  readonly mimeType = WEBM_MIME_TYPE;
  readonly stream: MediaStream;

  constructor(stream: MediaStream) {
    super();
    this.stream = stream;
    MockMediaRecorder.instances.push(this);
  }

  pause() {
    this.state = "paused";
  }

  resume() {
    this.state = "recording";
  }

  start() {
    this.state = "recording";
  }

  stop() {
    this.state = "inactive";
    this.dispatchEvent(new Event("stop"));
  }
}

const installMockMediaRecorder = () => {
  MockMediaRecorder.instances.length = 0;
  Object.defineProperty(window, "MediaRecorder", { configurable: true, value: MockMediaRecorder });
};

const fakeStream = asTestDouble<MediaStream>({});

afterEach(() => {
  Reflect.deleteProperty(window, "MediaRecorder");
});

describe("useMediaRecorder", () => {
  it("reports supported: true when MediaRecorder exists", async () => {
    installMockMediaRecorder();

    const { result } = await renderHook(() => useMediaRecorder(fakeStream));

    expect(result.current.supported).toBe(true);
    expect(result.current.status).toBe("inactive");
  });

  it("reports supported: false when MediaRecorder is unavailable", async () => {
    const { result } = await renderHook(() => useMediaRecorder(fakeStream));

    expect(result.current.supported).toBe(false);
  });

  it('start() begins recording, becoming "recording"', async () => {
    installMockMediaRecorder();
    const { result } = await renderHook(() => useMediaRecorder(fakeStream));

    await act(() => {
      result.current.start();
    });

    expect(result.current.status).toBe("recording");
    expect(MockMediaRecorder.instances[0]?.state).toBe("recording");
  });

  it("does not start when no stream is given", async () => {
    installMockMediaRecorder();
    const { result } = await renderHook(() => useMediaRecorder(undefined));

    await act(() => {
      result.current.start();
    });

    expect(result.current.status).toBe("inactive");
    expect(MockMediaRecorder.instances).toHaveLength(0);
  });

  it("assembles a Blob from dataavailable chunks once stopped", async () => {
    installMockMediaRecorder();
    const { result } = await renderHook(() => useMediaRecorder(fakeStream));

    await act(() => {
      result.current.start();
    });

    const recorder = MockMediaRecorder.instances[0];
    await act(() => {
      recorder?.dispatchEvent(
        Object.assign(new Event("dataavailable"), { data: new Blob(["chunk"]) }),
      );
    });
    await act(() => {
      recorder?.stop();
    });

    expect(result.current.status).toBe("inactive");
    expect(result.current.blob).toBeInstanceOf(Blob);
    expect(result.current.blob?.size).toBeGreaterThan(0);
  });

  it("ignores an empty dataavailable chunk", async () => {
    installMockMediaRecorder();
    const { result } = await renderHook(() => useMediaRecorder(fakeStream));

    await act(() => {
      result.current.start();
    });

    const recorder = MockMediaRecorder.instances[0];
    await act(() => {
      recorder?.dispatchEvent(Object.assign(new Event("dataavailable"), { data: new Blob([]) }));
    });
    await act(() => {
      recorder?.stop();
    });

    expect(result.current.blob?.size).toBe(0);
  });

  it("pause() pauses an active recording", async () => {
    installMockMediaRecorder();
    const { result } = await renderHook(() => useMediaRecorder(fakeStream));

    await act(() => {
      result.current.start();
    });
    await act(() => {
      result.current.pause();
    });

    expect(result.current.status).toBe("paused");
  });

  it("pause() is a no-op when not recording", async () => {
    installMockMediaRecorder();
    const { result } = await renderHook(() => useMediaRecorder(fakeStream));

    await act(() => {
      result.current.pause();
    });

    expect(result.current.status).toBe("inactive");
  });

  it("resume() resumes a paused recording", async () => {
    installMockMediaRecorder();
    const { result } = await renderHook(() => useMediaRecorder(fakeStream));

    await act(() => {
      result.current.start();
    });
    await act(() => {
      result.current.pause();
    });
    await act(() => {
      result.current.resume();
    });

    expect(result.current.status).toBe("recording");
  });

  it("resume() is a no-op when not paused", async () => {
    installMockMediaRecorder();
    const { result } = await renderHook(() => useMediaRecorder(fakeStream));

    await act(() => {
      result.current.resume();
    });

    expect(result.current.status).toBe("inactive");
  });

  it("reports an error when the recorder fires an error event", async () => {
    installMockMediaRecorder();
    const { result } = await renderHook(() => useMediaRecorder(fakeStream));

    await act(() => {
      result.current.start();
    });
    await act(() => {
      MockMediaRecorder.instances[0]?.dispatchEvent(new Event("error"));
    });

    expect(result.current.status).toBe("inactive");
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it("clears a previous error and blob when starting again", async () => {
    installMockMediaRecorder();
    const { result } = await renderHook(() => useMediaRecorder(fakeStream));

    await act(() => {
      result.current.start();
    });
    await act(() => {
      MockMediaRecorder.instances[0]?.dispatchEvent(new Event("error"));
    });
    expect(result.current.error).toBeDefined();

    await act(() => {
      result.current.start();
    });

    expect(result.current.error).toBeUndefined();
  });

  it("isTypeSupported() reflects MediaRecorder.isTypeSupported() when supported", async () => {
    installMockMediaRecorder();
    const { result } = await renderHook(() => useMediaRecorder(fakeStream));

    expect(result.current.isTypeSupported(WEBM_MIME_TYPE)).toBe(true);
    expect(result.current.isTypeSupported("video/mp4")).toBe(false);
  });

  it("isTypeSupported() returns false when MediaRecorder is unavailable", async () => {
    const { result } = await renderHook(() => useMediaRecorder(fakeStream));

    expect(result.current.isTypeSupported(WEBM_MIME_TYPE)).toBe(false);
  });

  it("does not throw when stop()/pause()/resume() are called while unsupported", async () => {
    const { result } = await renderHook(() => useMediaRecorder(fakeStream));

    expect(async () => {
      await act(() => {
        result.current.stop();
        result.current.pause();
        result.current.resume();
      });
    }).not.toThrow();
  });

  it("stops an active recorder on unmount", async () => {
    installMockMediaRecorder();
    const { result, unmount } = await renderHook(() => useMediaRecorder(fakeStream));

    await act(() => {
      result.current.start();
    });

    await unmount();

    expect(MockMediaRecorder.instances[0]?.state).toBe("inactive");
  });
});

describe("useMediaRecorder option stability", () => {
  it("keeps start stable across renders with an inline options object", async () => {
    const stream = new MediaStream();
    const { rerender, result } = await renderHook(() =>
      useMediaRecorder(stream, { mimeType: WEBM_MIME_TYPE }),
    );
    const first = result.current.start;

    await rerender();

    expect(result.current.start).toBe(first);
  });
});
