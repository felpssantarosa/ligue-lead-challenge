import { injectable } from "tsyringe";
import type { z } from "zod";
import type {
	ValidationProvider,
	ValidationResult,
} from "./ValidationProvider";

@injectable()
export class ZodValidationProvider implements ValidationProvider {
	validate<T>(
		schema: unknown,
		data: unknown,
		context: string,
	): ValidationResult<T> {
		try {
			const zodSchema = schema as z.ZodSchema<T>;
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
