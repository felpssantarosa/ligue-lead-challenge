import { ValidationError } from "@/shared/Errors";

describe("ValidationError", () => {
	it("should create a validation error for required field", () => {
		const error = ValidationError.requiredField("title", "ProjectService");

		expect(error.name).toBe("ValidationError");
		expect(error.httpCode).toBe(400);
		expect(error.field).toBe("title");
		expect(error.message).toContain("title is required");
	});

	it("should create a validation error for invalid format", () => {
		const error = ValidationError.invalidFormat(
			"email",
			"invalid-email",
			"email format",
			"UserService",
		);

		expect(error.field).toBe("email");
		expect(error.value).toBe("invalid-email");
		expect(error.message).toContain("email has invalid format");
	});

	it("should create a validation error for invalid length", () => {
		const error = ValidationError.invalidLength("password", "123", 8, 50);

		expect(error.field).toBe("password");
		expect(error.value).toBe("123");
		expect(error.message).toContain("Must be between 8 and 50 characters");
	});
});
