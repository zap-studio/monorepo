import { describe, expect, it } from "vitest";
import { assertNever } from "../src/helpers";

describe("assertNever", () => {
  describe("runtime behavior", () => {
    it("should throw an error when called", () => {
      expect(() => {
        assertNever("unexpected" as never);
      }).toThrow();
    });

    it("should include the unexpected value in the error message", () => {
      expect(() => {
        assertNever("unexpected" as never);
      }).toThrow("Unexpected value: unexpected");
    });

    it("should handle number values", () => {
      expect(() => {
        assertNever(42 as never);
      }).toThrow("Unexpected value: 42");
    });

    it("should handle boolean values", () => {
      expect(() => {
        assertNever(true as never);
      }).toThrow("Unexpected value: true");
    });

    it("should handle null value", () => {
      expect(() => {
        assertNever(null as never);
      }).toThrow("Unexpected value: null");
    });

    it("should handle undefined value", () => {
      expect(() => {
        assertNever(undefined as never);
      }).toThrow("Unexpected value: undefined");
    });

    it("should handle object values", () => {
      expect(() => {
        assertNever({ key: "value" } as never);
      }).toThrow("Unexpected value: [object Object]");
    });

    it("should handle array values", () => {
      expect(() => {
        assertNever([1, 2, 3] as never);
      }).toThrow("Unexpected value: 1,2,3");
    });

    it("should handle symbol values", () => {
      const sym = Symbol("test");
      expect(() => {
        assertNever(sym as never);
      }).toThrow();
    });
  });

  describe("use case: exhaustive switch", () => {
    type Action = "read" | "write";

    function performAction(action: Action): string {
      switch (action) {
        case "read":
          return "Reading...";
        case "write":
          return "Writing...";
        default:
          return assertNever(action);
      }
    }

    it("should not be called when all cases are handled", () => {
      expect(performAction("read")).toBe("Reading...");
      expect(performAction("write")).toBe("Writing...");
    });

    it("should throw when an unhandled case is encountered at runtime", () => {
      const invalidAction = "delete" as Action;

      expect(() => {
        performAction(invalidAction);
      }).toThrow("Unexpected value: delete");
    });
  });

  describe("use case: discriminated union", () => {
    type Shape =
      | { kind: "circle"; radius: number }
      | { kind: "square"; side: number };

    function getArea(shape: Shape): number {
      switch (shape.kind) {
        case "circle":
          return Math.PI * shape.radius ** 2;
        case "square":
          return shape.side ** 2;
        default:
          return assertNever(shape);
      }
    }

    it("should handle all discriminated union cases", () => {
      expect(getArea({ kind: "circle", radius: 1 })).toBeCloseTo(Math.PI);
      expect(getArea({ kind: "square", side: 2 })).toBe(4);
    });

    it("should throw for unhandled discriminant values", () => {
      // @ts-expect-error we expect this to fail at compile time
      const triangle = { kind: "triangle", base: 3, height: 4 } as Shape;

      expect(() => {
        getArea(triangle);
      }).toThrow("Unexpected value: [object Object]");
    });
  });

  describe("error type", () => {
    it("should throw an Error instance", () => {
      let thrownError: Error | null = null;

      try {
        assertNever("test" as never);
      } catch (e) {
        if (e instanceof Error) {
          thrownError = e;
        }
      }

      expect(thrownError).toBeInstanceOf(Error);
    });

    it("should be catchable in try-catch", () => {
      let caught = false;

      try {
        assertNever("test" as never);
      } catch {
        caught = true;
      }

      expect(caught).toBe(true);
    });
  });
});
