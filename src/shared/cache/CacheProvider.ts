export interface CacheProvider {
	get<T>(key: string): Promise<T | null>;
	set<T>(key: string, value: T, ttlInSeconds?: number): Promise<void>;
	delete(key: string): Promise<void>;
	deleteByPattern(pattern: string): Promise<void>;
	exists(key: string): Promise<boolean>;
	clear(): Promise<void>;
	getTtl(key: string): Promise<number>;
}
