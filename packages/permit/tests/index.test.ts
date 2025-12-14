import { describe, expect, it } from "vitest";
import { greeting } from "../src";

describe("permit", () => {
  it("should export greeting", () => {
    expect(greeting).toBe("Hello, world!");
  });
});
