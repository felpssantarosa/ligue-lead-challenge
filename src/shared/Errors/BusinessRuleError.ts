import { type ErrorType, ErrorTypeDictionary } from "./ApplicationError";

type BusinessRuleErrorParams = {
	message: string;
	rule: string;
	context?: Record<string, unknown>;
	trace?: string;
};

export class BusinessRuleError extends Error {
	public readonly httpCode: number;
	public readonly type: ErrorType;
	public readonly rule: string;
	public readonly context?: Record<string, unknown>;

	constructor({
		message,
		rule,
		context,
		trace = "BusinessRuleError",
	}: BusinessRuleErrorParams) {
		const customMessage = `[${trace}] Business Rule Violation (${rule}): ${message}`;

		super(customMessage);
		this.name = "BusinessRuleError";
		this.type = ErrorTypeDictionary.BUSINESS_RULE_VIOLATION;
		this.httpCode = ErrorTypeDictionary.BUSINESS_RULE_VIOLATION.httpCode;
		this.rule = rule;
		this.context = context;
	}

	static projectLimitExceeded(
		currentCount: number,
		maxAllowed: number,
		userId: string,
		trace?: string,
	): BusinessRuleError {
		return new BusinessRuleError({
			message: `Cannot create more projects. User has ${currentCount} projects but maximum allowed is ${maxAllowed}`,
			rule: "PROJECT_LIMIT_EXCEEDED",
			context: { currentCount, maxAllowed, userId },
			trace,
		});
	}

	static taskStatusTransitionNotAllowed(
		fromStatus: string,
		toStatus: string,
		taskId: string,
		trace?: string,
	): BusinessRuleError {
		return new BusinessRuleError({
			message: `Cannot transition task from '${fromStatus}' to '${toStatus}'`,
			rule: "INVALID_STATUS_TRANSITION",
			context: { fromStatus, toStatus, taskId },
			trace,
		});
	}

	static projectNotEmpty(
		projectId: string,
		taskCount: number,
		trace?: string,
	): BusinessRuleError {
		return new BusinessRuleError({
			message: `Cannot delete project with ${taskCount} tasks. Remove all tasks first`,
			rule: "PROJECT_NOT_EMPTY",
			context: { projectId, taskCount },
			trace,
		});
	}

	static duplicateResource(
		resourceType: string,
		identifier: string,
		conflictingField: string,
		trace?: string,
	): BusinessRuleError {
		return new BusinessRuleError({
			message: `${resourceType} with ${conflictingField} '${identifier}' already exists`,
			rule: "DUPLICATE_RESOURCE",
			context: { resourceType, identifier, conflictingField },
			trace,
		});
	}

	static resourceInUse(
		resourceType: string,
		resourceId: string,
		dependentType: string,
		dependentCount: number,
		trace?: string,
	): BusinessRuleError {
		return new BusinessRuleError({
			message: `Cannot delete ${resourceType} because it has ${dependentCount} associated ${dependentType}(s)`,
			rule: "RESOURCE_IN_USE",
			context: { resourceType, resourceId, dependentType, dependentCount },
			trace,
		});
	}
}
