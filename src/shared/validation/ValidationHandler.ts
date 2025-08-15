import { inject, injectable } from "tsyringe";
import { ApplicationError, ValidationError } from "@/shared/Errors";
import type {
	ValidationId,
	ValidationProvider,
} from "@/shared/validation/ValidationProvider";

@injectable()
export class ValidationHandler {
	constructor(
		@inject("ValidationProvider")
		private validationProvider: ValidationProvider,
	) {}

	execute<T>(schemaId: ValidationId, data: unknown, context: string): T {
		const result = this.validationProvider.validate<T>(schemaId, data, context);

		if (result.success) return result.data as T;

		if (result.error === undefined) {
			throw new ApplicationError({
				message: "Validation failed without an error object",
				trace: context,
			});
		}

		if (
			result.error.message.includes("required") ||
			result.error.message.includes("is required")
		) {
			throw ValidationError.requiredField(result.error.field, context);
		}

		throw ValidationError.invalidFormat(
			result.error.field,
			result.error.value,
			result.error.message,
			context,
		);
	}
}
