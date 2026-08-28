import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

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

// SAFETY: useMediaRecorder only ever forwards `stream` straight into `new MediaRecorder(stream, ...)`, which is itself replaced by MockMediaRecorder in every test here, so the hook never calls any MediaStream method on this value — an empty object stand-in is enough.
const fakeStream = {} as MediaStream;

afterEach(() => {
  Object.defineProperty(window, "MediaRecorder", { configurable: true, value: undefined });
});

describe("useMediaRecorder", () => {
  it("reports supported: true when MediaRecorder exists", () => {
    installMockMediaRecorder();

    const { result } = renderHook(() => useMediaRecorder(fakeStream));

    expect(result.current.supported).toBe(true);
    expect(result.current.status).toBe("inactive");
  });

  it("reports supported: false when MediaRecorder is unavailable", () => {
    const { result } = renderHook(() => useMediaRecorder(fakeStream));

    expect(result.current.supported).toBe(false);
  });

  it('start() begins recording, becoming "recording"', () => {
    installMockMediaRecorder();
    const { result } = renderHook(() => useMediaRecorder(fakeStream));

    act(() => {
      result.current.start();
    });

    expect(result.current.status).toBe("recording");
    expect(MockMediaRecorder.instances[0]?.state).toBe("recording");
  });

  it("does not start when no stream is given", () => {
    installMockMediaRecorder();
    const { result } = renderHook(() => useMediaRecorder(undefined));

    act(() => {
      result.current.start();
    });

    expect(result.current.status).toBe("inactive");
    expect(MockMediaRecorder.instances).toHaveLength(0);
  });

  it("assembles a Blob from dataavailable chunks once stopped", () => {
    installMockMediaRecorder();
    const { result } = renderHook(() => useMediaRecorder(fakeStream));

    act(() => {
      result.current.start();
    });

    const recorder = MockMediaRecorder.instances[0];
    act(() => {
      recorder?.dispatchEvent(
        Object.assign(new Event("dataavailable"), { data: new Blob(["chunk"]) }),
      );
    });
    act(() => {
      recorder?.stop();
    });

    expect(result.current.status).toBe("inactive");
    expect(result.current.blob).toBeInstanceOf(Blob);
    expect(result.current.blob?.size).toBeGreaterThan(0);
  });

  it("ignores an empty dataavailable chunk", () => {
    installMockMediaRecorder();
    const { result } = renderHook(() => useMediaRecorder(fakeStream));

    act(() => {
      result.current.start();
    });

    const recorder = MockMediaRecorder.instances[0];
    act(() => {
      recorder?.dispatchEvent(Object.assign(new Event("dataavailable"), { data: new Blob([]) }));
    });
    act(() => {
      recorder?.stop();
    });

    expect(result.current.blob?.size).toBe(0);
  });

  it("pause() pauses an active recording", () => {
    installMockMediaRecorder();
    const { result } = renderHook(() => useMediaRecorder(fakeStream));

    act(() => {
      result.current.start();
    });
    act(() => {
      result.current.pause();
    });

    expect(result.current.status).toBe("paused");
  });

  it("pause() is a no-op when not recording", () => {
    installMockMediaRecorder();
    const { result } = renderHook(() => useMediaRecorder(fakeStream));

    act(() => {
      result.current.pause();
    });

    expect(result.current.status).toBe("inactive");
  });

  it("resume() resumes a paused recording", () => {
    installMockMediaRecorder();
    const { result } = renderHook(() => useMediaRecorder(fakeStream));

    act(() => {
      result.current.start();
    });
    act(() => {
      result.current.pause();
    });
    act(() => {
      result.current.resume();
    });

    expect(result.current.status).toBe("recording");
  });

  it("resume() is a no-op when not paused", () => {
    installMockMediaRecorder();
    const { result } = renderHook(() => useMediaRecorder(fakeStream));

    act(() => {
      result.current.resume();
    });

    expect(result.current.status).toBe("inactive");
  });

  it("reports an error when the recorder fires an error event", () => {
    installMockMediaRecorder();
    const { result } = renderHook(() => useMediaRecorder(fakeStream));

    act(() => {
      result.current.start();
    });
    act(() => {
      MockMediaRecorder.instances[0]?.dispatchEvent(new Event("error"));
    });

    expect(result.current.status).toBe("inactive");
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it("clears a previous error and blob when starting again", () => {
    installMockMediaRecorder();
    const { result } = renderHook(() => useMediaRecorder(fakeStream));

    act(() => {
      result.current.start();
    });
    act(() => {
      MockMediaRecorder.instances[0]?.dispatchEvent(new Event("error"));
    });
    expect(result.current.error).toBeDefined();

    act(() => {
      result.current.start();
    });

    expect(result.current.error).toBeUndefined();
  });

  it("isTypeSupported() reflects MediaRecorder.isTypeSupported() when supported", () => {
    installMockMediaRecorder();
    const { result } = renderHook(() => useMediaRecorder(fakeStream));

    expect(result.current.isTypeSupported(WEBM_MIME_TYPE)).toBe(true);
    expect(result.current.isTypeSupported("video/mp4")).toBe(false);
  });

  it("isTypeSupported() returns false when MediaRecorder is unavailable", () => {
    const { result } = renderHook(() => useMediaRecorder(fakeStream));

    expect(result.current.isTypeSupported(WEBM_MIME_TYPE)).toBe(false);
  });

  it("does not throw when stop()/pause()/resume() are called while unsupported", () => {
    const { result } = renderHook(() => useMediaRecorder(fakeStream));

    expect(() => {
      act(() => {
        result.current.stop();
        result.current.pause();
        result.current.resume();
      });
    }).not.toThrow();
  });

  it("stops an active recorder on unmount", () => {
    installMockMediaRecorder();
    const { result, unmount } = renderHook(() => useMediaRecorder(fakeStream));

    act(() => {
      result.current.start();
    });

    unmount();

    expect(MockMediaRecorder.instances[0]?.state).toBe("inactive");
  });
});

describe("useMediaRecorder option stability", () => {
  it("keeps start stable across renders with an inline options object", () => {
    const stream = new MediaStream();
    const { rerender, result } = renderHook(() =>
      useMediaRecorder(stream, { mimeType: WEBM_MIME_TYPE }),
    );
    const first = result.current.start;

    rerender();

    expect(result.current.start).toBe(first);
  });
});
