import "reflect-metadata";
import { MockCacheProvider } from "@/test/mocks/cache/MockCacheProvider";

describe("MockCacheProvider", () => {
	let cacheProvider: MockCacheProvider;

	beforeEach(() => {
		cacheProvider = new MockCacheProvider();
	});

	describe("get and set", () => {
		it("should store and retrieve values", async () => {
			const key = "test-key";
			const value = { id: "1", name: "Test" };

			await cacheProvider.set(key, value);
			const result = await cacheProvider.get(key);

			expect(result).toEqual(value);
		});

		it("should return null for non-existent keys", async () => {
			const result = await cacheProvider.get("non-existent");
			expect(result).toBeNull();
		});

		it("should respect TTL and expire entries", async () => {
			const key = "expiring-key";
			const value = "test-value";

			await cacheProvider.set(key, value, 1);

			let result = await cacheProvider.get(key);
			expect(result).toBe(value);

			await new Promise((resolve) => setTimeout(resolve, 1100));

			result = await cacheProvider.get(key);
			expect(result).toBeNull();
		});
	});

	describe("delete", () => {
		it("should delete individual keys", async () => {
			const key = "delete-test";
			const value = "test-value";

			await cacheProvider.set(key, value);
			await cacheProvider.delete(key);

			const result = await cacheProvider.get(key);
			expect(result).toBeNull();
		});
	});

	describe("deleteByPattern", () => {
		it("should delete keys matching wildcard patterns", async () => {
			await cacheProvider.set("user:1", "user1");
			await cacheProvider.set("user:2", "user2");
			await cacheProvider.set("product:1", "product1");

			await cacheProvider.deleteByPattern("user:*");

			expect(await cacheProvider.get("user:1")).toBeNull();
			expect(await cacheProvider.get("user:2")).toBeNull();
			expect(await cacheProvider.get("product:1")).toBe("product1");
		});

		it("should handle complex patterns", async () => {
			await cacheProvider.set("ligue-lead:project:123", "project");
			await cacheProvider.set("ligue-lead:projects:list:p1_l10_abc", "list");
			await cacheProvider.set("other:project:123", "other");

			await cacheProvider.deleteByPattern("ligue-lead:project*");

			expect(await cacheProvider.get("ligue-lead:project:123")).toBeNull();
			expect(
				await cacheProvider.get("ligue-lead:projects:list:p1_l10_abc"),
			).toBeNull();
			expect(await cacheProvider.get("other:project:123")).toBe("other");
		});
	});

	describe("exists", () => {
		it("should return true for existing keys", async () => {
			const key = "exists-test";
			await cacheProvider.set(key, "value");

			const exists = await cacheProvider.exists(key);
			expect(exists).toBe(true);
		});

		it("should return false for non-existent keys", async () => {
			const exists = await cacheProvider.exists("non-existent");
			expect(exists).toBe(false);
		});

		it("should return false for expired keys", async () => {
			const key = "expired-key";
			await cacheProvider.set(key, "value", 1);

			await new Promise((resolve) => setTimeout(resolve, 1100));

			const exists = await cacheProvider.exists(key);
			expect(exists).toBe(false);
		});
	});

	describe("clear", () => {
		it("should remove all entries", async () => {
			await cacheProvider.set("key1", "value1");
			await cacheProvider.set("key2", "value2");

			await cacheProvider.clear();

			expect(await cacheProvider.get("key1")).toBeNull();
			expect(await cacheProvider.get("key2")).toBeNull();
		});
	});

	describe("getTtl", () => {
		it("should return TTL for existing keys", async () => {
			const key = "ttl-test";
			await cacheProvider.set(key, "value", 60);

			const ttl = await cacheProvider.getTtl(key);
			expect(ttl).toBeGreaterThan(50);
			expect(ttl).toBeLessThanOrEqual(60);
		});

		it("should return -1 for non-existent keys", async () => {
			const ttl = await cacheProvider.getTtl("non-existent");
			expect(ttl).toBe(-1);
		});

		it("should return -1 for expired keys", async () => {
			const key = "expired-ttl";
			await cacheProvider.set(key, "value", 1);

			await new Promise((resolve) => setTimeout(resolve, 1100));

			const ttl = await cacheProvider.getTtl(key);
			expect(ttl).toBe(-1);
		});
	});
});
