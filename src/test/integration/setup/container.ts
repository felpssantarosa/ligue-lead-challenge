import { registerDependencies as registerCommonDependencies } from "@/shared/infra/container/config";
import { createTestDatabase, setupTestDatabase } from "./database";

export const setupIntegrationContainer = async (): Promise<void> => {
	await setupTestDatabase();

	const sequelize = createTestDatabase();

	registerCommonDependencies(sequelize);
};

export const cleanupIntegrationContainer = (): void => {
	const { container } = require("tsyringe");
	container.clearInstances();
};
