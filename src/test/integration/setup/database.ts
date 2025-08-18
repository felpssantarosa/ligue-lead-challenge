import { Sequelize } from "sequelize-typescript";
import ProjectModel from "@/project/infra/database/models/SequelizeProjectModel";
import TaskModel from "@/task/infra/database/models/SequelizeTaskModel";
import UserModel from "@/user/infra/database/models/SequelizeUserModel";

let testSequelize: Sequelize | null = null;

export const createTestDatabase = (): Sequelize => {
	if (!testSequelize) {
		testSequelize = new Sequelize({
			dialect: "sqlite",
			storage: ":memory:",
			models: [ProjectModel, TaskModel, UserModel],
			logging: false,
		});
	}

	return testSequelize;
};

export const setupTestDatabase = async (): Promise<void> => {
	const sequelize = createTestDatabase();
	await sequelize.authenticate();
	await sequelize.sync({ force: true });
};

export const cleanTestDatabase = async (): Promise<void> => {
	if (testSequelize) {
		await testSequelize.sync({ force: true });
	}
};

export const closeTestDatabase = async (): Promise<void> => {
	if (testSequelize) {
		await testSequelize.close();
		testSequelize = null;
	}
};
