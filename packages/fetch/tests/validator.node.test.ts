import type { StandardSchemaV1 } from "@zap-studio/validation";
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
      validate: validateFn,
      vendor: "test",
      version: 1,
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
      validate: validateFn,
      vendor: "test",
      version: 1,
    },
  });
  return fn as unknown as StandardSchemaV1<unknown, T>;
}

async function captureRejectedError(
  run: () => Promise<unknown>
): Promise<unknown> {
  try {
    await run();
  } catch (error) {
    return error;
  }

  throw new Error("Expected promise to reject");
}

describe(isStandardSchema, () => {
  it("should return true for valid Standard Schema objects", () => {
    const schema = createMockSchema(() => ({ value: "test" }));
    expect(isStandardSchema(schema)).toBeTruthy();
  });

  it("should return true for Standard Schema functions", () => {
    const schema = createMockSchemaFunction(() => ({ value: "test" }));
    expect(isStandardSchema(schema)).toBeTruthy();
  });

  it("should return false for null", () => {
    expect(isStandardSchema(null)).toBeFalsy();
  });

  it("should return false for undefined", () => {
    expect(isStandardSchema()).toBeFalsy();
  });

  it("should return false for primitive values", () => {
    expect(isStandardSchema("string")).toBeFalsy();
    expect(isStandardSchema(123)).toBeFalsy();
    expect(isStandardSchema(true)).toBeFalsy();
    expect(isStandardSchema(Symbol("test"))).toBeFalsy();
  });

  it("should return false for objects without ~standard property", () => {
    expect(isStandardSchema({})).toBeFalsy();
    expect(
      isStandardSchema({
        validate: (): void => {
          // noop
        },
      })
    ).toBeFalsy();
    expect(isStandardSchema({ version: 1 })).toBeFalsy();
  });

  it("should return false for arrays", () => {
    expect(isStandardSchema([])).toBeFalsy();
    expect(isStandardSchema([1, 2, 3])).toBeFalsy();
  });

  it("should return true for Zod schemas", () => {
    const schema = z.object({ id: z.number() });
    expect(isStandardSchema(schema)).toBeTruthy();
  });
});

describe(standardValidate, () => {
  describe("synchronous validation", () => {
    it("should validate data against a synchronous schema", async () => {
      const schema = createMockSchema((input) => ({
        value: input,
      }));
      const result = await standardValidate(schema, "test", {
        throwOnError: true,
      });
      expect(result).toBe("test");
    });

    it("should return the validated value when throwOnError is true", async () => {
      const schema = createMockSchema((input) => ({
        value: input,
      }));
      const data = { id: 42 };
      const result = await standardValidate(schema, data, {
        throwOnError: true,
      });
      expect(result).toStrictEqual({ id: 42 });
    });

    it("should return the result object with value when throwOnError is false", async () => {
      const schema = createMockSchema((input) => ({
        value: input,
      }));
      const result = await standardValidate(schema, "test", {
        throwOnError: false,
      });
      expect(result).toStrictEqual({ value: "test" });
    });
  });

  describe("asynchronous validation", () => {
    it("should validate data against an asynchronous schema", async () => {
      const schema = createMockSchema(async (input) => ({
        value: input,
      }));
      const result = await standardValidate(schema, "async-test", {
        throwOnError: true,
      });
      expect(result).toBe("async-test");
    });

    it("should await Promise-based validation and return validated value", async () => {
      const schema = createMockSchema(
         async (input) =>
          new Promise<StandardSchemaV1.Result<number>>((resolve) => {
            setTimeout(() =>{  resolve({ value: input as number }); }, 10);
          })
      );
      const result = await standardValidate(schema, 123, {
        throwOnError: true,
      });
      expect(result).toBe(123);
    });

    it("should await Promise-based validation and return result object when throwOnError is false", async () => {
      const schema = createMockSchema(async (input) => ({
        value: input,
      }));
      const data = { name: "async" };
      const result = await standardValidate(schema, data, {
        throwOnError: false,
      });
      expect(result).toStrictEqual({ value: { name: "async" } });
    });
  });

  describe("validation failure", () => {
    it("should throw ValidationError when validation fails and throwOnError is true", async () => {
      const schema = createMockSchema(() => ({
        issues: [{ message: "Invalid value" }],
      }));

      await expect(
        standardValidate(schema, "invalid", { throwOnError: true })
      ).rejects.toThrow(ValidationError);
    });

    it("should include issues in thrown ValidationError", async () => {
      const issues: StandardSchemaV1.Issue[] = [
        { message: "Field is required", path: [{ key: "name" }] },
        { message: "Must be a number", path: [{ key: "age" }] },
      ];
      const schema = createMockSchema(() => ({ issues }));

      const error = await captureRejectedError( async () =>
        standardValidate(schema, {}, { throwOnError: true })
      );

      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).issues).toStrictEqual(issues);
    });

    it("should return result object with issues when validation fails and throwOnError is false", async () => {
      const issues: StandardSchemaV1.Issue[] = [
        { message: "Validation failed" },
      ];
      const schema = createMockSchema(() => ({ issues }));

      const result = await standardValidate(schema, "invalid", {
        throwOnError: false,
      });
      expect(result).toStrictEqual({ issues });
    });

    it("should not throw when validation fails and throwOnError is false", async () => {
      const schema = createMockSchema(() => ({
        issues: [{ message: "Error" }],
      }));

      await expect(
        standardValidate(schema, "invalid", { throwOnError: false })
      ).resolves.toBeDefined();
    });

    it("should handle async validation failure with throwOnError true", async () => {
      const schema = createMockSchema(async () => ({
        issues: [{ message: "Async validation failed" }],
      }));

      await expect(
        standardValidate(schema, "data", { throwOnError: true })
      ).rejects.toThrow(ValidationError);
    });

    it("should handle async validation failure with throwOnError false", async () => {
      const issues: StandardSchemaV1.Issue[] = [
        { message: "Async validation failed" },
      ];
      const schema = createMockSchema(async () => ({ issues }));

      const result = await standardValidate(schema, "data", {
        throwOnError: false,
      });
      expect(result).toStrictEqual({ issues });
    });
  });

  describe("edge cases", () => {
    it("should handle empty objects", async () => {
      const schema = z.object({});
      const result = await standardValidate(schema, {}, { throwOnError: true });
      expect(result).toStrictEqual({});
    });

    it("should handle nested schemas", async () => {
      const schema = z.object({
        user: z.object({
          profile: z.object({
            age: z.number(),
            name: z.string(),
          }),
        }),
      });

      const data = {
        user: {
          profile: {
            age: 30,
            name: "John",
          },
        },
      };

      const result = await standardValidate(schema, data, {
        throwOnError: true,
      });
      expect(result).toStrictEqual(data);
    });

    it("should handle array schemas", async () => {
      const schema = z.array(z.number());
      const data = [1, 2, 3, 4, 5];
      const result = await standardValidate(schema, data, {
        throwOnError: true,
      });
      expect(result).toStrictEqual(data);
    });

    it("should handle optional fields", async () => {
      const schema = z.object({
        optional: z.string().optional(),
        required: z.string(),
      });

      const dataWithOptional = { optional: "present", required: "value" };
      const dataWithoutOptional = { required: "value" };

      const result1 = await standardValidate(schema, dataWithOptional, {
        throwOnError: true,
      });
      expect(result1).toStrictEqual(dataWithOptional);

      const result2 = await standardValidate(schema, dataWithoutOptional, {
        throwOnError: true,
      });
      expect(result2).toStrictEqual(dataWithoutOptional);
    });

    it("should handle union types", async () => {
      const schema = z.union([z.string(), z.number()]);

      const result1 = await standardValidate(schema, "string", {
        throwOnError: true,
      });
      expect(result1).toBe("string");

      const result2 = await standardValidate(schema, 42, {
        throwOnError: true,
      });
      expect(result2).toBe(42);
    });

    it("should handle transformed values", async () => {
      const schema = z.string().transform((val) => val.toUpperCase());
      const result = await standardValidate(schema, "hello", {
        throwOnError: true,
      });
      expect(result).toBe("HELLO");
    });

    it("should handle nullable fields", async () => {
      const schema = z.object({
        value: z.string().nullable(),
      });

      const result1 = await standardValidate(
        schema,
        { value: "test" },
        { throwOnError: true }
      );
      expect(result1).toStrictEqual({ value: "test" });

      const result2 = await standardValidate(
        schema,
        { value: null },
        { throwOnError: true }
      );
      expect(result2).toStrictEqual({ value: null });
    });
  });
});
