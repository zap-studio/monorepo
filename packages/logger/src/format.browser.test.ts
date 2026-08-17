import { afterEach, describe, expect, it, vi } from "vitest";

import type { LogRecord } from "./types.js";

import { classicFormat, compactFormat, jsonFormat, prettyFormat } from "./format.js";

const baseRecord = (overrides: Partial<LogRecord> = {}): LogRecord => ({
  context: undefined,
  level: "info",
  message: "server started",
  timestamp: new Date("2024-01-01T00:00:00.000Z"),
  ...overrides,
});

describe("classicFormat", () => {
  it("returns only the message when context is absent", () => {
    expect(classicFormat(baseRecord())).toStrictEqual(["server started"]);
  });

  it("appends context as a second argument when present", () => {
    const record = baseRecord({ context: { port: 3000 } });
    expect(classicFormat(record)).toStrictEqual(["server started", { port: 3000 }]);
  });
});

describe("jsonFormat", () => {
  it("produces a single JSON string with pino-style field names", () => {
    const [line] = jsonFormat(baseRecord());
    expect(JSON.parse(line as string)).toStrictEqual({
      level: "info",
      msg: "server started",
      time: 1_704_067_200_000,
    });
  });

  it("flattens context fields to the top level", () => {
    const record = baseRecord({ context: { port: 3000 } });
    const [line] = jsonFormat(record);
    expect(JSON.parse(line as string)).toStrictEqual({
      level: "info",
      msg: "server started",
      port: 3000,
      time: 1_704_067_200_000,
    });
  });

  it("never lets a context field override time/level/msg", () => {
    const record = baseRecord({
      context: { level: "hijacked", msg: "hijacked", time: -1 },
    });
    const [line] = jsonFormat(record);
    expect(JSON.parse(line as string)).toStrictEqual({
      level: "info",
      msg: "server started",
      time: 1_704_067_200_000,
    });
  });

  it("serializes Error context values instead of losing them to {}", () => {
    const error = new Error("boom");
    const record = baseRecord({ context: { error } });
    const [line] = jsonFormat(record);
    const parsed = JSON.parse(line as string);
    expect(parsed.error).toMatchObject({ message: "boom", name: "Error" });
    expect(typeof parsed.error.stack).toBe("string");
  });

  it("serializes bigint context values as strings", () => {
    const record = baseRecord({ context: { id: 9_007_199_254_740_993n } });
    const [line] = jsonFormat(record);
    expect(JSON.parse(line as string).id).toBe("9007199254740993");
  });
});

describe("compactFormat", () => {
  it("produces a single logfmt line with pino-style field names", () => {
    const [line] = compactFormat(baseRecord());
    expect(line).toBe('level=info msg="server started" time=2024-01-01T00:00:00.000Z');
  });

  it("flattens context fields to the top level", () => {
    const record = baseRecord({ context: { port: 3000 } });
    const [line] = compactFormat(record);
    expect(line).toBe('port=3000 level=info msg="server started" time=2024-01-01T00:00:00.000Z');
  });

  it("quotes values containing whitespace, quotes, or =", () => {
    const record = baseRecord({
      context: { note: 'has "quotes" and spaces', pair: "a=b" },
    });
    const [line] = compactFormat(record);
    expect(line).toContain('note="has \\"quotes\\" and spaces"');
    expect(line).toContain('pair="a=b"');
  });

  it("leaves bare numbers and booleans unquoted", () => {
    const record = baseRecord({ context: { active: true, port: 3000 } });
    const [line] = compactFormat(record);
    expect(line).toContain("active=true");
    expect(line).toContain("port=3000");
  });

  it("formats Error context values as name: message", () => {
    const record = baseRecord({ context: { error: new Error("boom") } });
    const [line] = compactFormat(record);
    expect(line).toContain('error="Error: boom"');
  });

  it("formats undefined and null context values as bare tokens", () => {
    const record = baseRecord({ context: { a: undefined, b: null } });
    const [line] = compactFormat(record);
    expect(line).toContain("a=undefined");
    expect(line).toContain("b=null");
  });

  it("JSON-stringifies and quotes object/array context values", () => {
    const record = baseRecord({ context: { tags: ["a", "b"] } });
    const [line] = compactFormat(record);
    expect(line).toContain('tags="[\\"a\\",\\"b\\"]"');
  });
});

describe("prettyFormat", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("includes a clock time, the uppercased level, and the message", () => {
    vi.stubGlobal("process", undefined);
    const [prefix] = prettyFormat(baseRecord()) as [string];

    expect(prefix).toMatch(/\d{2}:\d{2}:\d{2}\.\d{3}/);
    expect(prefix).toContain("INFO");
    expect(prefix).toContain("server started");
  });

  it("passes context as a second argument, not inlined into the string", () => {
    const record = baseRecord({ context: { port: 3000 } });
    const args = prettyFormat(record);

    expect(args).toHaveLength(2);
    expect(args[1]).toStrictEqual({ port: 3000 });
  });

  it("colors output when no process global is present", () => {
    vi.stubGlobal("process", undefined);
    const [prefix] = prettyFormat(baseRecord()) as [string];

    expect(prefix).toContain("[");
  });

  it("colors output on a real TTY without NO_COLOR", () => {
    vi.stubGlobal("process", { env: {}, stdout: { isTTY: true } });
    const [prefix] = prettyFormat(baseRecord()) as [string];

    expect(prefix).toContain("[");
  });

  it("skips color when not a TTY", () => {
    vi.stubGlobal("process", { env: {}, stdout: { isTTY: false } });
    const [prefix] = prettyFormat(baseRecord()) as [string];

    expect(prefix).not.toContain("[");
  });

  it("skips color when NO_COLOR is set, even on a TTY", () => {
    vi.stubGlobal("process", {
      env: { NO_COLOR: "1" },
      stdout: { isTTY: true },
    });
    const [prefix] = prettyFormat(baseRecord()) as [string];

    expect(prefix).not.toContain("[");
  });
  it("skips color on Cloudflare Workers, even without a process global", () => {
    vi.stubGlobal("process", undefined);
    vi.stubGlobal("navigator", { userAgent: "Cloudflare-Workers" });
    const [prefix] = prettyFormat(baseRecord()) as [string];

    expect(prefix).not.toContain("\u001b[");
  });
});
