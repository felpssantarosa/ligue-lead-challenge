export type ErrorType = {
	name: string;
	httpCode: number;
};

type ErrorTypes = {
	[key: string]: ErrorType;
};

export const ErrorTypeDictionary: ErrorTypes = {
	VALIDATION_ERROR: {
		name: "VALIDATION_ERROR",
		httpCode: 400,
	},
	NOT_FOUND: {
		name: "NOT_FOUND",
		httpCode: 404,
	},
	UNAUTHORIZED: {
		name: "UNAUTHORIZED",
		httpCode: 401,
	},
	FORBIDDEN: {
		name: "FORBIDDEN",
		httpCode: 403,
	},
	CONFLICT: {
		name: "CONFLICT",
		httpCode: 409,
	},
	BUSINESS_RULE_VIOLATION: {
		name: "BUSINESS_RULE_VIOLATION",
		httpCode: 422,
	},
	EXTERNAL_SERVICE_ERROR: {
		name: "EXTERNAL_SERVICE_ERROR",
		httpCode: 502,
	},
	RATE_LIMIT_EXCEEDED: {
		name: "RATE_LIMIT_EXCEEDED",
		httpCode: 429,
	},
	UNEXPECTED: {
		name: "UNEXPECTED",
		httpCode: 500,
	},
};

type ApplicationErrorParams = {
	message: string;
	trace: string;
};

export class ApplicationError extends Error {
	public readonly httpCode: number;
	public readonly type: ErrorType;

	constructor({ message, trace }: ApplicationErrorParams) {
		const customMessage = `[${trace}] An Unexpected Application Error Happened: ${message}`;

		super(customMessage);
		this.name = "ApplicationError";
		this.type = ErrorTypeDictionary.UNEXPECTED;
		this.httpCode = ErrorTypeDictionary.UNEXPECTED.httpCode;
	}
}
