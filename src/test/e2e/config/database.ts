import { Sequelize } from "sequelize-typescript";
import { ProjectModel } from "@/project/infra";
import { TaskModel } from "@/task/infra";

let testSequelize: Sequelize;

export const createTestDatabase = (): Sequelize => {
	if (!testSequelize) {
		testSequelize = new Sequelize({
			dialect: "sqlite",
			storage: ":memory:",
			models: [ProjectModel, TaskModel],
			logging: false,
			sync: { force: true },
		});
	}

	return testSequelize;
};

export const setupTestDatabase = async (): Promise<void> => {
	const sequelize = createTestDatabase();
	await sequelize.authenticate();
	await sequelize.sync({ force: true });
};

export const teardownTestDatabase = async (): Promise<void> => {
	if (testSequelize) {
		await testSequelize.close();
		testSequelize = undefined as unknown as Sequelize;
	}
};

export const cleanTestDatabase = async (): Promise<void> => {
	if (testSequelize) {
		await testSequelize.sync({ force: true });
	}
};

export { testSequelize };
