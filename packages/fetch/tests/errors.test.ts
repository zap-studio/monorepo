import type { StandardSchemaV1 } from "@standard-schema/spec";
import { describe, expect, it } from "vitest";
import { FetchError, ValidationError } from "../src/errors";

describe("FetchError", () => {
  describe("constructor", () => {
    it("should create an error with the provided message", () => {
      const mockResponse = new Response(null, { status: 404 });
      const error = new FetchError("Not Found", mockResponse);

      expect(error.message).toBe("Not Found");
    });

    it("should set the name property to 'FetchError'", () => {
      const mockResponse = new Response(null, { status: 500 });
      const error = new FetchError("Server Error", mockResponse);

      expect(error.name).toBe("FetchError");
    });

    it("should set the status property from the response", () => {
      const mockResponse = new Response(null, { status: 403 });
      const error = new FetchError("Forbidden", mockResponse);

      expect(error.status).toBe(403);
    });

    it("should set the response property", () => {
      const mockResponse = new Response(null, { status: 401 });
      const error = new FetchError("Unauthorized", mockResponse);

      expect(error.response).toBe(mockResponse);
    });
  });

  describe("inheritance", () => {
    it("should be an instance of Error", () => {
      const mockResponse = new Response(null, { status: 500 });
      const error = new FetchError("Error", mockResponse);

      expect(error).toBeInstanceOf(Error);
    });

    it("should be catchable as an Error", () => {
      const mockResponse = new Response(null, { status: 500 });

      expect(() => {
        throw new FetchError("Test Error", mockResponse);
      }).toThrow(Error);
    });
  });

  describe("properties", () => {
    it("should expose status code from response", () => {
      const mockResponse = new Response(null, { status: 418 });
      const error = new FetchError("I'm a teapot", mockResponse);

      expect(error.status).toBe(418);
      expect(error.response.status).toBe(418);
    });

    it("should expose the full response object", () => {
      const mockResponse = new Response(
        JSON.stringify({ error: "Not Found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
      const error = new FetchError("Not Found", mockResponse);

      expect(error.response).toBe(mockResponse);
      expect(error.response.headers.get("Content-Type")).toBe(
        "application/json"
      );
    });

    it("should have correct message format", () => {
      const mockResponse = new Response(null, { status: 400 });
      const customMessage = "Bad Request: Invalid parameters";
      const error = new FetchError(customMessage, mockResponse);

      expect(error.message).toBe(customMessage);
    });
  });
});

describe("ValidationError", () => {
  describe("constructor", () => {
    it("should create an error with issues as JSON message", () => {
      const issues: StandardSchemaV1.Issue[] = [
        {
          message: "Invalid email",
          path: ["email"],
        },
      ];
      const error = new ValidationError(issues);

      expect(error.message).toBe(JSON.stringify(issues, null, 2));
    });

    it("should set the name property to 'ValidationError'", () => {
      const issues: StandardSchemaV1.Issue[] = [
        {
          message: "Required field",
          path: ["name"],
        },
      ];
      const error = new ValidationError(issues);

      expect(error.name).toBe("ValidationError");
    });

    it("should set the issues property", () => {
      const issues: StandardSchemaV1.Issue[] = [
        {
          message: "Invalid value",
          path: ["age"],
        },
      ];
      const error = new ValidationError(issues);

      expect(error.issues).toBe(issues);
    });
  });

  describe("inheritance", () => {
    it("should be an instance of Error", () => {
      const issues: StandardSchemaV1.Issue[] = [];
      const error = new ValidationError(issues);

      expect(error).toBeInstanceOf(Error);
    });

    it("should be catchable as an Error", () => {
      const issues: StandardSchemaV1.Issue[] = [
        {
          message: "Test issue",
          path: ["test"],
        },
      ];

      expect(() => {
        throw new ValidationError(issues);
      }).toThrow(Error);
    });
  });

  describe("issues property", () => {
    it("should contain the validation issues array", () => {
      const issues: StandardSchemaV1.Issue[] = [
        {
          message: "Invalid email format",
          path: ["email"],
        },
        {
          message: "Password too short",
          path: ["password"],
        },
      ];
      const error = new ValidationError(issues);

      expect(error.issues).toEqual(issues);
      expect(error.issues).toHaveLength(2);
    });

    it("should handle single issue", () => {
      const issues: StandardSchemaV1.Issue[] = [
        {
          message: "Required field",
          path: ["username"],
        },
      ];
      const error = new ValidationError(issues);

      expect(error.issues).toHaveLength(1);
      expect(error.issues[0]?.message).toBe("Required field");
      expect(error.issues[0]?.path).toEqual(["username"]);
    });

    it("should handle multiple issues", () => {
      const issues: StandardSchemaV1.Issue[] = [
        {
          message: "Invalid email",
          path: ["email"],
        },
        {
          message: "Invalid phone",
          path: ["phone"],
        },
        {
          message: "Invalid age",
          path: ["age"],
        },
      ];
      const error = new ValidationError(issues);

      expect(error.issues).toHaveLength(3);
      expect(error.issues[0]?.message).toBe("Invalid email");
      expect(error.issues[1]?.message).toBe("Invalid phone");
      expect(error.issues[2]?.message).toBe("Invalid age");
    });

    it("should handle empty issues array", () => {
      const issues: StandardSchemaV1.Issue[] = [];
      const error = new ValidationError(issues);

      expect(error.issues).toEqual([]);
      expect(error.issues).toHaveLength(0);
    });
  });

  describe("message formatting", () => {
    it("should format issues as pretty-printed JSON", () => {
      const issues: StandardSchemaV1.Issue[] = [
        {
          message: "Invalid value",
          path: ["field"],
        },
      ];
      const error = new ValidationError(issues);
      const expectedMessage = JSON.stringify(issues, null, 2);

      expect(error.message).toBe(expectedMessage);
      expect(error.message).toContain("Invalid value");
      expect(error.message).toContain("field");
    });

    it("should include issue path information", () => {
      const issues: StandardSchemaV1.Issue[] = [
        {
          message: "Invalid nested field",
          path: ["user", "profile", "email"],
        },
      ];
      const error = new ValidationError(issues);

      expect(error.message).toContain("user");
      expect(error.message).toContain("profile");
      expect(error.message).toContain("email");
    });

    it("should include issue message information", () => {
      const issues: StandardSchemaV1.Issue[] = [
        {
          message: "Value must be a positive number",
          path: ["amount"],
        },
      ];
      const error = new ValidationError(issues);

      expect(error.message).toContain("Value must be a positive number");
    });
  });
});
