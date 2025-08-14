import { type ErrorType, ErrorTypeDictionary } from "./ApplicationError";

type UnauthorizedErrorParams = {
	message: string;
	action?: string;
	resource?: string;
	userId?: string;
	trace?: string;
};

export class UnauthorizedError extends Error {
	public readonly httpCode: number;
	public readonly type: ErrorType;
	public readonly action?: string;
	public readonly resource?: string;
	public readonly userId?: string;

	constructor({
		message,
		action,
		resource,
		userId,
		trace = "UnauthorizedError",
	}: UnauthorizedErrorParams) {
		const customMessage = `[${trace}] Unauthorized Access: ${message}`;

		super(customMessage);
		this.name = "UnauthorizedError";
		this.type = ErrorTypeDictionary.UNAUTHORIZED;
		this.httpCode = ErrorTypeDictionary.UNAUTHORIZED.httpCode;
		this.action = action;
		this.resource = resource;
		this.userId = userId;
	}

	static missingToken(trace?: string): UnauthorizedError {
		return new UnauthorizedError({
			message: "Authentication token is missing or invalid",
			trace,
		});
	}

	static expiredToken(trace?: string): UnauthorizedError {
		return new UnauthorizedError({
			message: "Authentication token has expired",
			trace,
		});
	}

	static invalidCredentials(trace?: string): UnauthorizedError {
		return new UnauthorizedError({
			message: "Invalid username or password",
			trace,
		});
	}

	static insufficientPermissions(
		action: string,
		resource: string,
		userId?: string,
		trace?: string,
	): UnauthorizedError {
		return new UnauthorizedError({
			message: `User does not have permission to ${action} ${resource}`,
			action,
			resource,
			userId,
			trace,
		});
	}

	static accountDisabled(userId: string, trace?: string): UnauthorizedError {
		return new UnauthorizedError({
			message: "User account is disabled or suspended",
			userId,
			trace,
		});
	}
}
