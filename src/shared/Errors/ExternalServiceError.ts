import { type ErrorType, ErrorTypeDictionary } from "./ApplicationError";

type ExternalServiceErrorParams = {
	message: string;
	serviceName: string;
	operation?: string;
	statusCode?: number;
	responseBody?: string;
	timeout?: boolean;
	trace?: string;
};

export class ExternalServiceError extends Error {
	public readonly httpCode: number;
	public readonly type: ErrorType;
	public readonly serviceName: string;
	public readonly operation?: string;
	public readonly statusCode?: number;
	public readonly responseBody?: string;
	public readonly timeout?: boolean;

	constructor({
		message,
		serviceName,
		operation,
		statusCode,
		responseBody,
		timeout,
		trace = "ExternalServiceError",
	}: ExternalServiceErrorParams) {
		const customMessage = `[${trace}] External Service Error (${serviceName}): ${message}`;

		super(customMessage);
		this.name = "ExternalServiceError";
		this.type = ErrorTypeDictionary.EXTERNAL_SERVICE_ERROR;
		this.httpCode = ErrorTypeDictionary.EXTERNAL_SERVICE_ERROR.httpCode;
		this.serviceName = serviceName;
		this.operation = operation;
		this.statusCode = statusCode;
		this.responseBody = responseBody;
		this.timeout = timeout;
	}

	static timeout(
		serviceName: string,
		operation: string,
		timeoutMs: number,
		trace?: string,
	): ExternalServiceError {
		return new ExternalServiceError({
			message: `Request to ${serviceName} timed out after ${timeoutMs}ms during ${operation}`,
			serviceName,
			operation,
			timeout: true,
			trace,
		});
	}

	static httpError(
		serviceName: string,
		operation: string,
		statusCode: number,
		responseBody?: string,
		trace?: string,
	): ExternalServiceError {
		return new ExternalServiceError({
			message: `HTTP ${statusCode} error from ${serviceName} during ${operation}`,
			serviceName,
			operation,
			statusCode,
			responseBody,
			trace,
		});
	}

	static connectionRefused(
		serviceName: string,
		operation: string,
		trace?: string,
	): ExternalServiceError {
		return new ExternalServiceError({
			message: `Connection refused to ${serviceName} during ${operation}`,
			serviceName,
			operation,
			trace,
		});
	}

	static githubApiError(
		operation: string,
		statusCode?: number,
		responseBody?: string,
		trace?: string,
	): ExternalServiceError {
		return new ExternalServiceError({
			message: `GitHub API error during ${operation}`,
			serviceName: "GitHub",
			operation,
			statusCode,
			responseBody,
			trace,
		});
	}

	static rateLimitExceeded(
		serviceName: string,
		retryAfter?: number,
		trace?: string,
	): ExternalServiceError {
		const message = retryAfter
			? `Rate limit exceeded for ${serviceName}. Retry after ${retryAfter} seconds`
			: `Rate limit exceeded for ${serviceName}`;

		return new ExternalServiceError({
			message,
			serviceName,
			statusCode: 429,
			trace,
		});
	}

	static authenticationFailed(
		serviceName: string,
		operation: string,
		trace?: string,
	): ExternalServiceError {
		return new ExternalServiceError({
			message: `Authentication failed for ${serviceName} during ${operation}`,
			serviceName,
			operation,
			statusCode: 401,
			trace,
		});
	}
}
