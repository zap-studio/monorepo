import { describe, expect, it } from "vitest";

import { mergeHeaders } from "../src/headers.js";

describe(mergeHeaders, () => {
  it("returns undefined when no headers are provided", () => {
    expect(mergeHeaders()).toBeUndefined();
  });

  it("accepts object, Headers, and tuple inputs", () => {
    const base = new Headers({ A: "1" });
    const tuples: [string, string][] = [["B", "2"]];

    const fromObject = mergeHeaders({ A: "1" });
    const fromHeaders = mergeHeaders(base);
    const fromTuples = mergeHeaders(tuples);

    expect(fromObject?.get("A")).toBe("1");
    expect(fromHeaders?.get("A")).toBe("1");
    expect(fromTuples?.get("B")).toBe("2");
  });

  it("merges headers with override values taking precedence", () => {
    const headers = mergeHeaders({ A: "1", B: "2" }, { B: "20", C: "3" });

    expect(headers?.get("A")).toBe("1");
    expect(headers?.get("B")).toBe("20");
    expect(headers?.get("C")).toBe("3");
  });
});
