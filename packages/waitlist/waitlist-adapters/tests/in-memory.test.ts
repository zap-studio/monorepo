import type { EmailEntry } from "@zap-studio/waitlist-core/types";
import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryAdapter } from "../src/in-memory";

describe("InMemoryAdapter", () => {
	let adapter: InMemoryAdapter;

	beforeEach(() => {
		adapter = new InMemoryAdapter();
	});

	it("can create and find an entry", async () => {
		const entry: EmailEntry = {
			email: "a@test.com",
			createdAt: new Date(),
		};
		await adapter.create(entry);
		const found = await adapter.findById(entry.email);
		expect(found).toEqual(entry);
	});

	it("can update an entry", async () => {
		const entry = {
			email: "b@test.com",
			createdAt: new Date(),
		};
		await adapter.create(entry);
		const updated = await adapter.update(entry.email, { email: "b2@test.com" });
		expect(updated.email).toBe("b2@test.com");
	});

	it("can delete an entry", async () => {
		const entry = {
			email: "c@test.com",
			createdAt: new Date(),
		};
		await adapter.create(entry);
		await adapter.delete(entry.email);
		const found = await adapter.findById(entry.email);
		expect(found).toBeNull();
	});

	it("can increment referral counter", async () => {
		await adapter.incrementReferral("REF-123");
		const count = await adapter.incrementReferral("REF-123");
		expect(count).toBe(2);
	});
});
