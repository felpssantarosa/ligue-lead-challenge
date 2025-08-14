export {
	ApplicationError,
	type ErrorType,
	ErrorTypeDictionary,
} from "./ApplicationError";
export { BusinessRuleError } from "./BusinessRuleError";
export { ConflictError } from "./ConflictError";
export { ExternalServiceError } from "./ExternalServiceError";
export { NotFoundError } from "./NotFoundError";
export { UnauthorizedError } from "./UnauthorizedError";
export { ValidationError } from "./ValidationError";

import { ApplicationError } from "./ApplicationError";
import { BusinessRuleError } from "./BusinessRuleError";
import { ConflictError } from "./ConflictError";
import { ExternalServiceError } from "./ExternalServiceError";
import { NotFoundError } from "./NotFoundError";
import { UnauthorizedError } from "./UnauthorizedError";
import { ValidationError } from "./ValidationError";

export const isValidationError = (error: unknown): error is ValidationError => {
	return error instanceof ValidationError;
};

export const isNotFoundError = (error: unknown): error is NotFoundError => {
	return error instanceof NotFoundError;
};

export const isUnauthorizedError = (
	error: unknown,
): error is UnauthorizedError => {
	return error instanceof UnauthorizedError;
};

export const isBusinessRuleError = (
	error: unknown,
): error is BusinessRuleError => {
	return error instanceof BusinessRuleError;
};

export const isExternalServiceError = (
	error: unknown,
): error is ExternalServiceError => {
	return error instanceof ExternalServiceError;
};

export const isConflictError = (error: unknown): error is ConflictError => {
	return error instanceof ConflictError;
};

export const isApplicationError = (
	error: unknown,
): error is ApplicationError => {
	return error instanceof ApplicationError;
};

export const getErrorInfo = (error: unknown) => {
	if (isValidationError(error)) {
		return {
			type: error.type.name,
			httpCode: error.httpCode,
			field: error.field,
			value: error.value,
			message: error.message,
		};
	}

	if (isNotFoundError(error)) {
		return {
			type: error.type.name,
			httpCode: error.httpCode,
			resourceType: error.resourceType,
			resourceId: error.resourceId,
			message: error.message,
		};
	}

	if (isUnauthorizedError(error)) {
		return {
			type: error.type.name,
			httpCode: error.httpCode,
			action: error.action,
			resource: error.resource,
			userId: error.userId,
			message: error.message,
		};
	}

	if (isBusinessRuleError(error)) {
		return {
			type: error.type.name,
			httpCode: error.httpCode,
			rule: error.rule,
			context: error.context,
			message: error.message,
		};
	}

	if (isExternalServiceError(error)) {
		return {
			type: error.type.name,
			httpCode: error.httpCode,
			serviceName: error.serviceName,
			operation: error.operation,
			statusCode: error.statusCode,
			timeout: error.timeout,
			message: error.message,
		};
	}

	if (isConflictError(error)) {
		return {
			type: error.type.name,
			httpCode: error.httpCode,
			resourceType: error.resourceType,
			resourceId: error.resourceId,
			conflictingField: error.conflictingField,
			conflictingValue: error.conflictingValue,
			message: error.message,
		};
	}

	if (isApplicationError(error)) {
		return {
			type: error.type.name,
			httpCode: error.httpCode,
			message: error.message,
		};
	}

	if (error instanceof Error) {
		return {
			type: "UNKNOWN_ERROR",
			httpCode: 500,
			message: error.message,
			name: error.name,
			stack: error.stack,
		};
	}

	return {
		type: "UNKNOWN_ERROR",
		httpCode: 500,
		message: "An unknown error occurred",
		error: String(error),
	};
};
