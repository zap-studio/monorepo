import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LogLevel } from "../src";
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

  it("handles unknown log levels via log()", () => {
    logger.log("debug" as LogLevel, message, context);
    expect(logSpy).toHaveBeenCalledWith("[UNKNOWN] hello world", context);
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
});
