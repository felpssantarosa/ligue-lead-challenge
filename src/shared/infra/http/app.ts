import cors from "cors";
import express from "express";
import helmet from "helmet";
import { projectRoutes } from "@/project/infra/routes/projectRoutes";
import { taskRoutes } from "@/task/infra/routes/taskRoutes";

export const createApp = (): express.Application => {
	const app = express();

	// Middleware
	app.use(helmet());
	app.use(cors());
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));

	// Health check endpoint
	app.get("/health", (_, res) => {
		res.json({ status: "OK", timestamp: new Date().toISOString() });
	});

	// API routes
	app.use("/api/projects", projectRoutes);
	app.use("/api/projects", taskRoutes);

	// Global error handler
	app.use(
		(
			err: Error,
			_: express.Request,
			res: express.Response,
			__: express.NextFunction,
		) => {
			console.error("Unhandled error:", err);
			res.status(500).json({ error: "Internal server error" });
		},
	);

	// 404 handler
	app.use((_, res) => {
		res.status(404).json({ error: "Route not found" });
	});

	return app;
};
