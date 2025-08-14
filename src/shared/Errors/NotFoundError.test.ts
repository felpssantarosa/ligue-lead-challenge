import { NotFoundError } from "@/shared/Errors";

describe("NotFoundError", () => {
	it("should create a not found error for project", () => {
		const error = NotFoundError.project("123");

		expect(error.name).toBe("NotFoundError");
		expect(error.httpCode).toBe(404);
		expect(error.resourceType).toBe("Project");
		expect(error.resourceId).toBe("123");
		expect(error.message).toContain("Project with ID '123' was not found");
	});

	it("should create a not found error for task", () => {
		const error = NotFoundError.task("456");

		expect(error.resourceType).toBe("Task");
		expect(error.resourceId).toBe("456");
	});
});
