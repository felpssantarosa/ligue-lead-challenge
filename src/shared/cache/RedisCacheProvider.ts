import { createClient, type RedisClientType } from "redis";
import { injectable } from "tsyringe";
import { config } from "@/config/environment";
import { ApplicationError } from "@/shared/Errors";
import type { CacheProvider } from "./CacheProvider";

@injectable()
export class RedisCacheProvider implements CacheProvider {
	private client: RedisClientType;
	private readonly defaultTtl = 600; // 10 minutes in seconds

	constructor() {
		this.client = createClient({
			socket: {
				host: config.redis.host,
				port: config.redis.port,
			},
		});

		this.client.on("error", (error) => {
			console.error("Redis Client Error:", error);
		});

		this.client.on("connect", () => {
			console.log("Redis Client Connected");
		});

		this.client.on("ready", () => {
			console.log("Redis Client Ready");
		});

		this.connect();
	}

	private async connect(): Promise<void> {
		try {
			if (!this.client.isOpen) {
				await this.client.connect();
			}
		} catch (error) {
			console.error("Failed to connect to Redis:", error);
			throw new ApplicationError({
				message: "Failed to connect to Redis cache",
				trace: "RedisCacheProvider.connect",
			});
		}
	}

	private async ensureConnection(): Promise<void> {
		if (!this.client.isOpen) {
			await this.connect();
		}
	}

	async get<T>(key: string): Promise<T | null> {
		try {
			await this.ensureConnection();
			const value = await this.client.get(key);

			if (!value) {
				return null;
			}

			return JSON.parse(value) as T;
		} catch (error) {
			console.error(`Cache get error for key ${key}:`, error);
			return null;
		}
	}

	async set<T>(key: string, value: T, ttlInSeconds?: number): Promise<void> {
		try {
			await this.ensureConnection();
			const serializedValue = JSON.stringify(value);
			const ttl = ttlInSeconds ?? this.defaultTtl;

			await this.client.setEx(key, ttl, serializedValue);
		} catch (error) {
			console.error(`Cache set error for key ${key}:`, error);
		}
	}

	async delete(key: string): Promise<void> {
		try {
			await this.ensureConnection();
			await this.client.del(key);
		} catch (error) {
			console.error(`Cache delete error for key ${key}:`, error);
		}
	}

	async deleteByPattern(pattern: string): Promise<void> {
		try {
			await this.ensureConnection();
			const keys = await this.client.keys(pattern);

			if (keys.length > 0) {
				await this.client.del(keys);
			}
		} catch (error) {
			console.error(
				`Cache deleteByPattern error for pattern ${pattern}:`,
				error,
			);
		}
	}

	async exists(key: string): Promise<boolean> {
		try {
			await this.ensureConnection();
			const result = await this.client.exists(key);
			return result === 1;
		} catch (error) {
			console.error(`Cache exists error for key ${key}:`, error);
			return false;
		}
	}

	async clear(): Promise<void> {
		try {
			await this.ensureConnection();
			await this.client.flushAll();
		} catch (error) {
			console.error("Cache clear error:", error);
		}
	}

	async getTtl(key: string): Promise<number> {
		try {
			await this.ensureConnection();
			return await this.client.ttl(key);
		} catch (error) {
			console.error(`Cache getTtl error for key ${key}:`, error);
			return -1;
		}
	}

	async disconnect(): Promise<void> {
		try {
			if (this.client.isOpen) await this.client.destroy();
		} catch (error) {
			console.error("Error disconnecting from Redis:", error);
		}
	}
}
