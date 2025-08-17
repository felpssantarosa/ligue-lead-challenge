import "reflect-metadata";
import { createSequelizeConnection } from "@/shared/infra/database/sequelize";
import { registerDependencies as registerCommonDependencies } from "./config";

export const registerDependencies = (): void => {
	const sequelize = createSequelizeConnection();

	registerCommonDependencies(sequelize);
};

export { registerDependencies as registerCommonDependencies } from "./config";
