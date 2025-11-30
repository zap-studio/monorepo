import { describe, it } from "vitest";

describe("FetchError", () => {
  describe("constructor", () => {
    it.todo("should create an error with the provided message");
    it.todo("should set the name property to 'FetchError'");
    it.todo("should set the status property from the response");
    it.todo("should set the response property");
  });

  describe("inheritance", () => {
    it.todo("should be an instance of Error");
    it.todo("should be catchable as an Error");
  });

  describe("properties", () => {
    it.todo("should expose status code from response");
    it.todo("should expose the full response object");
    it.todo("should have correct message format");
  });
});

describe("ValidationError", () => {
  describe("constructor", () => {
    it.todo("should create an error with issues as JSON message");
    it.todo("should set the name property to 'ValidationError'");
    it.todo("should set the issues property");
  });

  describe("inheritance", () => {
    it.todo("should be an instance of Error");
    it.todo("should be catchable as an Error");
  });

  describe("issues property", () => {
    it.todo("should contain the validation issues array");
    it.todo("should handle single issue");
    it.todo("should handle multiple issues");
    it.todo("should handle empty issues array");
  });

  describe("message formatting", () => {
    it.todo("should format issues as pretty-printed JSON");
    it.todo("should include issue path information");
    it.todo("should include issue message information");
  });
});
