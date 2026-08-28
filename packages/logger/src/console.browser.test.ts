import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { LogRecord } from "./types.ts";

import { ConsoleLogger } from "./console.ts";
import { jsonFormat } from "./format.ts";

describe("ConsoleLogger", () => {
  let debugSpy: ReturnType<typeof vi.spyOn>;
  let infoSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    debugSpy = vi.spyOn(console, "debug").mockImplementation(() => undefined);
    infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    debugSpy.mockRestore();
    infoSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("defaults minLevel to info, suppressing trace and debug", () => {
    const logger = new ConsoleLogger();

    logger.trace("t");
    logger.debug("d");
    logger.info("i");

    expect(debugSpy).not.toHaveBeenCalled();
    expect(infoSpy).toHaveBeenCalledExactlyOnceWith("i");
  });

  it("maps trace and debug to console.debug", () => {
    const logger = new ConsoleLogger({ minLevel: "all" });

    logger.trace("t");
    logger.debug("d");

    expect(debugSpy).toHaveBeenNthCalledWith(1, "t");
    expect(debugSpy).toHaveBeenNthCalledWith(2, "d");
  });

  it("maps info to console.info", () => {
    const logger = new ConsoleLogger({ minLevel: "all" });

    logger.info("i");

    expect(infoSpy).toHaveBeenCalledExactlyOnceWith("i");
  });

  it("maps warn to console.warn", () => {
    const logger = new ConsoleLogger({ minLevel: "all" });

    logger.warn("w");

    expect(warnSpy).toHaveBeenCalledExactlyOnceWith("w");
  });

  it("maps error and fatal to console.error", () => {
    const logger = new ConsoleLogger({ minLevel: "all" });

    logger.error("e");
    logger.fatal("f");

    expect(errorSpy).toHaveBeenNthCalledWith(1, "e");
    expect(errorSpy).toHaveBeenNthCalledWith(2, "f");
  });

  it("passes context as a second console argument when provided", () => {
    const logger = new ConsoleLogger({ minLevel: "all" });

    logger.info("i", { requestId: "abc" });

    expect(infoSpy).toHaveBeenCalledExactlyOnceWith("i", {
      requestId: "abc",
    });
  });

  it("omits the second console argument when context is not provided", () => {
    const logger = new ConsoleLogger({ minLevel: "all" });

    logger.info("i");

    expect(infoSpy).toHaveBeenCalledExactlyOnceWith("i");
  });

  it("filters out every call when minLevel is none", () => {
    const logger = new ConsoleLogger({ minLevel: "none" });

    logger.trace("t");
    logger.debug("d");
    logger.info("i");
    logger.warn("w");
    logger.error("e");
    logger.fatal("f");

    expect(debugSpy).not.toHaveBeenCalled();
    expect(infoSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("respects a warn minLevel, suppressing info and below", () => {
    const logger = new ConsoleLogger({ minLevel: "warn" });

    logger.info("i");
    logger.warn("w");
    logger.error("e");

    expect(infoSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledExactlyOnceWith("w");
    expect(errorSpy).toHaveBeenCalledExactlyOnceWith("e");
  });

  it("defaults to classicFormat, passing message and context through unchanged", () => {
    const logger = new ConsoleLogger({ minLevel: "all" });

    logger.info("i", { requestId: "abc" });

    expect(infoSpy).toHaveBeenCalledExactlyOnceWith("i", {
      requestId: "abc",
    });
  });

  it("uses a custom format when provided", () => {
    const logger = new ConsoleLogger({
      format: jsonFormat,
      minLevel: "all",
    });

    logger.info("i", { requestId: "abc" });

    expect(infoSpy).toHaveBeenCalledTimes(1);
    // SAFETY: the toHaveBeenCalledTimes check above proves calls[0] exists. jsonFormat returns a tuple with one string, so the only console.info argument is a string.
    const [line] = infoSpy.mock.calls[0] as [string];
    expect(JSON.parse(line)).toMatchObject({
      level: "info",
      msg: "i",
      requestId: "abc",
    });
  });

  it("passes a fresh timestamp to the format on every call", () => {
    const records: LogRecord[] = [];
    const logger = new ConsoleLogger({
      format: (record) => {
        records.push(record);
        return [record.message];
      },
      minLevel: "all",
    });

    logger.info("i");

    expect(records).toHaveLength(1);
    expect(records[0]?.timestamp).toBeInstanceOf(Date);
  });
});
