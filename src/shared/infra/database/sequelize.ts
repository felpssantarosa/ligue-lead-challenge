import { Sequelize } from "sequelize-typescript";
import { config } from "@/config/environment";

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
			models: [__dirname + "/models/*.model.ts"],
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
