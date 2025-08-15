import type { ProjectValidationId } from "@/project/validation/schemas/zod";
import type { TaskValidationId } from "@/task/validation/schemas/zod";

export interface ValidationResult<T> {
	success: boolean;
	data?: T;
	error?: {
		field: string;
		message: string;
		value?: unknown;
	};
}

export type ValidationId = ProjectValidationId | TaskValidationId;

export interface ValidationProvider {
	validate<T>(
		schemaId: ValidationId,
		data: unknown,
		context: string,
	): ValidationResult<T>;
}
