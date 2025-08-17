import "reflect-metadata";
import { container } from "tsyringe";
import { config } from "@/config/environment";
import type { CacheProvider } from "@/shared/cache";
import { registerDependencies } from "@/shared/infra/container";
import { createSequelizeConnection } from "@/shared/infra/database/sequelize";
import { createApp } from "@/shared/infra/http/app";

async function bootstrap(): Promise<void> {
	try {
		registerDependencies();

		const sequelize = createSequelizeConnection();
		await sequelize.authenticate();
		console.log("Database connection established successfully.");

		if (config.nodeEnv === "development") {
			await sequelize.sync({ force: false });
			console.log("Database synchronized.");
		}

		const app = createApp();

		const server = app.listen(config.port, () => {
			console.log(`Server is running on port ${config.port}`);
			console.log(`Environment: ${config.nodeEnv}`);
			console.log(`Health check: http://localhost:${config.port}/health`);
		});

		const gracefulShutdown = async (signal: string): Promise<void> => {
			console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

			server.close(async () => {
				console.log("HTTP server closed.");

				try {
					// Close Redis connection
					const cacheProvider =
						container.resolve<CacheProvider>("CacheProvider");
					if (
						"disconnect" in cacheProvider &&
						typeof cacheProvider.disconnect === "function"
					) {
						await (
							cacheProvider as { disconnect: () => Promise<void> }
						).disconnect();
						console.log("Cache connection closed.");
					}

					await sequelize.close();
					console.log("Database connection closed.");
					process.exit(0);
				} catch (error) {
					console.error("Error during shutdown:", error);
					process.exit(1);
				}
			});
		};

		process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
		process.on("SIGINT", () => gracefulShutdown("SIGINT"));
	} catch (error) {
		console.error("Failed to start the application:", error);
		process.exit(1);
	}
}

bootstrap().catch((error) => {
	console.error("Bootstrap failed:", error);
	process.exit(1);
});
