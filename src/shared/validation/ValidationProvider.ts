export interface ValidationResult<T> {
	success: boolean;
	data?: T;
	error?: {
		field: string;
		message: string;
		value?: unknown;
	};
}

export interface ValidationProvider {
	validate<T>(
		schema: unknown,
		data: unknown,
		context: string,
	): ValidationResult<T>;
}
