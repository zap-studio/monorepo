import type { StandardSchemaV1 } from "@standard-schema/spec";
import { isStandardSchema, standardValidate } from "@zap-studio/validation";
import { ValidationError } from "@zap-studio/validation/errors";
import { describe, expect, it } from "vitest";
import { z } from "zod";

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
  const fn = (): void => {
    // noop
  };
  Object.assign(fn, {
    "~standard": {
      version: 1,
      vendor: "test",
      validate: validateFn,
    },
  });
  return fn as unknown as StandardSchemaV1<unknown, T>;
}

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
        validate: (): void => {
          // noop
        },
      })
    ).toBe(false);
    expect(isStandardSchema({ version: 1 })).toBe(false);
  });

  it("should return false for arrays", () => {
    expect(isStandardSchema([])).toBe(false);
    expect(isStandardSchema([1, 2, 3])).toBe(false);
  });

  it("should return true for Zod schemas", () => {
    const schema = z.object({ id: z.number() });
    expect(isStandardSchema(schema)).toBe(true);
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
        { message: "Field is required", path: [{ key: "name" }] },
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

  describe("edge cases", () => {
    it("should handle empty objects", async () => {
      const schema = z.object({});
      const result = await standardValidate(schema, {}, true);
      expect(result).toEqual({});
    });

    it("should handle nested schemas", async () => {
      const schema = z.object({
        user: z.object({
          profile: z.object({
            name: z.string(),
            age: z.number(),
          }),
        }),
      });

      const data = {
        user: {
          profile: {
            name: "John",
            age: 30,
          },
        },
      };

      const result = await standardValidate(schema, data, true);
      expect(result).toEqual(data);
    });

    it("should handle array schemas", async () => {
      const schema = z.array(z.number());
      const data = [1, 2, 3, 4, 5];
      const result = await standardValidate(schema, data, true);
      expect(result).toEqual(data);
    });

    it("should handle optional fields", async () => {
      const schema = z.object({
        required: z.string(),
        optional: z.string().optional(),
      });

      const dataWithOptional = { required: "value", optional: "present" };
      const dataWithoutOptional = { required: "value" };

      const result1 = await standardValidate(schema, dataWithOptional, true);
      expect(result1).toEqual(dataWithOptional);

      const result2 = await standardValidate(schema, dataWithoutOptional, true);
      expect(result2).toEqual(dataWithoutOptional);
    });

    it("should handle union types", async () => {
      const schema = z.union([z.string(), z.number()]);

      const result1 = await standardValidate(schema, "string", true);
      expect(result1).toBe("string");

      const result2 = await standardValidate(schema, 42, true);
      expect(result2).toBe(42);
    });

    it("should handle transformed values", async () => {
      const schema = z.string().transform((val) => val.toUpperCase());
      const result = await standardValidate(schema, "hello", true);
      expect(result).toBe("HELLO");
    });

    it("should handle nullable fields", async () => {
      const schema = z.object({
        value: z.string().nullable(),
      });

      const result1 = await standardValidate(schema, { value: "test" }, true);
      expect(result1).toEqual({ value: "test" });

      const result2 = await standardValidate(schema, { value: null }, true);
      expect(result2).toEqual({ value: null });
    });
  });
});
