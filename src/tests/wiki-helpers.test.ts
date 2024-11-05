import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { getExplorers, api } from "../lib/wiki-helpers";

describe("getExplorers", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("should make network request once and use cache after", async () => {
		const axiosPostSpy = vi.spyOn(api, "post");

		// First call
		const firstCall = await getExplorers();
		expect(axiosPostSpy).toHaveBeenCalledTimes(1);

		// Advance timers
		vi.runAllTimers();

		// Second call should use cache
		const secondCall = await getExplorers();
		expect(axiosPostSpy).toHaveBeenCalledTimes(1); // Stays at 1 due to caching

		// Verify data consistency
		expect(secondCall).toEqual(firstCall);
	});
});
