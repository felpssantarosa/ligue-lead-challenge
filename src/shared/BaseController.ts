import type { Response } from "express";
import {
	getErrorInfo,
	isBusinessRuleError,
	isConflictError,
	isExternalServiceError,
	isNotFoundError,
	isUnauthorizedError,
	isValidationError,
} from "@/shared/Errors";

export abstract class BaseController {
	protected handleError(error: unknown, res: Response, context: string): void {
		console.error(`[${context}] Error:`, getErrorInfo(error));

		if (isValidationError(error)) {
			res.status(error.httpCode).json({
				success: false,
				error: {
					type: error.type.name,
					message: error.message,
					field: error.field,
					value: error.value,
				},
			});
			return;
		}

		if (isNotFoundError(error)) {
			res.status(error.httpCode).json({
				success: false,
				error: {
					type: error.type.name,
					message: error.message,
					resourceType: error.resourceType,
					resourceId: error.resourceId,
				},
			});
			return;
		}

		if (isUnauthorizedError(error)) {
			res.status(error.httpCode).json({
				success: false,
				error: {
					type: error.type.name,
					message: error.message,
					action: error.action,
					resource: error.resource,
				},
			});
			return;
		}

		if (isBusinessRuleError(error)) {
			res.status(error.httpCode).json({
				success: false,
				error: {
					type: error.type.name,
					message: error.message,
					rule: error.rule,
					context: error.context,
				},
			});
			return;
		}

		if (isExternalServiceError(error)) {
			res.status(error.httpCode).json({
				success: false,
				error: {
					type: error.type.name,
					message: error.message,
					serviceName: error.serviceName,
					operation: error.operation,
				},
			});
			return;
		}

		if (isConflictError(error)) {
			res.status(error.httpCode).json({
				success: false,
				error: {
					type: error.type.name,
					message: error.message,
					resourceType: error.resourceType,
					conflictingField: error.conflictingField,
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
					details: error instanceof Error ? error.message : String(error),
				}),
			},
		});
	}
}
