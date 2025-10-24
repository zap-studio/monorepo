import { describe, it, expect } from "vitest";
import { generateReferralCode, calculatePosition } from "../src/utils";
import type { EmailEntry, ID } from "../src/types";

describe("generateReferralCode", () => {
	it("returns deterministic code when seed provided", () => {
		const code6 = generateReferralCode(6);
		const code7 = generateReferralCode(7);
		const code8 = generateReferralCode(8);

		expect(code6).toMatch(/^[A-Z0-9]{3}-[A-Z0-9]{3}$/);
		expect(code7).toMatch(/^[A-Z0-9]{3}-[A-Z0-9]{4}$/);
		expect(code8).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
	});

	it("returns random code when no seed", () => {
		const a = generateReferralCode(8);
		const b = generateReferralCode();
		expect(a).not.toEqual(b);
		expect(a).toHaveLength(8 + 1); // including dash
	});
});

describe("calculatePosition", () => {
	const entries: EmailEntry[] = [
		{ id: "1" as ID, email: "a@test.com", createdAt: new Date(1) },
		{ id: "2" as ID, email: "b@test.com", createdAt: new Date(2) },
		{ id: "3" as ID, email: "c@test.com", createdAt: new Date(3) },
	];

	it("returns correct position", () => {
		expect(calculatePosition(entries, "1")).toBe(1);
		expect(calculatePosition(entries, "3")).toBe(3);
	});
});
