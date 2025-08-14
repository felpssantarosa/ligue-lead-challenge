import { ConflictError } from "@/shared/Errors";

describe("ConflictError", () => {
	it("should create a conflict error for duplicate project title", () => {
		const error = ConflictError.projectTitleExists("My Project");

		expect(error.name).toBe("ConflictError");
		expect(error.httpCode).toBe(409);
		expect(error.resourceType).toBe("Project");
		expect(error.conflictingField).toBe("title");
		expect(error.conflictingValue).toBe("My Project");
	});

	it("should create a conflict error for concurrent modification", () => {
		const error = ConflictError.concurrentModification("Project", "123");

		expect(error.resourceType).toBe("Project");
		expect(error.resourceId).toBe("123");
		expect(error.message).toContain("modified by another process");
	});
});
