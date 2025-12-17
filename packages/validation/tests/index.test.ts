import type { StandardSchemaV1 } from "@standard-schema/spec";
import { describe, expect, it } from "vitest";
import {
  createSyncStandardValidator,
  isStandardSchema,
  standardValidate,
} from "../src";
import { ValidationError } from "../src/errors";

function createMockSchema<T>(
  validateFn: (
    input: unknown
  ) => StandardSchemaV1.Result<T> | Promise<StandardSchemaV1.Result<T>>
): StandardSchemaV1<unknown, T> {
  return {
    "~standard": {
      version: 1,
      vendor: "test",
      validate: validateFn,
    },
  };
}

function createMockSchemaFunction<T>(
  validateFn: (
    input: unknown
  ) => StandardSchemaV1.Result<T> | Promise<StandardSchemaV1.Result<T>>
): StandardSchemaV1<unknown, T> {
  const fn = (): void => undefined;
  Object.assign(fn, {
    "~standard": {
      version: 1,
      vendor: "test",
      validate: validateFn,
    },
  });
  return fn as unknown as StandardSchemaV1<unknown, T>;
}

describe("ValidationError", () => {
  it("should store issues and stringify them in the message", () => {
    const issues: StandardSchemaV1.Issue[] = [
      { message: "Field is required" },
      { message: "Must be a number" },
    ];
    const error = new ValidationError(issues);
    expect(error.name).toBe("ValidationError");
    expect(error.issues).toEqual(issues);
    expect(error.message).toBe(JSON.stringify(issues, null, 2));
  });
});

describe("isStandardSchema", () => {
  it("should return true for valid Standard Schema objects", () => {
    const schema = createMockSchema(() => ({ value: "test" }));
    expect(isStandardSchema(schema)).toBe(true);
  });

  it("should return true for Standard Schema functions", () => {
    const schema = createMockSchemaFunction(() => ({ value: "test" }));
    expect(isStandardSchema(schema)).toBe(true);
  });

  it("should return false for null", () => {
    expect(isStandardSchema(null)).toBe(false);
  });

  it("should return false for undefined", () => {
    expect(isStandardSchema(undefined)).toBe(false);
  });

  it("should return false for primitive values", () => {
    expect(isStandardSchema("string")).toBe(false);
    expect(isStandardSchema(123)).toBe(false);
    expect(isStandardSchema(true)).toBe(false);
    expect(isStandardSchema(Symbol("test"))).toBe(false);
  });

  it("should return false for objects without ~standard property", () => {
    expect(isStandardSchema({})).toBe(false);
    expect(
      isStandardSchema({
        validate: (): void => undefined,
      })
    ).toBe(false);
    expect(isStandardSchema({ version: 1 })).toBe(false);
  });

  it("should return false for arrays", () => {
    expect(isStandardSchema([])).toBe(false);
    expect(isStandardSchema([1, 2, 3])).toBe(false);
  });
});

describe("standardValidate", () => {
  describe("synchronous validation", () => {
    it("should validate data against a synchronous schema", async () => {
      const schema = createMockSchema((input) => ({
        value: input,
      }));
      const result = await standardValidate(schema, "test", true);
      expect(result).toBe("test");
    });

    it("should return the validated value when throwOnError is true", async () => {
      const schema = createMockSchema((input) => ({
        value: input,
      }));
      const data = { id: 42 };
      const result = await standardValidate(schema, data, true);
      expect(result).toEqual({ id: 42 });
    });

    it("should return the result object with value when throwOnError is false", async () => {
      const schema = createMockSchema((input) => ({
        value: input,
      }));
      const result = await standardValidate(schema, "test", false);
      expect(result).toEqual({ value: "test" });
    });
  });

  describe("asynchronous validation", () => {
    it("should validate data against an asynchronous schema", async () => {
      const schema = createMockSchema(async (input) => ({
        value: input,
      }));
      const result = await standardValidate(schema, "async-test", true);
      expect(result).toBe("async-test");
    });

    it("should await Promise-based validation and return validated value", async () => {
      const schema = createMockSchema(
        (input) =>
          new Promise<StandardSchemaV1.Result<number>>((resolve) => {
            setTimeout(() => resolve({ value: input as number }), 10);
          })
      );
      const result = await standardValidate(schema, 123, true);
      expect(result).toBe(123);
    });

    it("should await Promise-based validation and return result object when throwOnError is false", async () => {
      const schema = createMockSchema(async (input) => ({
        value: input,
      }));
      const data = { name: "async" };
      const result = await standardValidate(schema, data, false);
      expect(result).toEqual({ value: { name: "async" } });
    });
  });

  describe("validation failure", () => {
    it("should throw ValidationError when validation fails and throwOnError is true", async () => {
      const schema = createMockSchema(() => ({
        issues: [{ message: "Invalid value" }],
      }));

      await expect(standardValidate(schema, "invalid", true)).rejects.toThrow(
        ValidationError
      );
    });

    it("should include issues in thrown ValidationError", async () => {
      const issues: StandardSchemaV1.Issue[] = [
        { message: "Field is required" },
        { message: "Must be a number", path: [{ key: "age" }] },
      ];
      const schema = createMockSchema(() => ({ issues }));

      try {
        await standardValidate(schema, {}, true);
        expect.fail("Should have thrown ValidationError");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).issues).toEqual(issues);
      }
    });

    it("should return result object with issues when validation fails and throwOnError is false", async () => {
      const issues: StandardSchemaV1.Issue[] = [
        { message: "Validation failed" },
      ];
      const schema = createMockSchema(() => ({ issues }));

      const result = await standardValidate(schema, "invalid", false);
      expect(result).toEqual({ issues });
    });

    it("should not throw when validation fails and throwOnError is false", async () => {
      const schema = createMockSchema(() => ({
        issues: [{ message: "Error" }],
      }));

      await expect(
        standardValidate(schema, "invalid", false)
      ).resolves.toBeDefined();
    });

    it("should handle async validation failure with throwOnError true", async () => {
      const schema = createMockSchema(async () => ({
        issues: [{ message: "Async validation failed" }],
      }));

      await expect(standardValidate(schema, "data", true)).rejects.toThrow(
        ValidationError
      );
    });

    it("should handle async validation failure with throwOnError false", async () => {
      const issues: StandardSchemaV1.Issue[] = [
        { message: "Async validation failed" },
      ];
      const schema = createMockSchema(async () => ({ issues }));

      const result = await standardValidate(schema, "data", false);
      expect(result).toEqual({ issues });
    });
  });
});

describe("createSyncStandardValidator", () => {
  it("should validate using a synchronous Standard Schema and return the result", () => {
    const schema: StandardSchemaV1<unknown, string> = {
      "~standard": {
        version: 1,
        vendor: "test",
        validate: (input: unknown) => ({
          value: String(input),
        }),
      },
    };

    const validate = createSyncStandardValidator(schema);
    const result = validate(123);

    expect(result).toEqual({ value: "123" });
  });

  it("should throw an error when the schema validate function returns a Promise", () => {
    const schema: StandardSchemaV1<unknown, string> = {
      "~standard": {
        version: 1,
        vendor: "test",
        validate: async (input: unknown) => ({
          value: String(input),
        }),
      },
    };

    const validate = createSyncStandardValidator(schema);

    expect(() => validate(123)).toThrowError(
      "Async schemas are not supported by createSyncStandardValidator"
    );
  });
});
