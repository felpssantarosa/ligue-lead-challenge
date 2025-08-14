import { type ErrorType, ErrorTypeDictionary } from "./ApplicationError";

type ValidationErrorParams = {
	message: string;
	field?: string;
	value?: unknown;
	trace?: string;
};

export class ValidationError extends Error {
	public readonly httpCode: number;
	public readonly type: ErrorType;
	public readonly field?: string;
	public readonly value?: unknown;

	constructor({
		message,
		field,
		value,
		trace = "ValidationError",
	}: ValidationErrorParams) {
		const customMessage = `[${trace}] Validation Error: ${message}`;

		super(customMessage);
		this.name = "ValidationError";
		this.type = ErrorTypeDictionary.VALIDATION_ERROR;
		this.httpCode = ErrorTypeDictionary.VALIDATION_ERROR.httpCode;
		this.field = field;
		this.value = value;
	}

	static requiredField(fieldName: string, trace?: string): ValidationError {
		return new ValidationError({
			message: `${fieldName} is required`,
			field: fieldName,
			trace,
		});
	}

	static invalidFormat(
		fieldName: string,
		value: unknown,
		expectedFormat: string,
		trace?: string,
	): ValidationError {
		return new ValidationError({
			message: `${fieldName} has invalid format. Expected: ${expectedFormat}`,
			field: fieldName,
			value,
			trace,
		});
	}

	static invalidLength(
		fieldName: string,
		value: unknown,
		minLength?: number,
		maxLength?: number,
		trace?: string,
	): ValidationError {
		let message = `${fieldName} has invalid length`;

		if (minLength !== undefined && maxLength !== undefined) {
			message += `. Must be between ${minLength} and ${maxLength} characters`;
		} else if (minLength !== undefined) {
			message += `. Must be at least ${minLength} characters`;
		} else if (maxLength !== undefined) {
			message += `. Must be at most ${maxLength} characters`;
		}

		return new ValidationError({
			message,
			field: fieldName,
			value,
			trace,
		});
	}

	static invalidValue(
		fieldName: string,
		value: unknown,
		allowedValues: unknown[],
		trace?: string,
	): ValidationError {
		return new ValidationError({
			message: `${fieldName} has invalid value. Allowed values: ${allowedValues.join(", ")}`,
			field: fieldName,
			value,
			trace,
		});
	}
}
