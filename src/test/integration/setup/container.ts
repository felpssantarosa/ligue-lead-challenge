import { container } from "tsyringe";
import type { CacheProvider } from "@/shared/cache";
import { MockCacheProvider } from "@/test/mocks/cache/MockCacheProvider";
import { createTestDatabase, setupTestDatabase } from "./database";

export const setupIntegrationContainer = async (): Promise<void> => {
	await setupTestDatabase();

	const sequelize = createTestDatabase();

	// First call the regular registration
	const { registerDependencies } = await import(
		"@/shared/infra/container/config"
	);
	registerDependencies(sequelize);

	// Then override the cache provider with our mock
	container.registerInstance<CacheProvider>(
		"CacheProvider",
		new MockCacheProvider(),
	);
};

export const cleanupIntegrationContainer = (): void => {
	const { container } = require("tsyringe");
	container.clearInstances();
};
