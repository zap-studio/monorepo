import type { StandardSchemaV1 } from "@standard-schema/spec";

import { describe, expect, it } from "vitest";

import { ValidationError } from "./errors.ts";
import {
  createStandardValidator,
  createStandardValidatorSync,
  isStandardSchema,
  standardValidate,
  standardValidateSync,
} from "./index.ts";

function createMockSchema<T>(
  validateFn: (input: unknown) => StandardSchemaV1.Result<T> | Promise<StandardSchemaV1.Result<T>>,
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
  validateFn: (input: unknown) => StandardSchemaV1.Result<T> | Promise<StandardSchemaV1.Result<T>>,
): StandardSchemaV1<unknown, T> {
  const fn = (): void => undefined;

  Object.assign(fn, {
    "~standard": {
      validate: validateFn,
      vendor: "test",
      version: 1,
    },
  });

  return fn as unknown as StandardSchemaV1<unknown, T>;
}

async function captureRejectedError(run: () => Promise<unknown>): Promise<unknown> {
  try {
    await run();
  } catch (error) {
    return error;
  }

  throw new Error("Expected promise to reject");
}

function captureThrownError(run: () => unknown): unknown {
  try {
    run();
  } catch (error) {
    return error;
  }

  throw new Error("Expected function to throw");
}

describe(ValidationError, () => {
  it("should store issues and stringify them in the message", () => {
    const issues: StandardSchemaV1.Issue[] = [
      { message: "Field is required" },
      { message: "Must be a number" },
    ];

    const error = new ValidationError(issues);

    expect(error.name).toBe("ValidationError");
    expect(error.issues).toStrictEqual(issues);
    expect(error.message).toBe(JSON.stringify(issues, null, 2));
  });
});

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
        validate: (): void => undefined,
      }),
    ).toBeFalsy();

    expect(isStandardSchema({ version: 1 })).toBeFalsy();
  });

  it("should return false for arrays", () => {
    expect(isStandardSchema([])).toBeFalsy();
    expect(isStandardSchema([1, 2, 3])).toBeFalsy();
  });
});

describe(createStandardValidator, () => {
  it("should return a reusable async validator for synchronous schemas", async () => {
    const schema = createMockSchema((input) => ({
      value: String(input),
    }));

    const validate = createStandardValidator(schema);
    const result = await validate(123);

    expect(result).toStrictEqual({ value: "123" });
  });

  it("should return a reusable async validator for asynchronous schemas", async () => {
    const schema = createMockSchema((input) => Promise.resolve({ value: { wrapped: input } }));

    const validate = createStandardValidator(schema);
    const result = await validate("test");

    expect(result).toStrictEqual({ value: { wrapped: "test" } });
  });

  it("should return issues without throwing", async () => {
    const issues: StandardSchemaV1.Issue[] = [{ message: "Invalid value" }];
    const schema = createMockSchema(() => ({ issues }));

    const validate = createStandardValidator(schema);
    const result = await validate("bad");

    expect(result).toStrictEqual({ issues });
  });

  it("should return validated value when throwOnError is true", async () => {
    const schema = createMockSchema((input) => ({
      value: { id: String(input) },
    }));

    const validate = createStandardValidator(schema);
    const result = await validate(42, { throwOnError: true });

    expect(result).toStrictEqual({ id: "42" });
  });

  it("should throw ValidationError when throwOnError is true", async () => {
    const schema = createMockSchema(() => ({
      issues: [{ message: "Invalid value" }],
    }));

    const validate = createStandardValidator(schema);

    await expect(validate("bad", { throwOnError: true })).rejects.toThrow(ValidationError);
  });

  it("should return result object when throwOnError is false", async () => {
    const issues: StandardSchemaV1.Issue[] = [{ message: "Invalid value" }];
    const schema = createMockSchema(() => ({ issues }));

    const validate = createStandardValidator(schema);
    const result = await validate("bad", { throwOnError: false });

    expect(result).toStrictEqual({ issues });
  });
});

describe(createStandardValidatorSync, () => {
  it("should validate using a synchronous Standard Schema and return the result", () => {
    const schema: StandardSchemaV1<unknown, string> = {
      "~standard": {
        validate: (input: unknown) => ({
          value: String(input),
        }),
        vendor: "test",
        version: 1,
      },
    };

    const validate = createStandardValidatorSync(schema);
    const result = validate(123);

    expect(result).toStrictEqual({ value: "123" });
  });

  it("should return issues without throwing", () => {
    const issues: StandardSchemaV1.Issue[] = [{ message: "Invalid value" }];
    const schema = createMockSchema(() => ({ issues }));

    const validate = createStandardValidatorSync(schema);
    const result = validate("bad");

    expect(result).toStrictEqual({ issues });
  });

  it("should return validated value when throwOnError is true", () => {
    const schema = createMockSchema((input) => ({
      value: { id: String(input) },
    }));

    const validate = createStandardValidatorSync(schema);
    const result = validate(42, { throwOnError: true });

    expect(result).toStrictEqual({ id: "42" });
  });

  it("should throw ValidationError when throwOnError is true", () => {
    const schema = createMockSchema(() => ({
      issues: [{ message: "Invalid value" }],
    }));

    const validate = createStandardValidatorSync(schema);

    expect(() => validate("bad", { throwOnError: true })).toThrow(ValidationError);
  });

  it("should return result object when throwOnError is false", () => {
    const issues: StandardSchemaV1.Issue[] = [{ message: "Invalid value" }];
    const schema = createMockSchema(() => ({ issues }));

    const validate = createStandardValidatorSync(schema);
    const result = validate("bad", { throwOnError: false });

    expect(result).toStrictEqual({ issues });
  });

  it("should throw when the schema validate function returns a Promise", () => {
    const schema: StandardSchemaV1<unknown, string> = {
      "~standard": {
        validate: (input: unknown) => Promise.resolve({ value: String(input) }),
        vendor: "test",
        version: 1,
      },
    };

    const validate = createStandardValidatorSync(schema);

    expect(() => validate(123)).toThrow(
      "Async schemas are not supported by createStandardValidatorSync",
    );
  });
});

describe(standardValidate, () => {
  describe("synchronous validation", () => {
    it("should validate data against a synchronous schema", async () => {
      const schema = createMockSchema((input) => ({
        value: input,
      }));

      const result = await standardValidate("test", schema, {
        throwOnError: true,
      });

      expect(result).toBe("test");
    });

    it("should return the validated value when throwOnError is true", async () => {
      const schema = createMockSchema((input) => ({
        value: input,
      }));

      const data = { id: 42 };

      const result = await standardValidate(data, schema, {
        throwOnError: true,
      });

      expect(result).toStrictEqual({ id: 42 });
    });

    it("should return the result object when throwOnError is false", async () => {
      const schema = createMockSchema((input) => ({
        value: input,
      }));

      const result = await standardValidate("test", schema, {
        throwOnError: false,
      });

      expect(result).toStrictEqual({ value: "test" });
    });

    it("should return the result object when options are omitted", async () => {
      const schema = createMockSchema((input) => ({
        value: input,
      }));

      const result = await standardValidate("test", schema);

      expect(result).toStrictEqual({ value: "test" });
    });
  });

  describe("asynchronous validation", () => {
    it("should validate data against an asynchronous schema", async () => {
      const schema = createMockSchema((input) => Promise.resolve({ value: input }));

      const result = await standardValidate("async-test", schema, {
        throwOnError: true,
      });

      expect(result).toBe("async-test");
    });

    it("should await Promise-based validation", async () => {
      const schema = createMockSchema(async (input) => {
        await Promise.resolve();
        return { value: input as number };
      });

      const result = await standardValidate(123, schema, {
        throwOnError: true,
      });

      expect(result).toBe(123);
    });

    it("should return result object when throwOnError is false", async () => {
      const schema = createMockSchema((input) => Promise.resolve({ value: input }));

      const data = { name: "async" };

      const result = await standardValidate(data, schema, {
        throwOnError: false,
      });

      expect(result).toStrictEqual({ value: { name: "async" } });
    });
  });

  describe("validation failure", () => {
    it("should throw ValidationError when throwOnError is true", async () => {
      const schema = createMockSchema(() => ({
        issues: [{ message: "Invalid value" }],
      }));

      await expect(standardValidate("invalid", schema, { throwOnError: true })).rejects.toThrow(
        ValidationError,
      );
    });

    it("should include issues in thrown ValidationError", async () => {
      const issues: StandardSchemaV1.Issue[] = [
        { message: "Field is required" },
        { message: "Must be a number", path: [{ key: "age" }] },
      ];

      const schema = createMockSchema(() => ({ issues }));

      const error = await captureRejectedError(
        async () => await standardValidate({}, schema, { throwOnError: true }),
      );

      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).issues).toStrictEqual(issues);
    });

    it("should return result object with issues when throwOnError is false", async () => {
      const issues: StandardSchemaV1.Issue[] = [{ message: "Validation failed" }];

      const schema = createMockSchema(() => ({ issues }));

      const result = await standardValidate("invalid", schema, {
        throwOnError: false,
      });

      expect(result).toStrictEqual({ issues });
    });

    it("should return result object with issues when options are omitted", async () => {
      const issues: StandardSchemaV1.Issue[] = [{ message: "Validation failed" }];
      const schema = createMockSchema(() => ({ issues }));

      const result = await standardValidate("invalid", schema);

      expect(result).toStrictEqual({ issues });
    });

    it("should not throw when throwOnError is false", async () => {
      const schema = createMockSchema(() => ({
        issues: [{ message: "Error" }],
      }));

      await expect(
        standardValidate("invalid", schema, { throwOnError: false }),
      ).resolves.toBeDefined();
    });

    it("should handle async validation failure with throwOnError true", async () => {
      const schema = createMockSchema(() =>
        Promise.resolve({ issues: [{ message: "Async validation failed" }] }),
      );

      await expect(standardValidate("data", schema, { throwOnError: true })).rejects.toThrow(
        ValidationError,
      );
    });

    it("should handle async validation failure with throwOnError false", async () => {
      const issues: StandardSchemaV1.Issue[] = [{ message: "Async validation failed" }];

      const schema = createMockSchema(() => Promise.resolve({ issues }));

      const result = await standardValidate("data", schema, {
        throwOnError: false,
      });

      expect(result).toStrictEqual({ issues });
    });
  });
});

describe(standardValidateSync, () => {
  describe("synchronous validation", () => {
    it("should validate data against a synchronous schema", () => {
      const schema = createMockSchema((input) => ({
        value: input,
      }));

      const result = standardValidateSync("test", schema, {
        throwOnError: true,
      });

      expect(result).toBe("test");
    });

    it("should return the validated value when throwOnError is true", () => {
      const schema = createMockSchema((input) => ({
        value: input,
      }));

      const data = { id: 42 };

      const result = standardValidateSync(data, schema, {
        throwOnError: true,
      });

      expect(result).toStrictEqual({ id: 42 });
    });

    it("should return the result object when throwOnError is false", () => {
      const schema = createMockSchema((input) => ({
        value: input,
      }));

      const result = standardValidateSync("test", schema, {
        throwOnError: false,
      });

      expect(result).toStrictEqual({ value: "test" });
    });

    it("should return the result object when options are omitted", () => {
      const schema = createMockSchema((input) => ({
        value: input,
      }));

      const result = standardValidateSync("test", schema);

      expect(result).toStrictEqual({ value: "test" });
    });
  });

  describe("validation failure", () => {
    it("should throw ValidationError when throwOnError is true", () => {
      const schema = createMockSchema(() => ({
        issues: [{ message: "Invalid value" }],
      }));

      expect(() => standardValidateSync("invalid", schema, { throwOnError: true })).toThrow(
        ValidationError,
      );
    });

    it("should include issues in thrown ValidationError", () => {
      const issues: StandardSchemaV1.Issue[] = [
        { message: "Field is required" },
        { message: "Must be a number", path: [{ key: "age" }] },
      ];

      const schema = createMockSchema(() => ({ issues }));

      const error = captureThrownError(() =>
        standardValidateSync({}, schema, { throwOnError: true }),
      );

      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).issues).toStrictEqual(issues);
    });

    it("should return result object with issues when throwOnError is false", () => {
      const issues: StandardSchemaV1.Issue[] = [{ message: "Validation failed" }];

      const schema = createMockSchema(() => ({ issues }));

      const result = standardValidateSync("invalid", schema, {
        throwOnError: false,
      });

      expect(result).toStrictEqual({ issues });
    });

    it("should return result object with issues when options are omitted", () => {
      const issues: StandardSchemaV1.Issue[] = [{ message: "Validation failed" }];
      const schema = createMockSchema(() => ({ issues }));

      const result = standardValidateSync("invalid", schema);

      expect(result).toStrictEqual({ issues });
    });

    it("should not throw when throwOnError is false", () => {
      const schema = createMockSchema(() => ({
        issues: [{ message: "Error" }],
      }));

      expect(() => standardValidateSync("invalid", schema, { throwOnError: false })).not.toThrow();
    });
  });

  it("should throw if the schema performs asynchronous validation", () => {
    const schema = createMockSchema((input) => Promise.resolve({ value: input }));

    expect(() => standardValidateSync("test", schema)).toThrow(
      "Async schemas are not supported by standardValidateSync",
    );
  });

  it("should pass through a non-object synchronous result from a malformed schema unchanged", () => {
    const schema = createMockSchema(() => 42 as unknown as StandardSchemaV1.Result<unknown>);

    const result = standardValidateSync("test", schema);

    expect(result).toBe(42);
  });

  it("should throw when a malformed schema synchronously returns null", () => {
    const schema = createMockSchema(() => null as unknown as StandardSchemaV1.Result<unknown>);

    expect(() => standardValidateSync("test", schema)).toThrow();
  });
});
