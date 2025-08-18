import { Sequelize } from "sequelize-typescript";
import { config } from "@/config/environment";
import ProjectModel from "@/project/infra/database/models/SequelizeProjectModel";
import TaskModel from "@/task/infra/database/models/SequelizeTaskModel";
import UserModel from "@/user/infra/database/models/SequelizeUserModel";

let sequelize: Sequelize;

export const createSequelizeConnection = (): Sequelize => {
	if (!sequelize) {
		sequelize = new Sequelize({
			dialect: "mysql",
			host: config.database.host,
			port: config.database.port,
			username: config.database.user,
			password: config.database.password,
			database: config.database.name,
			models: [ProjectModel, TaskModel, UserModel],
			logging: config.nodeEnv === "development" ? console.log : false,
		});
	}

	return sequelize;
};

export const closeSequelizeConnection = async (): Promise<void> => {
	if (sequelize) {
		await sequelize.close();
	}
};

export { sequelize };
