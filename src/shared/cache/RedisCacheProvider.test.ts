import { config } from "@/config/environment";
import { RedisCacheProvider } from "@/shared/cache/RedisCacheProvider";

const mockRedisClient = {
	connect: jest.fn(),
	disconnect: jest.fn(),
	destroy: jest.fn(),
	get: jest.fn(),
	set: jest.fn(),
	setEx: jest.fn(),
	del: jest.fn(),
	exists: jest.fn(),
	keys: jest.fn(),
	ttl: jest.fn(),
	flushAll: jest.fn(),
	on: jest.fn(),
	isOpen: false,
};

jest.mock("redis", () => ({
	createClient: jest.fn(() => mockRedisClient),
}));

describe("RedisCacheProvider", () => {
	let cacheProvider: RedisCacheProvider;

	beforeEach(() => {
		jest.clearAllMocks();
		mockRedisClient.isOpen = false;
		cacheProvider = new RedisCacheProvider();
	});

	describe("constructor", () => {
		it("should create Redis client with correct configuration", () => {
			const { createClient } = require("redis");

			expect(createClient).toHaveBeenCalledWith({
				socket: {
					host: config.redis.host,
					port: config.redis.port,
				},
			});
		});

		it("should set up event listeners", () => {
			expect(mockRedisClient.on).toHaveBeenCalledWith(
				"error",
				expect.any(Function),
			);
			expect(mockRedisClient.on).toHaveBeenCalledWith(
				"connect",
				expect.any(Function),
			);
			expect(mockRedisClient.on).toHaveBeenCalledWith(
				"ready",
				expect.any(Function),
			);
		});
	});

	describe("get", () => {
		beforeEach(() => {
			mockRedisClient.isOpen = true;
		});

		it("should retrieve value from Redis", async () => {
			const key = "test-key";
			const value = JSON.stringify("test-value");
			mockRedisClient.get.mockResolvedValue(value);

			const result = await cacheProvider.get(key);

			expect(mockRedisClient.get).toHaveBeenCalledWith(key);
			expect(result).toBe("test-value");
		});

		it("should return null when key does not exist", async () => {
			const key = "non-existent-key";
			mockRedisClient.get.mockResolvedValue(null);

			const result = await cacheProvider.get(key);

			expect(result).toBeNull();
		});

		it("should handle connection when not connected", async () => {
			mockRedisClient.isOpen = false;
			mockRedisClient.connect.mockResolvedValue(undefined);
			const key = "test-key";
			const value = JSON.stringify("test-value");
			mockRedisClient.get.mockResolvedValue(value);

			const result = await cacheProvider.get(key);

			expect(mockRedisClient.connect).toHaveBeenCalled();
			expect(result).toBe("test-value");
		});

		it("should handle Redis errors and return null", async () => {
			const key = "test-key";
			const error = new Error("Redis error");
			mockRedisClient.get.mockRejectedValue(error);

			const result = await cacheProvider.get(key);
			expect(result).toBeNull();
		});
	});

	describe("set", () => {
		beforeEach(() => {
			mockRedisClient.isOpen = true;
		});

		it("should set value in Redis with default TTL", async () => {
			const key = "test-key";
			const value = "test-value";
			mockRedisClient.setEx.mockResolvedValue("OK");

			await cacheProvider.set(key, value);

			expect(mockRedisClient.setEx).toHaveBeenCalledWith(
				key,
				600,
				JSON.stringify(value),
			);
		});

		it("should set value in Redis with custom TTL", async () => {
			const key = "test-key";
			const value = "test-value";
			const ttl = 3600;
			mockRedisClient.setEx.mockResolvedValue("OK");

			await cacheProvider.set(key, value, ttl);

			expect(mockRedisClient.setEx).toHaveBeenCalledWith(
				key,
				ttl,
				JSON.stringify(value),
			);
		});

		it("should handle connection when not connected", async () => {
			mockRedisClient.isOpen = false;
			mockRedisClient.connect.mockResolvedValue(undefined);
			const key = "test-key";
			const value = "test-value";
			mockRedisClient.setEx.mockResolvedValue("OK");

			await cacheProvider.set(key, value);

			expect(mockRedisClient.connect).toHaveBeenCalled();
			expect(mockRedisClient.setEx).toHaveBeenCalledWith(
				key,
				600,
				JSON.stringify(value),
			);
		});

		it("should handle Redis errors gracefully", async () => {
			const key = "test-key";
			const value = "test-value";
			const error = new Error("Redis error");
			mockRedisClient.setEx.mockRejectedValue(error);

			await expect(cacheProvider.set(key, value)).resolves.toBeUndefined();
		});
	});

	describe("delete", () => {
		beforeEach(() => {
			mockRedisClient.isOpen = true;
		});

		it("should delete key from Redis", async () => {
			const key = "test-key";
			mockRedisClient.del.mockResolvedValue(1);

			await cacheProvider.delete(key);

			expect(mockRedisClient.del).toHaveBeenCalledWith(key);
		});

		it("should handle Redis errors gracefully", async () => {
			const key = "test-key";
			const error = new Error("Redis error");
			mockRedisClient.del.mockRejectedValue(error);

			await expect(cacheProvider.delete(key)).resolves.toBeUndefined();
		});
	});

	describe("deleteByPattern", () => {
		beforeEach(() => {
			mockRedisClient.isOpen = true;
		});

		it("should delete all keys matching pattern", async () => {
			const pattern = "user:*";
			const keys = ["user:1", "user:2", "user:3"];
			mockRedisClient.keys.mockResolvedValue(keys);
			mockRedisClient.del.mockResolvedValue(3);

			await cacheProvider.deleteByPattern(pattern);

			expect(mockRedisClient.keys).toHaveBeenCalledWith(pattern);
			expect(mockRedisClient.del).toHaveBeenCalledWith(keys);
		});

		it("should handle empty key list", async () => {
			const pattern = "user:*";
			mockRedisClient.keys.mockResolvedValue([]);

			await cacheProvider.deleteByPattern(pattern);

			expect(mockRedisClient.keys).toHaveBeenCalledWith(pattern);
			expect(mockRedisClient.del).not.toHaveBeenCalled();
		});

		it("should handle Redis errors gracefully", async () => {
			const pattern = "user:*";
			const error = new Error("Redis error");
			mockRedisClient.keys.mockRejectedValue(error);

			await expect(
				cacheProvider.deleteByPattern(pattern),
			).resolves.toBeUndefined();
		});
	});

	describe("exists", () => {
		beforeEach(() => {
			mockRedisClient.isOpen = true;
		});

		it("should return true when key exists", async () => {
			const key = "test-key";
			mockRedisClient.exists.mockResolvedValue(1);

			const result = await cacheProvider.exists(key);

			expect(mockRedisClient.exists).toHaveBeenCalledWith(key);
			expect(result).toBe(true);
		});

		it("should return false when key does not exist", async () => {
			const key = "test-key";
			mockRedisClient.exists.mockResolvedValue(0);

			const result = await cacheProvider.exists(key);

			expect(result).toBe(false);
		});

		it("should handle Redis errors and return false", async () => {
			const key = "test-key";
			const error = new Error("Redis error");
			mockRedisClient.exists.mockRejectedValue(error);

			const result = await cacheProvider.exists(key);
			expect(result).toBe(false);
		});
	});

	describe("getTtl", () => {
		beforeEach(() => {
			mockRedisClient.isOpen = true;
		});

		it("should return TTL for existing key", async () => {
			const key = "test-key";
			const ttl = 300;
			mockRedisClient.ttl.mockResolvedValue(ttl);

			const result = await cacheProvider.getTtl(key);

			expect(mockRedisClient.ttl).toHaveBeenCalledWith(key);
			expect(result).toBe(ttl);
		});

		it("should return -2 for non-existent key", async () => {
			const key = "test-key";
			mockRedisClient.ttl.mockResolvedValue(-2);

			const result = await cacheProvider.getTtl(key);

			expect(result).toBe(-2);
		});

		it("should handle Redis errors and return -1", async () => {
			const key = "test-key";
			const error = new Error("Redis error");
			mockRedisClient.ttl.mockRejectedValue(error);

			const result = await cacheProvider.getTtl(key);
			expect(result).toBe(-1);
		});
	});

	describe("clear", () => {
		beforeEach(() => {
			mockRedisClient.isOpen = true;
		});

		it("should clear all keys from Redis", async () => {
			mockRedisClient.flushAll.mockResolvedValue("OK");

			await cacheProvider.clear();

			expect(mockRedisClient.flushAll).toHaveBeenCalled();
		});

		it("should handle Redis errors gracefully", async () => {
			const error = new Error("Redis error");
			mockRedisClient.flushAll.mockRejectedValue(error);

			await expect(cacheProvider.clear()).resolves.toBeUndefined();
		});
	});

	describe("disconnect", () => {
		it("should disconnect from Redis when connected", async () => {
			mockRedisClient.isOpen = true;
			mockRedisClient.destroy.mockResolvedValue(undefined);

			await cacheProvider.disconnect();

			expect(mockRedisClient.destroy).toHaveBeenCalled();
		});

		it("should not disconnect when not connected", async () => {
			mockRedisClient.isOpen = false;

			await cacheProvider.disconnect();

			expect(mockRedisClient.destroy).not.toHaveBeenCalled();
		});

		it("should handle disconnection errors gracefully", async () => {
			mockRedisClient.isOpen = true;
			const error = new Error("Disconnection failed");
			mockRedisClient.destroy.mockRejectedValue(error);

			await expect(cacheProvider.disconnect()).resolves.toBeUndefined();
		});
	});
});
