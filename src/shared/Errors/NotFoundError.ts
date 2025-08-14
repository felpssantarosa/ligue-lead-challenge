import { type ErrorType, ErrorTypeDictionary } from "./ApplicationError";

type NotFoundErrorParams = {
	message: string;
	resourceType?: string;
	resourceId?: string;
	trace?: string;
};

export class NotFoundError extends Error {
	public readonly httpCode: number;
	public readonly type: ErrorType;
	public readonly resourceType?: string;
	public readonly resourceId?: string;

	constructor({
		message,
		resourceType,
		resourceId,
		trace = "NotFoundError",
	}: NotFoundErrorParams) {
		const customMessage = `[${trace}] Resource Not Found: ${message}`;

		super(customMessage);
		this.name = "NotFoundError";
		this.type = ErrorTypeDictionary.NOT_FOUND;
		this.httpCode = ErrorTypeDictionary.NOT_FOUND.httpCode;
		this.resourceType = resourceType;
		this.resourceId = resourceId;
	}

	static resource(
		resourceType: string,
		resourceId: string,
		trace?: string,
	): NotFoundError {
		return new NotFoundError({
			message: `${resourceType} with ID '${resourceId}' was not found`,
			resourceType,
			resourceId,
			trace,
		});
	}

	static project(projectId: string, trace?: string): NotFoundError {
		return NotFoundError.resource("Project", projectId, trace);
	}

	static task(taskId: string, trace?: string): NotFoundError {
		return NotFoundError.resource("Task", taskId, trace);
	}

	static user(userId: string, trace?: string): NotFoundError {
		return NotFoundError.resource("User", userId, trace);
	}

	static endpoint(path: string, trace?: string): NotFoundError {
		return new NotFoundError({
			message: `Endpoint '${path}' was not found`,
			resourceType: "Endpoint",
			resourceId: path,
			trace,
		});
	}
}
