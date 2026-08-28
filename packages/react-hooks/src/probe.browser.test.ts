import { describe, expect, it } from "vitest";

describe("probe own-property locations", () => {
  it("reports where things live", () => {
    const report = {
      documentStartViewTransitionOwn: Object.prototype.hasOwnProperty.call(
        document,
        "startViewTransition",
      ),
      documentStartViewTransitionProtoOwn: Object.prototype.hasOwnProperty.call(
        Document.prototype,
        "startViewTransition",
      ),
      documentStartViewTransitionType: typeof document.startViewTransition,
      performanceGetEntriesByTypeOwn: Object.prototype.hasOwnProperty.call(
        performance,
        "getEntriesByType",
      ),
      performanceGetEntriesByTypeProtoOwn: Object.prototype.hasOwnProperty.call(
        Performance.prototype,
        "getEntriesByType",
      ),
      windowSpeechRecognitionOwn: Object.prototype.hasOwnProperty.call(window, "SpeechRecognition"),
      windowSpeechRecognitionType: typeof (window as unknown as Record<string, unknown>)
        .SpeechRecognition,
      windowNotificationOwn: Object.prototype.hasOwnProperty.call(window, "Notification"),
      windowDeviceOrientationEventOwn: Object.prototype.hasOwnProperty.call(
        window,
        "DeviceOrientationEvent",
      ),
      windowSpeechSynthesisOwn: Object.prototype.hasOwnProperty.call(window, "speechSynthesis"),
      windowSpeechSynthesisUtteranceOwn: Object.prototype.hasOwnProperty.call(
        window,
        "SpeechSynthesisUtterance",
      ),
    };
    // eslint-disable-next-line no-console
    console.log("PROBE_REPORT", JSON.stringify(report, null, 2));
    expect(report).toBeTruthy();
  });
});
