import cors from "cors";
import express from "express";
import helmet from "helmet";
import { config } from "@/config/environment";
import { projectRoutes } from "@/project/infra/routes/ProjectRoutes";
import {
	getErrorInfo,
	isBusinessRuleError,
	isConflictError,
	isExternalServiceError,
	isNotFoundError,
	isUnauthorizedError,
	isValidationError,
} from "@/shared/Errors";
import {
	taskRoutes,
	taskRoutesBoundByProject,
} from "@/task/infra/routes/taskRoutes";
import { authRoutes } from "@/user/infra/routes/AuthRoutes";

export const createApp = (): express.Application => {
	const app = express();

	app.use(helmet());
	app.use(
		cors({
			origin: config.cors.origin === "*" ? true : config.cors.origin.split(","),
			credentials: config.cors.credentials,
			methods: config.cors.methods.split(","),
			allowedHeaders: config.cors.allowedHeaders.split(","),
			preflightContinue: config.cors.preflightContinue,
			optionsSuccessStatus: config.cors.optionsSuccessStatus,
		}),
	);
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));

	app.get("/health", (_, res) => {
		res.json({ status: "OK", timestamp: new Date().toISOString() });
	});

	// Auth
	app.use("/auth", authRoutes);

	// Project
	app.use("/api/projects", projectRoutes);

	// Task
	app.use("/api/projects", taskRoutesBoundByProject);
	app.use("/api/tasks", taskRoutes);

	app.use(
		(
			err: Error,
			_: express.Request,
			res: express.Response,
			__: express.NextFunction,
		) => {
			console.error("[GlobalErrorHandler] Error:", getErrorInfo(err));

			if (isValidationError(err)) {
				res.status(err.httpCode).json({
					success: false,
					error: {
						type: err.type.name,
						message: err.message,
						field: err.field,
						value: err.value,
					},
				});
				return;
			}

			if (isNotFoundError(err)) {
				res.status(err.httpCode).json({
					success: false,
					error: {
						type: err.type.name,
						message: err.message,
						resourceType: err.resourceType,
						resourceId: err.resourceId,
					},
				});
				return;
			}

			if (isUnauthorizedError(err)) {
				res.status(err.httpCode).json({
					success: false,
					error: {
						type: err.type.name,
						message: err.message,
						action: err.action,
						resource: err.resource,
					},
				});
				return;
			}

			if (isBusinessRuleError(err)) {
				res.status(err.httpCode).json({
					success: false,
					error: {
						type: err.type.name,
						message: err.message,
						rule: err.rule,
						context: err.context,
					},
				});
				return;
			}

			if (isExternalServiceError(err)) {
				res.status(err.httpCode).json({
					success: false,
					error: {
						type: err.type.name,
						message: err.message,
						serviceName: err.serviceName,
						operation: err.operation,
					},
				});
				return;
			}

			if (isConflictError(err)) {
				res.status(err.httpCode).json({
					success: false,
					error: {
						type: err.type.name,
						message: err.message,
						resourceType: err.resourceType,
						conflictingField: err.conflictingField,
					},
				});
				return;
			}

			res.status(500).json({
				success: false,
				error: {
					type: "UNEXPECTED_ERROR",
					message: "An unexpected error occurred",
					...(process.env.NODE_ENV === "development" && {
						details: err instanceof Error ? err.message : String(err),
					}),
				},
			});
		},
	);

	app.use((_: express.Request, res: express.Response) => {
		res.status(404).json({
			success: false,
			error: {
				type: "NOT_FOUND",
				message: "The requested resource was not found",
			},
		});
	});

	return app;
};
