import { injectable } from "tsyringe";
import type { z } from "zod";
import {
	type ProjectValidationId,
	projectSchemas,
} from "@/project/validation/schemas/ZodSchema";
import {
	type TaskValidationId,
	taskSchemas,
} from "@/task/validation/schemas/ZodSchema";
import type {
	ValidationId,
	ValidationProvider,
	ValidationResult,
} from "./ValidationProvider";

@injectable()
export class ZodValidationProvider implements ValidationProvider {
	validate<T>(
		schemaId: ValidationId,
		data: unknown,
		context: string,
	): ValidationResult<T> {
		try {
			let zodSchema: z.ZodSchema<T> | null = null;

			if (schemaId in projectSchemas) {
				zodSchema = projectSchemas[
					schemaId as ProjectValidationId
				] as z.ZodSchema<T>;
			}

			if (schemaId in taskSchemas) {
				zodSchema = taskSchemas[schemaId as TaskValidationId] as z.ZodSchema<T>;
			}

			if (!zodSchema) {
				throw new Error(`Unknown schema ID: ${schemaId}`);
			}

			const result = zodSchema.safeParse(data);

			if (result.success) {
				return {
					success: true,
					data: result.data,
				};
			}

			const firstError = result.error.issues[0];
			const field = firstError.path.join(".") || context;

			return {
				success: false,
				error: {
					field,
					message: firstError.message,
					value: data,
				},
			};
		} catch (error) {
			return {
				success: false,
				error: {
					field: context,
					message: error instanceof Error ? error.message : "Validation failed",
					value: data,
				},
			};
		}
	}
}
