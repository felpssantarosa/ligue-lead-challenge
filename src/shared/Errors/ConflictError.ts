import { type ErrorType, ErrorTypeDictionary } from "./ApplicationError";

type ConflictErrorParams = {
	message: string;
	resourceType?: string;
	resourceId?: string;
	conflictingField?: string;
	conflictingValue?: unknown;
	trace?: string;
};

export class ConflictError extends Error {
	public readonly httpCode: number;
	public readonly type: ErrorType;
	public readonly resourceType?: string;
	public readonly resourceId?: string;
	public readonly conflictingField?: string;
	public readonly conflictingValue?: unknown;

	constructor({
		message,
		resourceType,
		resourceId,
		conflictingField,
		conflictingValue,
		trace = "ConflictError",
	}: ConflictErrorParams) {
		const customMessage = `[${trace}] Resource Conflict: ${message}`;

		super(customMessage);
		this.name = "ConflictError";
		this.type = ErrorTypeDictionary.CONFLICT;
		this.httpCode = ErrorTypeDictionary.CONFLICT.httpCode;
		this.resourceType = resourceType;
		this.resourceId = resourceId;
		this.conflictingField = conflictingField;
		this.conflictingValue = conflictingValue;
	}

	static duplicateResource(
		resourceType: string,
		field: string,
		value: unknown,
		trace?: string,
	): ConflictError {
		return new ConflictError({
			message: `${resourceType} with ${field} '${String(value)}' already exists`,
			resourceType,
			conflictingField: field,
			conflictingValue: value,
			trace,
		});
	}

	static projectTitleExists(title: string, trace?: string): ConflictError {
		return ConflictError.duplicateResource("Project", "title", title, trace);
	}

	static concurrentModification(
		resourceType: string,
		resourceId: string,
		trace?: string,
	): ConflictError {
		return new ConflictError({
			message: `${resourceType} '${resourceId}' was modified by another process. Please refresh and try again`,
			resourceType,
			resourceId,
			trace,
		});
	}

	static staleVersion(
		resourceType: string,
		resourceId: string,
		expectedVersion: number,
		actualVersion: number,
		trace?: string,
	): ConflictError {
		return new ConflictError({
			message: `${resourceType} '${resourceId}' version mismatch. Expected: ${expectedVersion}, Actual: ${actualVersion}`,
			resourceType,
			resourceId,
			conflictingField: "version",
			conflictingValue: { expected: expectedVersion, actual: actualVersion },
			trace,
		});
	}

	static resourceLocked(
		resourceType: string,
		resourceId: string,
		lockedBy?: string,
		trace?: string,
	): ConflictError {
		const message = lockedBy
			? `${resourceType} '${resourceId}' is currently locked by '${lockedBy}'`
			: `${resourceType} '${resourceId}' is currently locked`;

		return new ConflictError({
			message,
			resourceType,
			resourceId,
			conflictingField: "lockedBy",
			conflictingValue: lockedBy,
			trace,
		});
	}
}
