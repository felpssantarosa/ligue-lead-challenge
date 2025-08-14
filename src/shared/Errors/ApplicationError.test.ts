import { ApplicationError, ErrorTypeDictionary } from "@/shared/Errors";

describe("ApplicationError", () => {
	it("should create an application error with correct properties", () => {
		const error = new ApplicationError({
			message: "Database connection failed",
			trace: "ProjectService.create",
		});

		expect(error.name).toBe("ApplicationError");
		expect(error.httpCode).toBe(500);
		expect(error.type).toEqual(ErrorTypeDictionary.UNEXPECTED);
		expect(error.message).toContain(
			"[ProjectService.create] An Unexpected Application Error Happened",
		);
		expect(error.message).toContain("Database connection failed");
	});

	it("should format the error message correctly", () => {
		const error = new ApplicationError({
			message: "Something went wrong",
			trace: "UserController.update",
		});

		expect(error.message).toBe(
			"[UserController.update] An Unexpected Application Error Happened: Something went wrong",
		);
	});

	it("should inherit from Error class", () => {
		const error = new ApplicationError({
			message: "Test error",
			trace: "TestService",
		});

		expect(error instanceof Error).toBe(true);
		expect(error instanceof ApplicationError).toBe(true);
	});
});
