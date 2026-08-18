import { describe, expect, it, vi } from "vitest";

import type { Logger } from "./index.ts";

import { ConsoleLogger } from "./index.ts";

describe("index", () => {
  it("exports ConsoleLogger constructible as a Logger", () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);

    const logger: Logger = new ConsoleLogger();
    logger.info("hello");

    expect(infoSpy).toHaveBeenCalledExactlyOnceWith("hello");

    infoSpy.mockRestore();
  });
});
