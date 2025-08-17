import type { CacheProvider } from "@/shared/cache";

export class MockCacheProvider implements CacheProvider {
	private cache = new Map<string, { value: unknown; expiresAt: number }>();

	async get<T>(key: string): Promise<T | null> {
		const item = this.cache.get(key);

		if (!item) return null;

		if (Date.now() > item.expiresAt) {
			this.cache.delete(key);
			return null;
		}

		return item.value as T;
	}

	async set<T>(key: string, value: T, ttlInSeconds = 600): Promise<void> {
		const expiresAt = Date.now() + ttlInSeconds * 1000;
		this.cache.set(key, { value, expiresAt });
	}

	async delete(key: string): Promise<void> {
		this.cache.delete(key);
	}

	async deleteByPattern(pattern: string): Promise<void> {
		const regexPattern = pattern.replace(/\*/g, ".*").replace(/\?/g, ".");

		const regex = new RegExp(`^${regexPattern}$`);

		for (const key of this.cache.keys()) {
			if (regex.test(key)) {
				this.cache.delete(key);
			}
		}
	}

	async exists(key: string): Promise<boolean> {
		const item = this.cache.get(key);

		if (!item) return false;

		if (Date.now() > item.expiresAt) {
			this.cache.delete(key);
			return false;
		}

		return true;
	}

	async clear(): Promise<void> {
		this.cache.clear();
	}

	async getTtl(key: string): Promise<number> {
		const item = this.cache.get(key);

		if (!item) return -1;

		const ttl = Math.floor((item.expiresAt - Date.now()) / 1000);

		if (ttl <= 0) {
			this.cache.delete(key);
			return -1;
		}

		return ttl;
	}
}
