import { describe, expect, it, vi } from "vitest";

import { ConsoleLogger } from "./index.js";
import type { Logger } from "./index.js";

describe("index", () => {
  it("exports ConsoleLogger constructible as a Logger", () => {
    const infoSpy = vi
      .spyOn(console, "info")
      .mockImplementation(() => undefined);

    const logger: Logger = new ConsoleLogger();
    logger.info("hello");

    expect(infoSpy).toHaveBeenCalledExactlyOnceWith("hello");

    infoSpy.mockRestore();
  });
});
