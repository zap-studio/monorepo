import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConsoleLogger } from "../src/console";

describe("ConsoleLogger", () => {
  const logger = new ConsoleLogger();
  const message = "hello world";
  const context = { requestId: "req-1" };
  const err = new Error("boom");

  let logSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {
      // No-op
    });
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {
      // No-op
    });
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {
      // No-op
    });
  });

  afterEach(() => {
    logSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("logs info messages via log()", () => {
    logger.log("info", message, context);
    expect(logSpy).toHaveBeenCalledWith("[INFO] hello world", context);
  });

  it("logs warning messages via log()", () => {
    logger.log("warn", message, context);
    expect(warnSpy).toHaveBeenCalledWith("[WARN] hello world", context);
  });

  it("logs error messages via log()", () => {
    logger.log("error", message, context);
    expect(errorSpy).toHaveBeenCalledWith("[ERROR] hello world", context);
  });

  it("logs info messages via info()", () => {
    logger.info(message, context);
    expect(logSpy).toHaveBeenCalledWith("[INFO] hello world", context);
  });

  it("logs warning messages via warn()", () => {
    logger.warn(message, context);
    expect(warnSpy).toHaveBeenCalledWith("[WARN] hello world", context);
  });

  it("logs error messages via error()", () => {
    logger.error(message, err, context);
    expect(errorSpy).toHaveBeenCalledWith("[ERROR] hello world", err, context);
  });

  it("logs unknown levels via write()", () => {
    const rawLogger = logger as unknown as {
      write: (
        level: string,
        message: string,
        context?: Record<string, unknown>
      ) => void;
    };

    rawLogger.write("debug", "[DEBUG] hello world", context);
    expect(logSpy).toHaveBeenCalledWith("[DEBUG] hello world", context);
  });

  it("logs error messages without error details", () => {
    logger.error(message, undefined, context);
    expect(errorSpy).toHaveBeenCalledWith("[ERROR] hello world", context);
  });

  it("prepends ISO timestamps when enabled", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-26T08:30:00.000Z"));

    const timedLogger = new ConsoleLogger({ timestamp: true });

    timedLogger.info(message, context);

    expect(logSpy).toHaveBeenCalledWith(
      "[INFO] 2026-01-26T08:30:00.000Z hello world",
      context
    );

    vi.useRealTimers();
  });
});
