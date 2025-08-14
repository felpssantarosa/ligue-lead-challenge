import { UnauthorizedError } from "@/shared/Errors";

describe("UnauthorizedError", () => {
	it("should create an unauthorized error for missing token", () => {
		const error = UnauthorizedError.missingToken();

		expect(error.name).toBe("UnauthorizedError");
		expect(error.httpCode).toBe(401);
		expect(error.message).toContain("Authentication token is missing");
	});

	it("should create an unauthorized error for insufficient permissions", () => {
		const error = UnauthorizedError.insufficientPermissions(
			"delete",
			"Project",
			"user123",
		);

		expect(error.action).toBe("delete");
		expect(error.resource).toBe("Project");
		expect(error.userId).toBe("user123");
	});
});
